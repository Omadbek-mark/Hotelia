import { FilterQuery, PipelineStage, Types } from 'mongoose';
import { Room } from '../dto/room/room';
import { AvailableRoomsInquiry } from '../dto/room/room.availability';
import { inventoryBookingFilter } from './inventory';
import { RoomSort, RoomStatus } from '../enums/room.enum';
import { DAY_MS, getStayDates } from './stay-dates';

export function availableRoomsPipeline(
	hotelId: Types.ObjectId,
	input: AvailableRoomsInquiry,
	stay: ReturnType<typeof getStayDates>,
	now = new Date(),
): PipelineStage[] {
	const match: FilterQuery<Room> = {
		hotelId,
		roomStatus: RoomStatus.ACTIVE,
		roomQuantity: { $gte: input.rooms },
		roomCapacity: { $gte: Math.ceil(input.guests / input.rooms) },
	};
	if (input.roomType) match.roomType = input.roomType;
	const sorts: Record<RoomSort, Record<string, 1 | -1>> = {
		[RoomSort.NEWEST]: { createdAt: -1, _id: -1 },
		[RoomSort.PRICE_ASC]: { roomPrice: 1, _id: 1 },
		[RoomSort.PRICE_DESC]: { roomPrice: -1, _id: -1 },
	};
	return [
		{ $match: match },
		...roomInventoryPipeline(input, stay, now),
		{ $sort: sorts[input.sort] },
		{
			$facet: {
				list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
				metaCounter: [{ $count: 'total' }],
			},
		},
	];
}

// Shared nightly inventory calculation for room and hotel searches.
export function roomInventoryPipeline(
	input: Pick<AvailableRoomsInquiry, 'rooms'>,
	stay: ReturnType<typeof getStayDates>,
	now = new Date(),
): (PipelineStage.Lookup | PipelineStage.Set | PipelineStage.Match | PipelineStage.Unset)[] {
	return [
		{
			$lookup: {
				from: 'bookings',
				let: { roomId: '$_id' },
				as: 'overlappingBookings',
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$roomId', '$$roomId'] },
							...inventoryBookingFilter(now),
							checkIn: { $lt: stay.checkOut },
							checkOut: { $gt: stay.checkIn },
						},
					},
					{ $project: { _id: 0, checkIn: 1, checkOut: 1, rooms: 1 } },
				],
			},
		},
		// Count inventory per night, not the sum of every overlapping reservation.
		{
			$set: {
				nightlyBooked: {
					$map: {
						input: { $range: [0, stay.nights] },
						as: 'day',
						in: {
							$let: {
								vars: { night: { $add: [stay.checkIn, { $multiply: ['$$day', DAY_MS] }] } },
								in: {
									$sum: {
										$map: {
											input: {
												$filter: {
													input: '$overlappingBookings',
													as: 'booking',
													cond: {
														$and: [
															{ $lte: ['$$booking.checkIn', '$$night'] },
															{ $gt: ['$$booking.checkOut', '$$night'] },
														],
													},
												},
											},
											as: 'occupied',
											in: '$$occupied.rooms',
										},
									},
								},
							},
						},
					},
				},
			},
		},
		{ $set: { availableQuantity: { $max: [0, { $subtract: ['$roomQuantity', { $max: '$nightlyBooked' }] }] } } },
		{ $match: { availableQuantity: { $gte: input.rooms } } },
		{ $unset: ['overlappingBookings', 'nightlyBooked'] },
	];
}
