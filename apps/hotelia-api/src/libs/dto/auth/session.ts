import { Types } from 'mongoose';

export interface Session {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}
