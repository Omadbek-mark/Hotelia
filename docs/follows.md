# Member follows

The existing Nestar APIs and `follows` collection are retained: `subscribe`, `unsubscribe`, `getMemberFollowings`, and `getMemberFollowers`. Authenticated members of any role can follow an ACTIVE member; self-follow returns BadRequest and duplicate follow returns Conflict.

Subscribe/unsubscribe update the relationship and both member counters in one transaction. A failed counter update rolls back the relationship change. Repeating unsubscribe returns NotFound without decrementing again. Unsubscribe also works when the target is BLOCK or soft-deleted; physical removal of member records is not supported by this flow.

Public list queries retain `meLiked` and `meFollowed`. They include only ACTIVE related profiles and filter those profiles before pagination/counting, sorted by `createdAt DESC, _id DESC`. Persisted member counters count relationships; a list's `metaCounter` counts currently visible profiles, so they can differ for blocked/deleted profiles. Empty lists return empty arrays. The maximum page size is 100.

`followerData` and `followingData` now use `MemberPublic` with `_id`, `memberNick`, `memberImage`, and optional `memberDesc`; private contact fields and passwords are not exposed. Existing counters are not recalculated/migrated by this change.
