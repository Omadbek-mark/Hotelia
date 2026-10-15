import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	HOTEL = 'HOTEL',
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
