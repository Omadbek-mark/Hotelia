# Hotel favorites through LikeService

Hotel favorites reuse `LikeModule`, `LikeService`, `LikeSchema`, and the existing `likes` collection. A saved hotel is `{ memberId, likeRefId: hotelId, likeGroup: 'HOTEL' }`. There is no separate Favorite module or collection. Existing MEMBER/ARTICLE behavior remains available; legacy PROPERTY records are not converted into hotel favorites.

## API

- `favoriteHotel(hotelId: String!)` and `unfavoriteHotel(hotelId: String!)` require authentication. They return `{ hotelId, isFavorite, hotelLikes }`. Member identity always comes from the guard.
- Saving requires an ACTIVE hotel. Removing is also allowed for a PAUSED or soft-deleted hotel. An unknown hotel returns NotFound.
- Repeated save/remove requests keep the same requested state, so retries do not toggle the button or change the count twice.
- `getFavorites(input: FavoritesInquiry!)` now returns `Hotels`, replacing the legacy property favorites query. Defaults: page 1, limit 20; maximum limit 100. It returns only the authenticated member's ACTIVE favorite hotels, sorted by favorite creation date and `_id` descending. Hidden/missing hotels are excluded before pagination and counting. Their saved records remain until explicitly removed.
- `getHotels` and `getHotel` include `isFavorite`: false for guests, personalized for authenticated members. Listing checks the page's hotel IDs in one query. Owner queries and mutation responses other than favorite mutations do not populate this optional field.

## Storage

The existing unique `{ memberId: 1, likeRefId: 1 }` index prevents duplicate saves. A new index supports member/group/date listing. Ensure indexes are deployed where automatic indexing is disabled.

The favorite write and `hotelLikes` change commit in one transaction. A new save adds one, a real removal subtracts one, and repeated requests change nothing. Concurrent inserts that hit the unique index retry once; database failures otherwise propagate. Hotel metadata timestamps and original favorite creation order do not change on repeated saves.

`hotelLikes` counts saved HOTEL records, including saves for hotels later paused/deleted. Existing manually edited or prepopulated counters are not repaired by this change. Hotel favorites must use `setHotelFavorite`; the legacy `toggleLike` method serves other existing domains.

The hotel owner's `memberData` uses the same public projection as hotel browsing. Passwords and contact details are not returned.
