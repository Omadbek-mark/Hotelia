# Support API

SupportModule exposes public published notices/FAQs and private member inquiries using the existing notices collection.

- `getSupportNotices(input)`: ACTIVE FAQ, TERMS and ANNOUNCEMENT only; INQUIRY filters are rejected. Stable newest-first pagination, limit 1–50.
- `getMyInquiries(input)`: authenticated memberId + INQUIRY, excluding DELETE. No caller-provided ownership filter.
- `createSupportInquiry(input)`: trimmed subject 3–100 and content 10–2000 characters, UUID v4 requestId. Server assigns memberId, INQUIRY and HOLD.

The partial unique index on memberId/requestId excludes historical notices without requestId. Upsert retries return the original record; concurrent duplicate-key retries read that record. Reusing requestId with different content returns a conflict. No email, notification or external message is sent by creating an inquiry.

`noticeResponse` and `respondedAt` are optional fields for replies displayed privately. Admin publishing/reply operations are reserved for the administration stage. Public output does not expose memberId or requestId. Records are never seeded into the live database by tests.

Notification listing/count/read APIs retain authenticated receiver scoping. Support tests use isolated model mocks and a real Nest GraphQL schema, plus service privacy tests for notification receivers. Run:

```sh
npm test -- --runInBand --watchman=false --runTestsByPath apps/hotelia-api/test/support/support-api.spec.ts apps/hotelia-api/test/support/notification-privacy.spec.ts
```
