import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	HOTEL = 'HOTEL',
	MEMBER = 'MEMBER',
	PROPERTY = 'PROPERTY',
	ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
