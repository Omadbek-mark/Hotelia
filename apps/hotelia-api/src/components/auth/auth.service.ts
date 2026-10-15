import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Member } from '../../libs/dto/member/member';
import { Session } from '../../libs/dto/auth/session';
import { TokenPair } from '../../libs/dto/auth/token-pair';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel('Member') private memberModel: Model<Member>,
    @InjectModel('Session') private sessionModel: Model<Session>,
  ) {}

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }

  public async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private newRefreshToken(sessionId: Types.ObjectId): string {
    return `${sessionId.toHexString()}.${randomBytes(32).toString('hex')}`;
  }

  private async signAccessToken(memberId: string, sessionId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: memberId, sid: sessionId, type: 'access' }, { expiresIn: '15m' });
  }

  public async createSession(member: Member): Promise<TokenPair> {
    if (member.memberStatus !== MemberStatus.ACTIVE) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    const sessionId = new Types.ObjectId();
    const refreshToken = this.newRefreshToken(sessionId);
    const accessToken = await this.signAccessToken(member._id.toString(), sessionId.toString());
    await this.sessionModel.create({
      _id: sessionId,
      memberId: member._id,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { accessToken, refreshToken };
  }

  private async activeMember(id: Types.ObjectId): Promise<Member> {
    const member = await this.memberModel.findOne({ _id: id, memberStatus: MemberStatus.ACTIVE })
      .select('-memberPassword').lean().exec();
    if (!member) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    return member as Member;
  }

  public async refreshTokens(token: string): Promise<TokenPair> {
    if (!/^[a-f0-9]{24}\.[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    const sessionId = new Types.ObjectId(token.slice(0, 24));
    const filter = {
      _id: sessionId, refreshTokenHash: this.hashRefreshToken(token),
      revokedAt: null, expiresAt: { $gt: new Date() },
    };
    const session = await this.sessionModel.findOne(filter).lean().exec();
    if (!session) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    await this.activeMember(session.memberId);
    const refreshToken = this.newRefreshToken(sessionId);
    const accessToken = await this.signAccessToken(session.memberId.toString(), sessionId.toString());
    // Compare-and-swap: a token can rotate only once, including concurrent requests.
    const rotated = await this.sessionModel.findOneAndUpdate(
      { ...filter, expiresAt: { $gt: new Date() } },
      { $set: { refreshTokenHash: this.hashRefreshToken(refreshToken) } },
      { new: true },
    ).exec();
    if (!rotated) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    return { accessToken, refreshToken };
  }

  public async verifyToken(token: string): Promise<Member> {
    let payload: { sub?: unknown; sid?: unknown; type?: unknown };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    }
    const validId = (id: unknown): id is string => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
    if (!validId(payload?.sub) || !validId(payload?.sid) || payload.type !== 'access') {
      throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    }
    const memberId = new Types.ObjectId(payload.sub);
    const member = await this.activeMember(memberId);
    const session = await this.sessionModel.findOne({
      _id: new Types.ObjectId(payload.sid), memberId,
      revokedAt: null, expiresAt: { $gt: new Date() },
    }).lean().exec();
    if (!session) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    member.authSessionId = session._id.toString();
    return member;
  }

  public async logout(member: Member): Promise<boolean> {
    if (!member.authSessionId) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    await this.sessionModel.updateOne({
      _id: new Types.ObjectId(member.authSessionId), memberId: member._id, revokedAt: null,
    }, { $set: { revokedAt: new Date() } }).exec();
    return true;
  }
}
