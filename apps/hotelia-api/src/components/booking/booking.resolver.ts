import { BookingInput } from '../../libs/dto/booking/booking.input';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { BookingsInquiry } from '../../libs/dto/booking/booking.inquiry';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { BookingService } from './booking.service';

@Resolver(() => Booking)
export class BookingResolver {
	constructor(private readonly bookingService: BookingService) {}

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
