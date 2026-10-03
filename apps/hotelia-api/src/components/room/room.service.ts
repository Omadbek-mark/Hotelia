import { Booking } from '../../libs/dto/booking/booking';
import { inventoryBookingFilter } from '../../libs/booking/inventory';
import { AvailableRooms, AvailableRoomsInquiry } from '../../libs/dto/room/room.availability';
import { assertNotPastCheckIn, getStayDates } from '../../libs/booking/stay-dates';
import { availableRoomsPipeline } from '../../libs/booking/availability-pipeline';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Connection, FilterQuery, Model, Types } from 'mongoose';
import { Room, Rooms } from '../../libs/dto/room/room';
import { OwnerRoomsInquiry, RoomsInquiry } from '../../libs/dto/room/room.inquiry';
import { RoomUpdate } from '../../libs/dto/room/room.update';
import { RoomInput } from '../../libs/dto/room/room.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RoomSort, RoomStatus } from '../../libs/enums/room.enum';
import { Message } from '../../libs/enums/common.enum';
import { HotelService } from '../hotel/hotel.service';

@Injectable()
export class RoomService {
	constructor(
		@InjectModel('Room') private readonly roomModel: Model<Room>,
		private readonly hotelService: HotelService,
		@InjectConnection() private readonly connection: Connection,
		@InjectModel('Booking') private readonly bookingModel: Model<Booking>,
	) {}

	public async getAvailableRooms(input: AvailableRoomsInquiry): Promise<AvailableRooms> {
		const hotelId = shapeIntoMongoObjectId(input.hotelId);
		const stay = getStayDates(input.checkIn, input.checkOut);
		const hotel = await this.hotelService.getHotel(hotelId);
		assertNotPastCheckIn(stay.checkIn, hotel.hotelTimezone);
		const result = await this.roomModel.aggregate<AvailableRooms>(availableRoomsPipeline(hotelId, input, stay)).exec();
		return result[0] ?? { list: [], metaCounter: [] };
	}

	public async getRooms(input: RoomsInquiry): Promise<Rooms> {
		const hotelId = shapeIntoMongoObjectId(input.hotelId);
		// No memberId: this visibility check does not record a hotel view.
		await this.hotelService.getHotel(hotelId);
		const match: FilterQuery<Room> = { hotelId, roomStatus: RoomStatus.ACTIVE };
		return await this.getRoomList(match, input);
	}

