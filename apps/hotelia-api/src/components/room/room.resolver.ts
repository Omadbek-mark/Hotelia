import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Room, Rooms } from '../../libs/dto/room/room';
import { OwnerRoomsInquiry, RoomsInquiry, AllRoomsInquiry } from '../../libs/dto/room/room.inquiry';
import { AdminRoomUpdate, RoomUpdate } from '../../libs/dto/room/room.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { RoomInput } from '../../libs/dto/room/room.input';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoomService } from './room.service';
import { AvailableRooms, AvailableRoomsInquiry } from '../../libs/dto/room/room.availability';

@Resolver(() => Room)
export class RoomResolver {
	constructor(private readonly roomService: RoomService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Room)
	public async updateRoomByAdmin(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: AdminRoomUpdate,
	): Promise<Room> {
		return this.roomService.updateRoomByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Rooms)
	public async getAllRoomsByAdmin(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: AllRoomsInquiry,
	): Promise<Rooms> {
		return this.roomService.getAllRoomsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Room)
	public async getRoomByAdmin(@Args('roomId') input: string): Promise<Room> {
		return this.roomService.getRoomByAdmin(shapeIntoMongoObjectId(input));
	}

	@Query(() => AvailableRooms)
	public async getAvailableRooms(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: AvailableRoomsInquiry,
	): Promise<AvailableRooms> {
		return await this.roomService.getAvailableRooms(input);
	}

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
	@Query(() => Rooms)
	public async getOwnerRooms(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: OwnerRoomsInquiry,
	): Promise<Rooms> {
		return await this.roomService.getOwnerRooms(memberId, input);
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Query(() => Room)
	public async getOwnerRoom(@AuthMember('_id') memberId: Types.ObjectId, @Args('roomId') input: string): Promise<Room> {
		return await this.roomService.getOwnerRoom(memberId, shapeIntoMongoObjectId(input));
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Room)
	public async updateRoom(
		@AuthMember('_id') memberId: Types.ObjectId,
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: RoomUpdate,
	): Promise<Room> {
		return await this.roomService.updateRoom(memberId, input);
	}

	@Roles(MemberType.HOTEL_OWNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Room)
	public async deleteRoom(@AuthMember('_id') memberId: Types.ObjectId, @Args('roomId') input: string): Promise<Room> {
		return await this.roomService.deleteRoom(memberId, shapeIntoMongoObjectId(input));
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
