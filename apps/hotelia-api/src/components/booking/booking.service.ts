import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../libs/enums/notification.enum';
import { PaymentMethod, PaymentStatus } from '../../libs/enums/payment.enum';
import { isUUID } from 'class-validator';
import { BookingInput } from '../../libs/dto/booking/booking.input';
import { Room } from '../../libs/dto/room/room';
import { AvailableRooms } from '../../libs/dto/room/room.availability';
import { HotelService } from '../hotel/hotel.service';
import { RoomSort, RoomStatus } from '../../libs/enums/room.enum';
import { BookingStatus } from '../../libs/enums/booking.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { assertNotPastCheckIn, getStayDates, hotelToday } from '../../libs/booking/stay-dates';
import { MemberType } from '../../libs/enums/member.enum';
import { BOOKING_CURRENCY, bookingPrice, cancellationAmounts } from '../../libs/booking/money';
import { OwnerDashboard } from '../../libs/dto/booking/owner-dashboard';
import { PENDING_HOLD_MS } from '../../libs/booking/inventory';
import { availableRoomsPipeline, roomInventoryPipeline } from '../../libs/booking/availability-pipeline';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { type Connection, FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Booking, Bookings } from '../../libs/dto/booking/booking';
import { BookingsInquiry, OwnerBookingsInquiry, AllBookingsInquiry } from '../../libs/dto/booking/booking.inquiry';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class BookingService {
	private readonly logger = new Logger(BookingService.name);
	private confirmingDueBookings = false;
	constructor(
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
		@InjectModel('Room') private readonly roomModel: Model<Room>,
		@InjectConnection() private readonly connection: Connection,
		private readonly hotelService: HotelService,
		private readonly notificationService: NotificationService,
	) {}

	public async createBooking(memberId: Types.ObjectId, input: BookingInput): Promise<Booking> {
		if ((input.paymentMethod ?? PaymentMethod.CEO_BANK_ACCOUNT) !== PaymentMethod.CEO_BANK_ACCOUNT) {
			throw new BadRequestException(
				'Bank card payments are not activated. Please use the demo CEO bank account option.',
			);
		}
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
					const freeCancellationUntil = new Date(now.getTime() + PENDING_HOLD_MS);
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
								expiresAt: freeCancellationUntil,
								freeCancellationUntil,
								cancellationFeeRate: 0.05,
								paymentMethod: PaymentMethod.CEO_BANK_ACCOUNT,
								paymentStatus: PaymentStatus.DEMO_ONLY,
								createdAt: now,
							},
						],
						{ session },
					);
					await this.notificationService.notify(NotificationType.BOOKING_CREATED, memberId, booking, session);
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

	public async confirmBooking(ownerId: Types.ObjectId, bookingId: Types.ObjectId): Promise<Booking> {
		return this.confirmPendingBooking(ownerId, bookingId, false);
	}

	// Runs in the API process so auto-confirm does not depend on starting the batch app.
	@Interval(10000)
	public async confirmDueBookings(): Promise<void> {
		if (this.confirmingDueBookings) return;
		this.confirmingDueBookings = true;
		try {
			const now = new Date();
			const due = await this.bookingModel
				.find({
					bookingStatus: BookingStatus.PENDING,
					freeCancellationUntil: { $lte: now },
				})
				.select('_id hotelId')
				.sort({ freeCancellationUntil: 1 })
				.limit(100)
				.lean()
				.exec();
			// Recover older pending holds without retroactively charging the new fee policy.
			const legacy = await this.bookingModel
				.find({
					bookingStatus: BookingStatus.PENDING,
					freeCancellationUntil: null,
					expiresAt: { $lte: now },
					checkIn: { $gte: hotelToday('UTC', now) },
				})
				.select('_id hotelId')
				.sort({ expiresAt: 1 })
				.limit(25)
				.lean()
				.exec();
			for (const booking of [...due, ...legacy]) {
				try {
					const hotel = await this.hotelService.getHotelByAdmin(booking.hotelId);
					await this.confirmPendingBooking(hotel.ownerId, booking._id, true);
				} catch (error) {
					this.logger.error(
						`Automatic confirmation failed for ${booking._id}`,
						error instanceof Error ? error.message : 'Unknown error',
					);
				}
			}
		} catch (error) {
			this.logger.error(
				'Could not load bookings for automatic confirmation',
				error instanceof Error ? error.message : 'Unknown error',
			);
		} finally {
			this.confirmingDueBookings = false;
		}
	}

	private async confirmPendingBooking(
		ownerId: Types.ObjectId,
		bookingId: Types.ObjectId,
		automatic: boolean,
	): Promise<Booking> {
		const target = await this.bookingModel.findById(bookingId).lean().exec();
		if (!target) throw new NotFoundException(Message.NO_DATA_FOUND);
		return await this.connection.transaction(async (session) => {
			// Shared lock and an inventory recheck also protect older expired holds from overbooking.
			const hotel = await this.hotelService.lockBookingHotel(target.hotelId, session, ownerId);
			const now = new Date();
			const current = await this.bookingModel.findById(bookingId).session(session).lean().exec();
			if (!current) throw new NotFoundException(Message.NO_DATA_FOUND);
			if (automatic && current.bookingStatus !== BookingStatus.PENDING) return current;
			if (current.bookingStatus !== BookingStatus.PENDING)
				throw new ConflictException('Only pending bookings can be confirmed');
			if (!automatic) assertNotPastCheckIn(current.checkIn, hotel.hotelTimezone, now);
			const autoConfirmAt = current.freeCancellationUntil ?? current.expiresAt;
			if (automatic && (!autoConfirmAt || autoConfirmAt > now)) return current;
			if (automatic && !current.freeCancellationUntil && current.checkIn < hotelToday(hotel.hotelTimezone, now))
				return current;
			const stay = { checkIn: current.checkIn, checkOut: current.checkOut, nights: current.nights };
			const [availability] = await this.roomModel
				.aggregate<Room>([
					{
						$match: {
							_id: current.roomId,
							hotelId: hotel._id,
							roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] },
							roomCapacity: { $gte: Math.ceil(current.guests / current.rooms) },
						},
					},
					...roomInventoryPipeline({ rooms: current.rooms }, stay, now, current._id),
				])
				.session(session)
				.exec();
			if (!availability) throw new ConflictException('Not enough available rooms to confirm this booking');
			const result = await this.bookingModel
				.findOneAndUpdate(
					{
						_id: bookingId,
						bookingStatus: BookingStatus.PENDING,
					},
					{
						$set: { bookingStatus: BookingStatus.CONFIRMED, confirmedAt: now, confirmedAutomatically: automatic },
						$unset: { expiresAt: 1 },
					},
					{ new: true, runValidators: true, session },
				)
				.exec();
			if (!result) throw new ConflictException('Only pending bookings can be confirmed');
			await this.notificationService.notify(NotificationType.BOOKING_CONFIRMED, ownerId, result, session, automatic);
			return result;
		});
	}

	public async cancelBooking(
		memberId: Types.ObjectId,
		memberType: MemberType,
		bookingId: Types.ObjectId,
	): Promise<Booking> {
		const booking = await this.bookingModel.findById(bookingId).lean().exec();
		if (!booking) throw new NotFoundException(Message.NO_DATA_FOUND);
		if (!booking.memberId.equals(memberId)) {
			if (memberType !== MemberType.HOTEL_OWNER) throw new NotFoundException(Message.NO_DATA_FOUND);
			await this.hotelService.getOwnerHotel(memberId, booking.hotelId);
		}
		return this.cancelPendingOrConfirmedBooking(bookingId, memberId, booking.memberId.equals(memberId));
	}

	public async cancelBookingByAdmin(bookingId: Types.ObjectId, memberId: Types.ObjectId): Promise<Booking> {
		if (!(await this.bookingModel.findById(bookingId).lean().exec()))
			throw new NotFoundException(Message.NO_DATA_FOUND);
		return this.cancelPendingOrConfirmedBooking(bookingId, memberId);
	}

	private async cancelPendingOrConfirmedBooking(
		bookingId: Types.ObjectId,
		memberId: Types.ObjectId,
		byGuest = false,
	): Promise<Booking> {
		// The status filter prevents overwriting completion; notification shares the transaction.
		return this.connection.transaction(async (session) => {
			const current = await this.bookingModel
				.findOne({ _id: bookingId, bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } })
				.session(session)
				.lean()
				.exec();
			if (!current) throw new ConflictException('Only pending or confirmed bookings can be cancelled');
			const now = new Date();
			const chargeFee =
				byGuest &&
				current.cancellationFeeRate === 0.05 &&
				!!current.freeCancellationUntil &&
				now >= current.freeCancellationUntil;
			const amounts = cancellationAmounts(current.totalPrice, chargeFee);
			const result = await this.bookingModel
				.findOneAndUpdate(
					{ _id: bookingId, bookingStatus: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] } },
					{
						$set: { bookingStatus: BookingStatus.CANCELLED, ...amounts, cancelledAt: now, cancelledBy: memberId },
						$unset: { expiresAt: 1 },
					},
					{ new: true, runValidators: true, session },
				)
				.exec();
			if (!result) throw new ConflictException('Only pending or confirmed bookings can be cancelled');
			await this.notificationService.notify(NotificationType.BOOKING_CANCELLED, memberId, result, session);
			return result;
		});
	}

	public async completeBooking(ownerId: Types.ObjectId, bookingId: Types.ObjectId): Promise<Booking> {
		const target = await this.bookingModel.findById(bookingId).lean().exec();
		if (!target) throw new NotFoundException(Message.NO_DATA_FOUND);
		return await this.connection.transaction(async (session) => {
			const hotel = await this.hotelService.lockBookingHotel(target.hotelId, session, ownerId);
			const result = await this.bookingModel
				.findOneAndUpdate(
					{
						_id: bookingId,
						bookingStatus: BookingStatus.CONFIRMED,
						checkOut: { $lte: hotelToday(hotel.hotelTimezone) },
					},
					{ $set: { bookingStatus: BookingStatus.COMPLETED } },
					{ new: true, runValidators: true, session },
				)
				.exec();
			if (!result)
				throw new ConflictException('Only confirmed bookings whose check-out date has arrived can be completed');
			await this.notificationService.notify(NotificationType.BOOKING_COMPLETED, ownerId, result, session);
			return result;
		});
	}

	public async getBooking(memberId: Types.ObjectId, bookingId: Types.ObjectId): Promise<Booking> {
		const [booking] = await this.bookingModel
			.aggregate<Booking>([{ $match: { _id: bookingId, memberId } }, ...this.bookingDataPipeline()])
			.exec();
		if (!booking) throw new NotFoundException(Message.NO_DATA_FOUND);
		return booking;
	}

	public async getOwnerBooking(ownerId: Types.ObjectId, bookingId: Types.ObjectId): Promise<Booking> {
		const [booking] = await this.bookingModel
			.aggregate<Booking>([
				{ $match: { _id: bookingId } },
				...this.ownerBookingsPipeline(ownerId),
				...this.bookingDataPipeline(),
			])
			.exec();
		if (!booking) throw new NotFoundException(Message.NO_DATA_FOUND);
		return booking;
	}

	public async getOwnerBookings(ownerId: Types.ObjectId, input: OwnerBookingsInquiry): Promise<Bookings> {
		return this.getBookingList(this.bookingSearchMatch(input), input, ownerId);
	}

	public async getAllBookingsByAdmin(input: AllBookingsInquiry): Promise<Bookings> {
		const match = this.bookingSearchMatch(input);
		if (input.memberId !== undefined) match.memberId = shapeIntoMongoObjectId(input.memberId);
		return this.getBookingList(match, input);
	}

	public async getBookingByAdmin(bookingId: Types.ObjectId): Promise<Booking> {
		const [booking] = await this.bookingModel
			.aggregate<Booking>([{ $match: { _id: bookingId } }, ...this.bookingDataPipeline()])
			.exec();
		if (!booking) throw new NotFoundException(Message.NO_DATA_FOUND);
		return booking;
	}

	private bookingSearchMatch(input: OwnerBookingsInquiry): FilterQuery<Booking> {
		const match: FilterQuery<Booking> = {};
		if (input.hotelId !== undefined) match.hotelId = shapeIntoMongoObjectId(input.hotelId);
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;
		if (input.checkIn !== undefined || input.checkOut !== undefined) {
			if (input.checkIn === undefined || input.checkOut === undefined) {
				throw new BadRequestException('Provide both checkIn and checkOut to filter bookings');
			}
			const stay = getStayDates(input.checkIn, input.checkOut);
			// Filter reservations occupying any night in the selected range, including historical stays.
			match.checkIn = { $lt: stay.checkOut };
			match.checkOut = { $gt: stay.checkIn };
		}
		return match;
	}

	public async getOwnerDashboard(ownerId: Types.ObjectId): Promise<OwnerDashboard> {
		const [inventory, [bookings]] = await Promise.all([
			this.hotelService.getOwnerInventoryCounts(ownerId),
			this.bookingModel
				.aggregate<{ totalBookings: number; totalRevenue: number }>([
					...this.ownerBookingsPipeline(ownerId),
					{
						$group: {
							_id: null,
							totalBookings: { $sum: 1 },
							totalRevenue: {
								$sum: {
									$cond: [
										{
											$and: [
												{ $eq: ['$bookingStatus', BookingStatus.COMPLETED] },
												{ $eq: ['$currency', BOOKING_CURRENCY] },
											],
										},
										{ $toDecimal: '$totalPrice' },
										0,
									],
								},
							},
						},
					},
					{ $project: { _id: 0, totalBookings: 1, totalRevenue: { $toDouble: { $round: ['$totalRevenue', 2] } } } },
				])
				.exec(),
		]);
		return {
			...inventory,
			totalBookings: bookings?.totalBookings ?? 0,
			totalRevenue: bookings?.totalRevenue ?? 0,
			currency: BOOKING_CURRENCY,
		};
	}

	public async getMyBookings(memberId: Types.ObjectId, input: BookingsInquiry): Promise<Bookings> {
		const match: FilterQuery<Booking> = { memberId };
		if (input.bookingStatus) match.bookingStatus = input.bookingStatus;
		return await this.getBookingList(match, input);
	}

	private async getBookingList(
		match: FilterQuery<Booking>,
		input: BookingsInquiry,
		ownerId?: Types.ObjectId,
	): Promise<Bookings> {
		const result = await this.bookingModel
			.aggregate<Bookings>([
				{ $match: match },
				...(ownerId ? this.ownerBookingsPipeline(ownerId) : []),
				{ $sort: { createdAt: -1, _id: -1 } },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }, ...this.bookingDataPipeline()],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}

	private ownerBookingsPipeline(ownerId: Types.ObjectId): PipelineStage[] {
		return [
			{
				$lookup: {
					from: 'hotels',
					localField: 'hotelId',
					foreignField: '_id',
					pipeline: [{ $match: { ownerId } }, { $project: { _id: 1 } }],
					as: 'ownedHotel',
				},
			},
			// Ownership must be applied before pagination AND the total counter.
			{ $match: { 'ownedHotel.0': { $exists: true } } },
			{ $unset: 'ownedHotel' },
		];
	}

	private bookingDataPipeline(): (PipelineStage.Lookup | PipelineStage.Unwind)[] {
		return [
			{
				$lookup: {
					from: 'hotels',
					localField: 'hotelId',
					foreignField: '_id',
					as: 'hotelData',
					pipeline: [
						{
							$project: {
								_id: 1,
								hotelName: 1,
								hotelCountry: 1,
								hotelCity: 1,
								hotelAddress: 1,
								hotelTimezone: 1,
								hotelImages: 1,
							},
						},
					],
				},
			},
			{ $unwind: { path: '$hotelData', preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: 'rooms',
					localField: 'roomId',
					foreignField: '_id',
					as: 'roomData',
					pipeline: [{ $project: { _id: 1, roomName: 1, roomType: 1, roomImages: 1 } }],
				},
			},
			{ $unwind: { path: '$roomData', preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: 'members',
					localField: 'memberId',
					foreignField: '_id',
					as: 'memberData',
					pipeline: [{ $project: { _id: 1, memberNick: 1, memberImage: 1, memberDesc: 1 } }],
				},
			},
			{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
		];
	}
}
