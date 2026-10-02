import { Schema } from 'mongoose';

const SessionSchema = new Schema({
  memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  refreshTokenHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
}, { timestamps: true, collection: 'sessions' });

// TTL cleanup is asynchronous; authentication also checks expiresAt explicitly.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default SessionSchema;
