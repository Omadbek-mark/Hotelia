import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from '../../hotelia-api/src/libs/dto/member/member';
import { Hotel } from '../../hotelia-api/src/libs/dto/hotel/hotel';
import { MemberStatus, MemberType } from '../../hotelia-api/src/libs/enums/member.enum';
import { HotelStatus } from '../../hotelia-api/src/libs/enums/hotel.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	getHello(): string {
		return 'Welcome Hotelia Batch server!';
	}

	public async batchTopHotels(): Promise<void> {
		// Compute from current counters atomically per document; preserve updatedAt.
		await this.hotelModel
			.updateMany(
				{ hotelStatus: HotelStatus.ACTIVE },
				[
					{
						$set: {
							hotelRank: {
								$add: [{ $multiply: [{ $ifNull: ['$hotelLikes', 0] }, 2] }, { $ifNull: ['$hotelViews', 0] }],
							},
						},
					},
				],
				{ timestamps: false },
			)
			.exec();
	}

	public async batchTopOwners(): Promise<void> {
		await this.memberModel
			.updateMany(
				{ memberType: MemberType.HOTEL_OWNER, memberStatus: MemberStatus.ACTIVE },
				[
					{
						$set: {
							memberRank: {
								$add: [
									{ $multiply: [{ $ifNull: ['$memberHotels', 0] }, 4] },
									{ $multiply: [{ $ifNull: ['$memberArticles', 0] }, 3] },
									{ $multiply: [{ $ifNull: ['$memberLikes', 0] }, 2] },
									{ $ifNull: ['$memberViews', 0] },
								],
							},
						},
					},
				],
				{ timestamps: false },
			)
			.exec();
	}
}
