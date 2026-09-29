import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel('Member') private memberModel: Model<Member>,
  ) {}

  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    return this.jwtService.signAsync({ sub: member._id.toString() });
  }

  public async verifyToken(token: string): Promise<Member> {
    let payload: { sub?: unknown; _id?: unknown };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    }
    // Accept existing tokens with _id during the transition; never trust their role.
    const id = payload?.sub ?? payload?._id;
    if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    }
    // Database failures propagate instead of being misreported as invalid credentials.
    const member = await this.memberModel.findOne({
      _id: new Types.ObjectId(id), memberStatus: MemberStatus.ACTIVE,
    }).select('-memberPassword').lean().exec();
    if (!member) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);
    return member as Member;
  }
}
