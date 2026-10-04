# Hotelia board articles

Existing Nestar APIs, collection and module structure are retained. Categories are FREE, TRAVEL_TIPS, DESTINATION_GUIDE, TRAVEL_STORY and HOTEL_NEWS.

- Authenticated members create articles; the author comes from authentication. Only the author may update an ACTIVE article through `updateBoardArticle`. Existing admin guards protect admin queries/updates/removal.
- Creation and soft deletion update `memberArticles` in the same transaction. Repeated deletion fails without decrementing again. Deleted articles are not restored. Admin permanent removal still accepts only already-deleted records.
- Editable fields remain title, content, image and status. Author, category and counters cannot be changed through update input. Empty updates are rejected. Title/content retain Nestar's 3–50 / 3–250 character limits and are trimmed.
- Public queries return ACTIVE articles, with literal case-insensitive title search and stable `_id` ordering for ties. Pagination is bounded to 100 items per page.
- Detail and list `memberData` expose the public profile only. Missing authors do not remove articles from list/count results.
- Existing article like toggling and unique-view recording remain unchanged in this step. Their writes are separate from their counters; this step only makes creation/soft-delete article counts transactional.
