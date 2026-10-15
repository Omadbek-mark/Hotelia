# Recently viewed hotels

`getVisited(input: VisitedInquiry!)` requires a valid authenticated session. The member ID is taken from that session; callers cannot select another member's history. Page defaults to 1 and limit to 20, with bounds 1–1000000 and 1–100 respectively.

The query reads existing `ViewGroup.HOTEL` records and joins only ACTIVE hotels before pagination and counting. Results use the same `Hotels` contract as public discovery. Favorite status is attached for the authenticated member. Ordering is most recently viewed first (`updatedAt` descending, `_id` descending for ties).

Existing unique view records remain unique: the first authenticated detail visit creates a view and increments `hotelViews`; subsequent hotel detail visits update only the view timestamp and return null from `recordView`, so the unique counter remains unchanged. Duplicate insert races also touch the winning view without incrementing twice. Repeat MEMBER/ARTICLE views retain their previous behavior. This does not change hotel `updatedAt` or introduce a history deletion operation.

Checks: production backend build and the hotel/get-hotel + record-view suites pass (81 tests). Tests cover session scope, anonymous access, invalid pagination, ACTIVE filtering before counts, ordering, repeat timestamp updates and duplicate handling using mocked storage. No live database records were created for these checks.
