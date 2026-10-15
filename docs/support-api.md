# Support API

SupportModule exposes public published notices/FAQs and private member inquiries using the existing notices collection.

- `getSupportNotices(input)`: ACTIVE FAQ, TERMS and ANNOUNCEMENT only; INQUIRY filters are rejected. Stable newest-first pagination, limit 1–50.
- `getMyInquiries(input)`: authenticated memberId + INQUIRY, excluding DELETE. No caller-provided ownership filter.
- `createSupportInquiry(input)`: trimmed subject 3–100 and content 10–2000 characters, UUID v4 requestId. Server assigns memberId, INQUIRY and HOLD.

The partial unique index on memberId/requestId excludes historical notices without requestId. Upsert retries return the original record; concurrent duplicate-key retries read that record. Reusing requestId with different content returns a conflict. Creating an inquiry emits an admin personal-message notification in the same transaction. No external email is sent.

`noticeResponse` and `respondedAt` are optional fields for replies displayed privately. Public output does not expose memberId, requestId or noticeRevision. Records are never seeded into the live database by tests.

Stage 13 administration uses RolesGuard + ADMIN on every operation:

- `getSupportByAdmin`: required category, optional status, newest-first pagination. Default excludes archived records; the admin-only output exposes memberId and noticeRevision.
- `createSupportByAdmin`: FAQ, TERMS or ANNOUNCEMENT only, HOLD or ACTIVE; server assigns the actor. The same member/requestId partial unique index deduplicates retries. Changed content/category/status for a reused identity returns conflict.
- `updateSupportByAdmin`: public categories only, immutable category/member, validated title/content/status; DELETE is recoverable archive. An atomic expectedRevision predicate and increment reject stale concurrent edits.
- `replySupportByAdmin`: non-archived INQUIRY only, 10–2000 trimmed characters. Saves noticeResponse/respondedAt and ACTIVE (answered), preserving private category and member ownership. Uses the same atomic revision check.

Historical records without a revision are exposed as revision 0 and accepted by the first conditional edit. Replies remain visible only to their member and administrators. These admin operations do not emit notifications or external emails; creating a member inquiry is the separate notification-producing operation described above. Tests cover admin guards, private/public boundaries, validation and concurrent-edit conflicts using a real GraphQL schema and mocked storage.

Notification listing/count/read APIs retain authenticated receiver scoping. Support tests use isolated model mocks and a real Nest GraphQL schema, plus service privacy tests for notification receivers. Run:

```sh
npm test -- --runInBand --watchman=false --runTestsByPath apps/hotelia-api/test/support/support-api.spec.ts apps/hotelia-api/test/support/notification-privacy.spec.ts
```
