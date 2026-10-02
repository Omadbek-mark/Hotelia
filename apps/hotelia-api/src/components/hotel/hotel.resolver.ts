import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Hotel, Hotels } from '../../libs/dto/hotel/hotel';
import { HotelsInquiry } from '../../libs/dto/hotel/hotel.inquiry';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Types } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HotelService } from './hotel.service';

@Resolver(() => Hotel)
export class HotelResolver {
	constructor(private readonly hotelService: HotelService) {}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Hotel)
	public async createHotel(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: HotelInput,
	): Promise<Hotel> {
		input.ownerId = memberId;
		return await this.hotelService.createHotel(input);
	}

	@Query(() => Hotels)
	public async getHotels(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: HotelsInquiry,
	): Promise<Hotels> {
		return await this.hotelService.getHotels(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Hotel)
	public async getHotel(
		@Args('hotelId') input: string,
		@AuthMember('_id') memberId: Types.ObjectId | null,
	): Promise<Hotel> {
		const hotelId = shapeIntoMongoObjectId(input);
		return await this.hotelService.getHotel(hotelId, memberId);
	}
}
