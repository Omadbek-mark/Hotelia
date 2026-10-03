import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, FilterQuery, Model, Types } from 'mongoose';
import { Room, Rooms } from '../../libs/dto/room/room';
import { RoomsInquiry } from '../../libs/dto/room/room.inquiry';
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
	) {}

	public async getRooms(input: RoomsInquiry): Promise<Rooms> {
		const hotelId = shapeIntoMongoObjectId(input.hotelId);
		// No memberId: this visibility check does not record a hotel view.
		await this.hotelService.getHotel(hotelId);
		const match: FilterQuery<Room> = { hotelId, roomStatus: RoomStatus.ACTIVE };
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
