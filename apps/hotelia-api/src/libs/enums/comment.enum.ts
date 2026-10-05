import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

export enum CommentGroup {
	HOTEL = 'HOTEL',
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
}
registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
