import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OwnerDashboard {
	@Field(() => Int)
	totalHotels!: number;

	@Field(() => Int)
	totalRooms!: number;

	@Field(() => Int)
	totalBookings!: number;

	@Field(() => Float)
	totalRevenue!: number;

	@Field(() => String)
	currency!: string;
}
