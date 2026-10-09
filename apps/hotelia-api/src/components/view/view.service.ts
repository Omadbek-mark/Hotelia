import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { Types } from 'mongoose';
import { ViewGroup } from '../../libs/enums/view.enum';
import { HotelStatus } from '../../libs/enums/hotel.enum';
import { Hotels } from '../../libs/dto/hotel/hotel';
import { VisitedInquiry } from '../../libs/dto/view/visited.inquiry';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
		if (viewExist) {
			await this.touchHotelView(input);
			return null;
		}

		try {
			return await this.viewModel.create(input);
		} catch (err) {
			// Another request may have inserted this view after our existence check.
			// The unique index allows only one winner to increment the counter.
			if ((err as { code?: number })?.code === 11000) {
				await this.touchHotelView(input);
				return null;
			}
			throw err;
		}
	}

	private async touchHotelView(input: ViewInput): Promise<void> {
		if (input.viewGroup === ViewGroup.HOTEL)
			await this.viewModel.updateOne(input, { $set: { updatedAt: new Date() } }, { timestamps: false }).exec();
	}

	public async getVisitedHotels(memberId: Types.ObjectId, input: VisitedInquiry): Promise<Hotels> {
		const [result] = await this.viewModel
			.aggregate<Hotels>([
				{ $match: { memberId, viewGroup: ViewGroup.HOTEL } },
				{ $sort: { updatedAt: -1, _id: -1 } },
				{
					$lookup: {
						from: 'hotels',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'hotel',
						pipeline: [{ $match: { hotelStatus: HotelStatus.ACTIVE } }],
					},
				},
				{ $unwind: '$hotel' },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							{ $replaceRoot: { newRoot: '$hotel' } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		return result ?? { list: [], metaCounter: [] };
	}

	private async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId, viewGroup } = input;
		return await this.viewModel.findOne({ memberId, viewRefId, viewGroup }).exec();
	}
}
