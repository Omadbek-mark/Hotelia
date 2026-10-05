import { BookingInput } from '../../libs/dto/booking/booking.input';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { BookingsInquiry, OwnerBookingsInquiry, AllBookingsInquiry } from '../../libs/dto/booking/booking.inquiry';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { BookingService } from './booking.service';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnerDashboard } from '../../libs/dto/booking/owner-dashboard';

@Resolver(() => Booking)
export class BookingResolver {
	constructor(private readonly bookingService: BookingService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async cancelBookingByAdmin(@Args('bookingId') input: string): Promise<Booking> {
		return this.bookingService.cancelBookingByAdmin(shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getAllBookingsByAdmin(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: AllBookingsInquiry,
	): Promise<Bookings> {
		return this.bookingService.getAllBookingsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Booking)
	public async getBookingByAdmin(@Args('bookingId') input: string): Promise<Booking> {
		return this.bookingService.getBookingByAdmin(shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Query(() => OwnerDashboard)
	public async getOwnerDashboard(@AuthMember('_id') memberId: Types.ObjectId): Promise<OwnerDashboard> {
		return await this.bookingService.getOwnerDashboard(memberId);
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Query(() => Bookings)
	public async getOwnerBookings(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: OwnerBookingsInquiry,
	): Promise<Bookings> {
		return await this.bookingService.getOwnerBookings(memberId, input);
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Query(() => Booking)
	public async getOwnerBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('bookingId') input: string,
	): Promise<Booking> {
		return await this.bookingService.getOwnerBooking(memberId, shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async confirmBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('bookingId') input: string,
	): Promise<Booking> {
		return await this.bookingService.confirmBooking(memberId, shapeIntoMongoObjectId(input));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Booking)
	public async cancelBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@AuthMember('memberType') memberType: MemberType,
		@Args('bookingId') input: string,
	): Promise<Booking> {
		return await this.bookingService.cancelBooking(memberId, memberType, shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Booking)
	public async completeBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('bookingId') input: string,
	): Promise<Booking> {
		return await this.bookingService.completeBooking(memberId, shapeIntoMongoObjectId(input));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Booking)
	public async createBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: BookingInput,
	): Promise<Booking> {
		return await this.bookingService.createBooking(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Booking)
	public async getBooking(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('bookingId') input: string,
	): Promise<Booking> {
		return await this.bookingService.getBooking(memberId, shapeIntoMongoObjectId(input));
	}

	@UseGuards(AuthGuard)
	@Query(() => Bookings)
	public async getMyBookings(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: BookingsInquiry,
	): Promise<Bookings> {
		return await this.bookingService.getMyBookings(memberId, input);
	}
}
