import { isUUID } from 'class-validator';
import { BookingInput } from '../../libs/dto/booking/booking.input';
import { Room } from '../../libs/dto/room/room';
import { AvailableRooms } from '../../libs/dto/room/room.availability';
import { HotelService } from '../hotel/hotel.service';
import { RoomSort, RoomStatus } from '../../libs/enums/room.enum';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { assertNotPastCheckIn, getStayDates } from '../../libs/booking/stay-dates';
import { bookingPrice } from '../../libs/booking/money';
import { PENDING_HOLD_MS } from '../../libs/booking/inventory';
import { availableRoomsPipeline } from '../../libs/booking/availability-pipeline';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, Types } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { BookingsInquiry } from '../../libs/dto/booking/booking.inquiry';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class BookingService {
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Room') private readonly roomModel: Model<Room>,
		@InjectConnection() private readonly connection: Connection,
		private readonly hotelService: HotelService,
	) {}

	public async createBooking(memberId: Types.ObjectId, input: BookingInput): Promise<Booking> {
		const roomId = shapeIntoMongoObjectId(input.roomId);
		const stay = getStayDates(input.checkIn, input.checkOut);
		if (
			!isUUID(input.requestId, '4') ||
			!Number.isInteger(input.rooms) ||
			input.rooms < 1 ||
			input.rooms > 2147483647 ||
			!Number.isInteger(input.guests) ||
			input.guests < 1 ||
			input.guests > 2147483647
		) {
			throw new BadRequestException(Message.BAD_REQUEST);
		}
		const requestId = input.requestId.toLowerCase();
		const previous = await this.bookingModel.findOne({ memberId, requestId }).lean().exec();
		if (previous) return this.sameRequest(previous, input);

		const target = await this.roomModel
			.findOne({ _id: roomId, roomStatus: RoomStatus.ACTIVE })
			.select('hotelId')
			.lean()
			.exec();
		if (!target) throw new NotFoundException(Message.NO_DATA_FOUND);
		try {
			return await this.connection.transaction(
				async (session) => {
					const existing = await this.bookingModel.findOne({ memberId, requestId }).session(session).lean().exec();
					if (existing) return this.sameRequest(existing, input);
					const hotel = await this.hotelService.lockBookingHotel(target.hotelId, session);
					const room = await this.roomModel
						.findOneAndUpdate(
							{ _id: roomId, hotelId: hotel._id, roomStatus: RoomStatus.ACTIVE },
							{ $inc: { bookingVersion: 1 } },
							{ new: true, session, timestamps: false },
						)
						.lean()
						.exec();
					if (!room) throw new NotFoundException(Message.NO_DATA_FOUND);
					const now = new Date();
					assertNotPastCheckIn(stay.checkIn, hotel.hotelTimezone, now);
					const price = bookingPrice(room.roomPrice, stay.nights, input.rooms);
					const inquiry = { ...input, hotelId: String(hotel._id), page: 1, limit: 1, sort: RoomSort.NEWEST };
					const [availability] = await this.roomModel
						.aggregate<AvailableRooms>([
							{ $match: { _id: roomId } },
							...availableRoomsPipeline(hotel._id, inquiry, stay, now),
						])
						.session(session)
						.exec();
					if (!availability?.list.length) throw new ConflictException('Not enough available rooms or guest capacity');
					const [booking] = await this.bookingModel.create(
						[
							{
								memberId,
								hotelId: hotel._id,
								roomId,
								requestId,
								...stay,
								guests: input.guests,
								rooms: input.rooms,
								...price,
								bookingStatus: BookingStatus.PENDING,
								expiresAt: new Date(now.getTime() + PENDING_HOLD_MS),
							},
						],
						{ session },
					);
					return booking;
				},
				{ readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }, readPreference: 'primary' },
			);
		} catch (error) {
			// A unique member/request index also handles simultaneous identical retries.
			if ((error as { code?: number })?.code === 11000) {
				const existing = await this.bookingModel.findOne({ memberId, requestId }).lean().exec();
				if (existing) return this.sameRequest(existing, input);
			}
			throw error;
		}
	}

	private sameRequest(booking: Booking, input: BookingInput): Booking {
		if (
			String(booking.roomId).toLowerCase() !== input.roomId.toLowerCase() ||
			booking.checkIn.toISOString().slice(0, 10) !== input.checkIn ||
			booking.checkOut.toISOString().slice(0, 10) !== input.checkOut ||
			booking.guests !== input.guests ||
			booking.rooms !== input.rooms
		) {
			throw new ConflictException('requestId was already used with different booking details');
		}
		return booking;
	}

	public async getBooking(memberId: Types.ObjectId, bookingId: Types.ObjectId): Promise<Booking> {
		const booking = await this.bookingModel.findOne({ _id: bookingId, memberId }).lean().exec();
		if (!booking) throw new NotFoundException(Message.NO_DATA_FOUND);
		return booking;
	}

	public async getMyBookings(memberId: Types.ObjectId, input: BookingsInquiry): Promise<Bookings> {
		const match: FilterQuery<Booking> = { memberId };
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;
		const result = await this.bookingModel
			.aggregate<Bookings>([
				{ $match: match },
				{ $sort: { createdAt: -1, _id: -1 } },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}
}
