import { Schema } from 'mongoose';
import { BoConfigKey, BoConfigStatus } from '../libs/enums/bo-config.enum';

const BoConfigSchema = new Schema(
	{
		configKey: { type: String, enum: BoConfigKey, required: true, immutable: true },
		value: { type: String, required: true, trim: true, minlength: 1, maxlength: 2048 },
		configStatus: { type: String, enum: BoConfigStatus, required: true, default: BoConfigStatus.PAUSED },
	},
	{ timestamps: true, collection: 'boconfigs' },
);
BoConfigSchema.index({ configKey: 1 }, { unique: true });
export default BoConfigSchema;
