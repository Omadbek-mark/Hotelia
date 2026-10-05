import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
		if (viewExist) return null;

		try {
			return await this.viewModel.create(input);
		} catch (err) {
			// Another request may have inserted this view after our existence check.
			// The unique index allows only one winner to increment the counter.
			if ((err as { code?: number })?.code === 11000) return null;
			throw err;
		}
	}

	private async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId, viewGroup } = input;
		return await this.viewModel.findOne({ memberId, viewRefId, viewGroup }).exec();
	}
}
