# Hotel reviews through CommentService

Reviews reuse `comments`, `CommentModule`, and the existing comment APIs. MEMBER, ARTICLE and legacy PROPERTY comments remain available.

- `createComment`: send `commentGroup: HOTEL`, `commentRefId: hotelId`, `bookingId`, integer `rating` 1–5 and `commentContent` (trimmed, 1–100 characters). The authenticated member must own that hotel's COMPLETED booking. New reviews require an ACTIVE hotel.
- `updateComment`: the author may edit content/rating or set `commentStatus: DELETE`. Booking/member/hotel identities cannot be changed. Deleted reviews cannot be restored or recreated for the same booking.
- `removeCommentByAdmin`: existing ADMIN guard applies. Hotel reviews are soft-deleted and the rating is recalculated. Legacy non-hotel removal behavior is unchanged.
- `getComments`: send `search: { commentGroup: HOTEL, commentRefId: hotelId }`, `page` and `limit` (maximum 100). Hotel reviews require an ACTIVE hotel. Omitting the group retains non-hotel comment listing behavior. Only ACTIVE comments contribute to the list and total; a missing author does not hide a review.
- `memberData` exposes only the author's public profile. Email, phone and passwords are excluded both from the aggregation projection and GraphQL type.

A partial unique index on `bookingId` for HOTEL comments enforces one review per completed booking, including after soft deletion. Existing property comments are not converted. Deploy the index where automatic index creation is disabled.

Review writes and `hotelReviews`/`hotelRating` updates run in one transaction. The existing internal Hotel `bookingVersion` write counter serializes updates to the same hotel; it is a concurrency mechanism, not a booking count. Rating is the average of ACTIVE HOTEL review ratings, with count and rating reset to zero when none remain. Authors/admins may edit/remove existing reviews even when the hotel is paused or soft-deleted.
