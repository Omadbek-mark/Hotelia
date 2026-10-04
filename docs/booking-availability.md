# Booking and availability

## Current API

- `createBooking(input: BookingInput!)` requires authentication and creates a PENDING reservation.
- `confirmBooking(bookingId)` and `completeBooking(bookingId)` require HOTEL_OWNER role and ownership of the booking's hotel.
- `cancelBooking(bookingId)` requires authentication and permits the booking member or that hotel's owner. ADMIN does not bypass ownership.
- `getBooking(bookingId)` and `getMyBookings(input)` require authentication and return only the requesting member's bookings. Hotel owners and admins do not gain access to other members' reservations through these queries.
- `getAvailableRooms(input)` is public and read-only. It is an estimate at query time, not an inventory hold.

## Dates and inventory

- Inputs use hotel-local calendar dates (`YYYY-MM-DD`). MongoDB stores those dates as UTC midnight markers, not actual arrival/departure instants. GraphQL output serializes the markers as ISO timestamps.
- Stays are checkout-exclusive: `[checkIn, checkOut)`. The maximum stay is 365 nights.
- Check-in may be today in the hotel's timezone, but not earlier.
- `guests` is the total number of guests; `rooms` is the requested number of identical rooms from one Room offer. Capacity requires `roomCapacity >= ceil(guests / rooms)`.
- Only ACTIVE hotels and ACTIVE rooms may receive new bookings.
- CONFIRMED bookings and unexpired PENDING bookings consume inventory. A new PENDING reservation holds inventory for 15 minutes (`expiresAt`). Legacy PENDING records without an expiry conservatively continue consuming inventory.
- Expiry releases inventory through the query filter; there is no TTL deletion of booking history. The stored status currently remains PENDING after expiry. Clients should inspect `expiresAt` as well as status. Confirmation rejects an expired hold and uses the same transaction locking protocol.
- `availableQuantity` is the minimum remaining quantity over all requested nights. Consecutive reservations are not summed as if they occupied the same night.
- Availability is filtered before sorting and pagination. `metaCounter` counts matching room offers, not physical rooms.

## USD prices

- All room prices are USD. New room prices accept at most two decimal places; extra decimal places are rejected rather than silently rounded.
- The server loads the current room price and computes `totalPrice = pricePerNight × nights × rooms` in integer cents. Overflow or loss of cent precision is rejected.
- `currency`, `pricePerNight`, `totalPrice`, and `nights` are server-owned snapshots. Later room price changes do not change existing booking prices. No tax, discount or payment calculation is included yet.
- Existing room values are not converted from another currency. Any pre-existing data must represent USD and meet the new precision rule.

## Retry safety

- Every booking request requires a UUID v4 `requestId`, generated once per intended booking (for example `crypto.randomUUID()` in the frontend).
- Retrying the same member/requestId/details returns the existing booking without creating another hold or extending expiry. A changed payload with the same key returns Conflict.
- A genuinely new booking, including replacing an expired hold, needs a new requestId.
- A unique partial `{ memberId, requestId }` index enforces this at database level. Ensure schema indexes exist before enabling booking writes in environments where automatic indexing is disabled.

## Transactions and owner changes

- Booking creation runs in a transaction with snapshot reads and majority writes, so MongoDB must support transactions (replica set or sharded cluster; Atlas supports these).
- Creation writes internal `bookingVersion` counters on Hotel and Room before rechecking availability and inserting the booking. The fields are not exposed in GraphQL and do not change public `updatedAt` timestamps.
- Owner room updates/deletions acquire the same Hotel write lock in a transaction. Hotel deletion itself writes that Hotel in its transaction. Write conflicts cause transaction retries instead of allowing competing requests to reserve stale inventory.
- Locking is intentionally per hotel for this version: room mutations/bookings in the same hotel serialize, simplifying correctness at the cost of per-hotel write throughput.
- Inventory/capacity reductions and room/hotel deletion are rejected while inventory-consuming bookings exist. Reductions are conservatively blocked even if the proposed smaller inventory might fit current bookings. Increasing inventory or changing future room prices remains allowed.
- Pausing a room or hotel stops new bookings; it does not cancel existing bookings. Owners can still manage existing reservations at PAUSED hotels.

## Booking status transitions

- PENDING → CONFIRMED: only the hotel owner, before hold expiry, with check-in today or later in the hotel timezone. Legacy pending bookings with no expiry remain eligible because they still occupy inventory. Confirmation removes `expiresAt` and preserves the price snapshot.
- PENDING / CONFIRMED → CANCELLED: the booking member or hotel owner. Inventory is released and the historical record is retained. This version has no cancellation fee, refund, or cancellation deadline; no payment integration exists yet. An expired PENDING record may also be cancelled.
- CONFIRMED → COMPLETED: only the hotel owner, on or after the hotel-local check-out calendar date. There is no check-out time-of-day setting yet. A pending booking cannot be marked completed.
- CANCELLED and COMPLETED are terminal. Repeating a transition returns Conflict rather than reopening or changing the booking. The `requestId` retry behavior for creation remains unchanged.
- Confirmation and completion share the existing hotel transaction lock. Cancellation releases inventory using an atomic status-filtered update; it cannot overwrite completion, and a concurrent confirmation cannot resurrect a cancellation. No extra transaction is needed for this single-document release.
- Owner operations require a nondeleted owned hotel. The member may cancel their own eligible booking even if its hotel was subsequently soft-deleted.

## Validation

Unit and GraphQL tests cover DTOs, USD calculations, schema, dates/timezones, access control and query construction. The separate integration suite starts a real temporary MongoDB replica set and verifies aggregation results, parallel bookings, idempotency, expiry, owner restrictions and rollback.

Run the real database suite with:

```sh
npm run test:booking:integration
```

It may download a MongoDB binary on first run. It uses its own temporary database and never reads the application's `.env` or connects to Atlas. The suite is opt-in (`RUN_MONGO_INTEGRATION=1`) so ordinary unit test runs do not start a database.
