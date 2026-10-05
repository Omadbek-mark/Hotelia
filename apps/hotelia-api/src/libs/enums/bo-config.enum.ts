import { registerEnumType } from '@nestjs/graphql';

export enum BoConfigKey {
	BANNER = 'BANNER',
	ANNOUNCEMENT = 'ANNOUNCEMENT',
	CONTACT = 'CONTACT',
}
export enum BoConfigStatus {
	ACTIVE = 'ACTIVE',
	PAUSED = 'PAUSED',
}
registerEnumType(BoConfigKey, { name: 'BoConfigKey' });
registerEnumType(BoConfigStatus, { name: 'BoConfigStatus' });
