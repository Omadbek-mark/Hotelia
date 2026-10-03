import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Room, Rooms } from '../../libs/dto/room/room';
import { RoomsInquiry } from '../../libs/dto/room/room.inquiry';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RoomInput } from '../../libs/dto/room/room.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoomService } from './room.service';

@Resolver(() => Room)
export class RoomResolver {
	constructor(private readonly roomService: RoomService) {}

	@Query(() => Rooms)
	public async getRooms(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: RoomsInquiry,
	): Promise<Rooms> {
		return await this.roomService.getRooms(input);
	}

	@Query(() => Room)
	public async getRoom(@Args('roomId') input: string): Promise<Room> {
		return await this.roomService.getRoom(shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Room)
	public async createRoom(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: RoomInput,
	): Promise<Room> {
		return await this.roomService.createRoom(memberId, input);
	}
}