	public async getOwnerRooms(memberId: Types.ObjectId, input: OwnerRoomsInquiry): Promise<Rooms> {
		const hotelId = shapeIntoMongoObjectId(input.hotelId);
		await this.hotelService.getOwnerHotel(memberId, hotelId);
		if (input.roomStatus !== undefined && ![RoomStatus.ACTIVE, RoomStatus.PAUSED].includes(input.roomStatus)) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}
		const match: FilterQuery<Room> = {
			hotelId,
			roomStatus: input.roomStatus ?? { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] },
		};
		return await this.getRoomList(match, input);
	}

	private async getRoomList(match: FilterQuery<Room>, input: RoomsInquiry): Promise<Rooms> {
		if (input.roomType) match.roomType = input.roomType;
		const sorts: Record<RoomSort, Record<string, 1 | -1>> = {
			[RoomSort.NEWEST]: { createdAt: -1, _id: -1 },
			[RoomSort.PRICE_ASC]: { roomPrice: 1, _id: 1 },
			[RoomSort.PRICE_DESC]: { roomPrice: -1, _id: -1 },
		};
		const result = await this.roomModel
			.aggregate<Rooms>([
				{ $match: match },
				{ $sort: sorts[input.sort] },
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

	public async getRoom(roomId: Types.ObjectId): Promise<Room> {
		const room = await this.roomModel.findOne({ _id: roomId, roomStatus: RoomStatus.ACTIVE }).lean().exec();
		if (!room) throw new NotFoundException(Message.NO_DATA_FOUND);
		await this.hotelService.getHotel(room.hotelId);
		return room;
	}

	public async getOwnerRoom(memberId: Types.ObjectId, roomId: Types.ObjectId): Promise<Room> {
		const room = await this.roomModel
			.findOne({
				_id: roomId,
				roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] },
			})
			.lean()
			.exec();
		if (!room) throw new NotFoundException(Message.NO_DATA_FOUND);
		await this.hotelService.getOwnerHotel(memberId, room.hotelId);
		return room;
	}

	public async updateRoom(memberId: Types.ObjectId, input: RoomUpdate): Promise<Room> {
		const roomId = shapeIntoMongoObjectId(input._id);
		const room = await this.getOwnerRoom(memberId, roomId);
		if (input.roomStatus !== undefined && ![RoomStatus.ACTIVE, RoomStatus.PAUSED].includes(input.roomStatus)) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}
		const changes: Partial<Room> = {};
		const editableFields = [
			'roomName',
			'roomDescription',
			'roomType',
			'roomPrice',
			'roomCapacity',
			'roomQuantity',
			'bedType',
			'roomSize',
			'roomImages',
			'roomAmenities',
			'roomStatus',
		] as const;
		for (const field of editableFields) {
			if (input[field] !== undefined) Object.assign(changes, { [field]: input[field] });
		}
		if (!Object.keys(changes).length) throw new BadRequestException(Message.BAD_REQUEST);
		try {
			return await this.connection.transaction(async (session) => {
				await this.hotelService.lockBookingHotel(room.hotelId, session, memberId);
				// Read again in the transaction; the earlier read only locates the owning hotel.
				const current = await this.roomModel
					.findOne({ _id: roomId, hotelId: room.hotelId, roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] } })
					.session(session)
					.lean()
					.exec();
				if (!current) throw new NotFoundException(Message.NO_DATA_FOUND);
				if (
					(input.roomQuantity !== undefined && input.roomQuantity < current.roomQuantity) ||
					(input.roomCapacity !== undefined && input.roomCapacity < current.roomCapacity)
				) {
					const booked = await this.bookingModel
						.exists({ roomId, ...inventoryBookingFilter(new Date()) })
						.session(session)
						.exec();
					if (booked) throw new ConflictException('Cannot reduce inventory or capacity while active bookings exist');
				}
				const result = await this.roomModel
					.findOneAndUpdate(
						{ _id: roomId, hotelId: room.hotelId, roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] } },
						{ $set: changes },
						{ new: true, runValidators: true, session },
					)
					.exec();
				if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
				return result;
			});
		} catch (error) {
			if (error instanceof MongooseError.ValidationError) throw new BadRequestException(Message.UPDATE_FAILED);
			throw error;
		}
	}

	public async deleteRoom(memberId: Types.ObjectId, roomId: Types.ObjectId): Promise<Room> {
		const room = await this.getOwnerRoom(memberId, roomId);
		return await this.connection.transaction(async (session) => {
			await this.hotelService.lockBookingHotel(room.hotelId, session, memberId);
			const booked = await this.bookingModel
				.exists({ roomId, ...inventoryBookingFilter(new Date()) })
				.session(session)
				.exec();
			if (booked) throw new ConflictException('Room has active bookings');
			const result = await this.roomModel
				.findOneAndUpdate(
					{ _id: roomId, hotelId: room.hotelId, roomStatus: { $in: [RoomStatus.ACTIVE, RoomStatus.PAUSED] } },
					{ $set: { roomStatus: RoomStatus.DELETE, deletedAt: new Date() } },
					{ new: true, runValidators: true, session },
				)
				.exec();
			if (!result) throw new NotFoundException(Message.NO_DATA_FOUND);
			return result;
		});
	}

	public async createRoom(memberId: Types.ObjectId, input: RoomInput): Promise<Room> {
		const hotelId = shapeIntoMongoObjectId(input.hotelId);
		// Reuse the owner/status check; preparing rooms in a PAUSED hotel is allowed.
		await this.hotelService.getOwnerHotel(memberId, hotelId);

		try {
			return await this.roomModel.create({
				hotelId,
				roomName: input.roomName,
				roomDescription: input.roomDescription,
				roomType: input.roomType,
				roomPrice: input.roomPrice,
				roomCapacity: input.roomCapacity,
				roomQuantity: input.roomQuantity,
				bedType: input.bedType,
				roomSize: input.roomSize,
				roomImages: input.roomImages,
				roomAmenities: input.roomAmenities,
				roomStatus: RoomStatus.ACTIVE,
			});
		} catch (error) {
			if (error instanceof MongooseError.ValidationError) {
				throw new BadRequestException(Message.CREATE_FAILED);
			}
			throw error;
		}
	}
}
