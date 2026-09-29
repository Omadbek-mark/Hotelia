import { registerEnumType } from '@nestjs/graphql';

export enum ReviewStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(ReviewStatus, { name: 'ReviewStatus' });
