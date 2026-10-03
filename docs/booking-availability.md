# Booking and availability: current contract

- Booking schema and input/output DTOs exist. There is no booking creation mutation yet.
- Inputs use hotel-local calendar dates (`YYYY-MM-DD`). MongoDB stores those calendar dates as UTC midnight markers, not actual arrival/departure instants. Date fields in GraphQL output use ISO timestamps for these markers.
- Stays are checkout-exclusive: `[checkIn, checkOut)`. A maximum of 365 nights bounds per-night aggregation work.
- Check-in may be today in the hotel's timezone, but cannot be earlier.
- `guests` is the total number of guests and `rooms` the number of identical rooms requested from one Room offer. Capacity requires `roomCapacity >= ceil(guests / rooms)`.
- Only ACTIVE hotels and ACTIVE rooms are publicly searchable.
- PENDING and CONFIRMED bookings consume inventory. CANCELLED and COMPLETED do not. PENDING has no automatic expiry yet; expiry policy must be designed before exposing booking creation.
- `availableQuantity` is the minimum remaining quantity over all requested nights. Consecutive reservations are not summed as if they occupied the same night.
- Availability is filtered before sorting/pagination; `metaCounter` counts matching room offers, not physical rooms.
- The availability query is read-only and does not reserve inventory. It is not a guarantee that inventory remains free until a later booking request.

## Remaining before booking creation

Implement server-computed price snapshots with an explicit currency/rounding policy, authoritative availability checks and concurrent-write protection, booking status transitions, and restrictions on room inventory reductions/deletion when bookings exist. Reuse the same date and overlap semantics.

## Validation performed

DTO, schema, calendar/timezone, GraphQL authorization and aggregation-shape tests run locally. MongoDB calls are mocked in API tests; the per-night aggregation has not yet been executed against a real MongoDB instance. Before enabling booking writes, verify adjacent stays, partial overlaps, multi-room quantities and concurrent reservations against MongoDB.
