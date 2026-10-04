import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, ClientSession, Connection, FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Booking } from '../../libs/dto/booking/booking';
import { inventoryBookingFilter } from '../../libs/booking/inventory';
import { Hotel, Hotels } from '../../libs/dto/hotel/hotel';
import { AllHotelsInquiry, HotelSearch, HotelsInquiry, OwnerHotelsInquiry } from '../../libs/dto/hotel/hotel.inquiry';
import { getStayDates } from '../../libs/booking/stay-dates';
import { roomInventoryPipeline } from '../../libs/booking/availability-pipeline';
import { escapeSearchText } from '../../libs/search';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { AdminHotelUpdate, HotelUpdate } from '../../libs/dto/hotel/hotel.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { MemberService } from '../member/member.service';
import { HotelSort, HotelStatus } from '../../libs/enums/hotel.enum';
import { RoomStatus } from '../../libs/enums/room.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class HotelService {
	constructor(
		@InjectConnection() private readonly connection: Connection,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
	) {}

	// A real write serializes booking creation with hotel/room inventory changes.
	public async lockBookingHotel(
		hotelId: Types.ObjectId,
		session: ClientSession,
		ownerId?: Types.ObjectId,
	): Promise<Hotel> {
		const hotel = await this.hotelModel
			.findOneAndUpdate(
				{
					_id: hotelId,
					...(ownerId
						? { ownerId, hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] } }
						: { hotelStatus: HotelStatus.ACTIVE }),
				},
				{ $inc: { bookingVersion: 1 } },
				{ new: true, session, timestamps: false },
			)
			.lean()
			.exec();
		if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		return hotel;
	}

	public async createHotel(input: HotelInput): Promise<Hotel> {
		try {
			// Both writes commit together; either failure rolls back both changes.
			return await this.connection.transaction(async (session) => {
				const [result] = await this.hotelModel.create([input], { session });
				await this.memberService.memberStatsEditor(
					{
						_id: result.ownerId,
						targetKey: 'memberHotels',
						modifier: 1,
					},
					session,
				);
				return result;
			});
		} catch (err) {
			if (err instanceof MongooseError.ValidationError) {
				throw new BadRequestException(Message.CREATE_FAILED);
			}
			throw err;
		}
	}

	public async updateHotel(memberId: Types.ObjectId, input: HotelUpdate): Promise<Hotel> {
		const search = {
			_id: shapeIntoMongoObjectId(input._id),
			ownerId: memberId,
			hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] },
		};

		if (input.hotelStatus !== undefined && ![HotelStatus.ACTIVE, HotelStatus.PAUSED].includes(input.hotelStatus)) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}

		// Only editable fields enter $set, including when the service is called directly.
		const changes: Partial<Hotel> = {};
		const editableFields = [
			'hotelName',
			'hotelDescription',
			'hotelCountry',
			'hotelCity',
			'hotelAddress',
			'hotelTimezone',
			'hotelType',
			'hotelImages',
			'hotelAmenities',
			'hotelStatus',
		] as const;
		for (const field of editableFields) {
			if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] });
		}
		if (!Object.keys(changes).length) throw new BadRequestException(Message.BAD_REQUEST);

		try {
			const result = await this.hotelModel
				.findOneAndUpdate(
					search,
					{ $set: changes },
					{
						new: true,
						runValidators: true,
					},
				)
				.exec();
			if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
			return result;
		} catch (error) {
			if (error instanceof MongooseError.ValidationError) {
				throw new BadRequestException(Message.UPDATE_FAILED);
			}
			throw error;
		}
	}

	public async deleteHotel(memberId: Types.ObjectId, hotelId: Types.ObjectId): Promise<Hotel> {
		const search = {
			_id: hotelId,
			ownerId: memberId,
			hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] },
		};

		// The status change and owner counter must commit together.
		return await this.connection.transaction(async (session) => {
			const result = await this.hotelModel
				.findOneAndUpdate(
					search,
					{ $set: { hotelStatus: HotelStatus.DELETE, deletedAt: new Date() } },
					{ new: true, runValidators: true, session },
				)
				.exec();
			if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);

			const hasBookings = await this.bookingModel
				.exists({ hotelId, ...inventoryBookingFilter(new Date()) })
				.session(session)
				.exec();
			if (hasBookings) throw new ConflictException('Hotel has active bookings');

			await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberHotels', modifier: -1 }, session);
			return result;
		});
	}

	public async getHotels(input: HotelsInquiry): Promise<Hotels> {
		const match: FilterQuery<Hotel> = { hotelStatus: HotelStatus.ACTIVE };
		return await this.getHotelList(match, input);
	}

	public async getOwnerInventoryCounts(ownerId: Types.ObjectId): Promise<{ totalHotels: number; totalRooms: number }> {
		const [result] = await this.hotelModel
			.aggregate<{ totalHotels: number; totalRooms: number }>([
				{ $match: { ownerId, hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] } } },
				{
					$lookup: {
						from: 'rooms',
						localField: '_id',
						foreignField: 'hotelId',
						as: 'roomStats',
						pipeline: [
							{ $match: { roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] } } },
							{ $group: { _id: null, totalRooms: { $sum: '$roomQuantity' } } },
						],
					},
				},
				{
					$group: {
						_id: null,
						totalHotels: { $sum: 1 },
						totalRooms: { $sum: { $ifNull: [{ $arrayElemAt: ['$roomStats.totalRooms', 0] }, 0] } },
					},
				},
			])
			.exec();
		return { totalHotels: result?.totalHotels ?? 0, totalRooms: result?.totalRooms ?? 0 };
	}

	public async getAllHotelsByAdmin(input: AllHotelsInquiry): Promise<Hotels> {
		const match: FilterQuery<Hotel> = {};
		if (input.hotelStatus !== undefined) match.hotelStatus = input.hotelStatus;
		if (input.ownerId !== undefined) match.ownerId = shapeIntoMongoObjectId(input.ownerId);
		return await this.getHotelList(match, input);
	}

	public async getHotelByAdmin(hotelId: Types.ObjectId): Promise<Hotel> {
		const hotel = await this.hotelModel.findOne({ _id: hotelId }).lean().exec();
		if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		hotel.memberData = await this.memberService.getHotelOwner(hotel.ownerId);
		return hotel;
	}

	public async updateHotelByAdmin(input: AdminHotelUpdate): Promise<Hotel> {
		if (![HotelStatus.ACTIVE, HotelStatus.PAUSED].includes(input.hotelStatus)) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}
		const hotel = await this.hotelModel
			.findOneAndUpdate(
				{ _id: shapeIntoMongoObjectId(input._id), hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] } },
				{ $set: { hotelStatus: input.hotelStatus } },
				{ new: true, runValidators: true },
			)
			.exec();
		if (!hotel) throw new NotFoundException(Message.NO_DATA_FOUND);
		return hotel;
	}

	public async getOwnerHotels(memberId: Types.ObjectId, input: OwnerHotelsInquiry): Promise<Hotels> {
		if (input.hotelStatus !== undefined && ![HotelStatus.ACTIVE, HotelStatus.PAUSED].includes(input.hotelStatus)) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}
		const match: FilterQuery<Hotel> = {
			ownerId: memberId,
			hotelStatus: input.hotelStatus ?? { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] },
		};
		return await this.getHotelList(match, input);
	}

	private async getHotelList(match: FilterQuery<Hotel>, input: HotelsInquiry): Promise<Hotels> {
		this.shapeMatchQuery(match, input);
		const search = input.search ?? {};
		let stay: ReturnType<typeof getStayDates> | undefined;
		if (search.checkIn !== undefined || search.checkOut !== undefined) {
			if (search.checkIn === undefined || search.checkOut === undefined)
				throw new BadRequestException('Provide both checkIn and checkOut');
			stay = getStayDates(search.checkIn, search.checkOut);
		}
		if (search.minPrice !== undefined && search.maxPrice !== undefined && search.minPrice > search.maxPrice) {
			throw new BadRequestException('minPrice cannot exceed maxPrice');
		}
		const filterRooms =
			!!stay ||
			search.guests !== undefined ||
			search.rooms !== undefined ||
			search.roomType !== undefined ||
			search.minPrice !== undefined ||
			search.maxPrice !== undefined ||
			[HotelSort.PRICE_ASC, HotelSort.PRICE_DESC].includes(input.sort);
		const now = new Date();
		const pricePipeline = this.hotelRoomPricePipeline(search, stay, now);
		const sorts: Record<HotelSort, Record<string, 1 | -1>> = {
			[HotelSort.PRICE_ASC]: { startingPrice: 1, _id: 1 },
			[HotelSort.PRICE_DESC]: { startingPrice: -1, _id: -1 },
			[HotelSort.NEWEST]: { createdAt: -1, _id: -1 },
			[HotelSort.RATING]: { hotelRating: -1, _id: -1 },
			[HotelSort.MOST_POPULAR]: { hotelViews: -1, _id: -1 },
		};
		const result = await this.hotelModel
			.aggregate<Hotels>([
				{ $match: match },
				...(stay
					? [
							{
								$match: {
									$expr: {
										$gte: [
											search.checkIn,
											{ $dateToString: { date: now, format: '%Y-%m-%d', timezone: '$hotelTimezone' } },
										],
									},
								},
							},
						]
					: []),
				...(filterRooms ? [...pricePipeline, { $match: { startingPrice: { $ne: null } } }] : []),
				{ $sort: sorts[input.sort] },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{
								$lookup: {
									from: 'members',
									localField: 'ownerId',
									foreignField: '_id',
									as: 'memberData',
									pipeline: [
										{ $match: { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.HOTEL_OWNER } },
										{ $project: { _id: 1, memberNick: 1, memberImage: 1, memberDesc: 1 } },
									],
								},
							},
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
							...(!filterRooms ? pricePipeline : []),
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}

	private hotelRoomPricePipeline(
		search: HotelSearch,
		stay: ReturnType<typeof getStayDates> | undefined,
		now: Date,
	): (PipelineStage.Lookup | PipelineStage.Set | PipelineStage.Unset)[] {
		const rooms = search.rooms ?? 1;
		const match: Record<string, unknown> = {
			roomStatus: RoomStatus.ACTIVE,
			roomQuantity: { $gte: rooms },
			roomCapacity: { $gte: Math.ceil((search.guests ?? 1) / rooms) },
		};
		if (search.roomType) match.roomType = search.roomType;
		if (search.minPrice !== undefined || search.maxPrice !== undefined) {
			match.roomPrice = {
				...(search.minPrice !== undefined ? { $gte: search.minPrice } : {}),
				...(search.maxPrice !== undefined ? { $lte: search.maxPrice } : {}),
			};
		}
		return [
			{
				$lookup: {
					from: 'rooms',
					localField: '_id',
					foreignField: 'hotelId',
					as: 'roomPriceData',
					pipeline: [
						{ $match: match },
						...(stay ? roomInventoryPipeline({ rooms }, stay, now) : []),
						{ $sort: { roomPrice: 1, _id: 1 } },
						{ $limit: 1 },
						{ $project: { _id: 0, roomPrice: 1 } },
					],
				},
			},
			{ $set: { startingPrice: { $ifNull: [{ $arrayElemAt: ['$roomPriceData.roomPrice', 0] }, null] } } },
			{ $unset: 'roomPriceData' },
		];
	}

	private shapeMatchQuery(match: FilterQuery<Hotel>, input: HotelsInquiry): void {
		const { text, destination, hotelType, minRating, amenities } = input.search ?? {};
		if (text?.trim()) match.hotelName = { $regex: escapeSearchText(text.trim()), $options: 'i' };
		if (destination?.trim()) {
			const location = { $regex: escapeSearchText(destination.trim()), $options: 'i' };
			match.$or = [{ hotelCountry: location }, { hotelCity: location }, { hotelAddress: location }];
		}
		if (hotelType) match.hotelType = hotelType;
		if (minRating !== undefined) match.hotelRating = { $gte: minRating };
		// Every selected amenity must be present on the hotel.
		if (amenities?.length) match.hotelAmenities = { $all: amenities };
	}

	public async getOwnerHotel(memberId: Types.ObjectId, hotelId: Types.ObjectId): Promise<Hotel> {
		const search = {
			_id: hotelId,
			ownerId: memberId,
			hotelStatus: { $in: [HotelStatus.ACTIVE, HotelStatus.PAUSED] },
		};
		const targetHotel = await this.hotelModel.findOne(search).lean().exec();
		if (!targetHotel) throw new NotFoundException(Message.NO_DATA_FOUND);

		targetHotel.memberData = await this.memberService.getHotelOwner(targetHotel.ownerId);
		return targetHotel;
	}

	public async getHotel(hotelId: Types.ObjectId, memberId?: Types.ObjectId | null): Promise<Hotel> {
		const search = {
			_id: hotelId,
			hotelStatus: HotelStatus.ACTIVE,
		};

		let targetHotel: Hotel | null = await this.hotelModel.findOne(search).lean().exec();
		if (!targetHotel) throw new NotFoundException(Message.NO_DATA_FOUND);

		if (memberId) {
			const newView = await this.viewService.recordView({
				memberId,
				viewRefId: hotelId,
				viewGroup: ViewGroup.HOTEL,
			});
			if (newView) {
				const updatedHotel = await this.hotelModel
					.findOneAndUpdate(search, { $inc: { hotelViews: 1 } }, { new: true, timestamps: false })
					.lean()
					.exec();
				if (!updatedHotel) throw new NotFoundException(Message.NO_DATA_FOUND);
				targetHotel = updatedHotel;
			}
		}

		targetHotel.memberData = await this.memberService.getHotelOwner(targetHotel.ownerId);
		return targetHotel;
	}
}
