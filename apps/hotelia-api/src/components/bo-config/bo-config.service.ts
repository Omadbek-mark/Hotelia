import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoConfig, BoConfigInput } from '../../libs/dto/bo-config/bo-config';
import { BoConfigStatus } from '../../libs/enums/bo-config.enum';

@Injectable()
export class BoConfigService {
	constructor(@InjectModel('BoConfig') private readonly boConfigModel: Model<BoConfig>) {}

	getBoConfigs(): Promise<BoConfig[]> {
		return this.boConfigModel.find({ configStatus: BoConfigStatus.ACTIVE }).sort({ configKey: 1 }).lean().exec();
	}
	getAllBoConfigsByAdmin(): Promise<BoConfig[]> {
		return this.boConfigModel.find().sort({ configKey: 1 }).lean().exec();
	}
	async saveBoConfig(input: BoConfigInput): Promise<BoConfig> {
		try {
			return await this.boConfigModel
				.findOneAndUpdate(
					{ configKey: input.configKey },
					{ $set: { value: input.value, configStatus: input.configStatus } },
					{ upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
				)
				.exec();
		} catch (error) {
			if ((error as { code?: number })?.code === 11000)
				throw new ConflictException('Configuration changed concurrently; please retry');
			throw error;
		}
	}
}
