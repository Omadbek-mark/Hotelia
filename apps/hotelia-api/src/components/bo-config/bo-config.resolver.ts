import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoConfig, BoConfigInput } from '../../libs/dto/bo-config/bo-config';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BoConfigService } from './bo-config.service';

@Resolver()
export class BoConfigResolver {
	constructor(private readonly boConfigService: BoConfigService) {}
	@Query(() => [BoConfig])
	getBoConfigs(): Promise<BoConfig[]> {
		return this.boConfigService.getBoConfigs();
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [BoConfig])
	getAllBoConfigsByAdmin(): Promise<BoConfig[]> {
		return this.boConfigService.getAllBoConfigsByAdmin();
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => BoConfig)
	saveBoConfig(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: BoConfigInput,
	): Promise<BoConfig> {
		return this.boConfigService.saveBoConfig(input);
	}
}
