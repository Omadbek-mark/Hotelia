import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
	FREE = 'FREE',
	TRAVEL_TIPS = 'TRAVEL_TIPS',
	DESTINATION_GUIDE = 'DESTINATION_GUIDE',
	TRAVEL_STORY = 'TRAVEL_STORY',
	HOTEL_NEWS = 'HOTEL_NEWS',
}
registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});
