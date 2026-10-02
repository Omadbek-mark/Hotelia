import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Connection, Model } from 'mongoose';
import { Hotel } from '../../libs/dto/hotel/hotel';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { MemberService } from '../member/member.service';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class HotelService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly memberService: MemberService,
    @InjectModel('Hotel') private readonly hotelModel: Model<Hotel>,
  ) {}

  public async createHotel(input: HotelInput): Promise<Hotel> {
    try {
      // Both writes commit together; either failure rolls back both changes.
      return await this.connection.transaction(async (session) => {
        const [result] = await this.hotelModel.create([input], { session });
        await this.memberService.memberStatsEditor({
          _id: result.ownerId,
          targetKey: 'memberHotels',
          modifier: 1,
        }, session);
        return result;
      });
    } catch (err) {
      if (err instanceof MongooseError.ValidationError) {
        throw new BadRequestException(Message.CREATE_FAILED);
      }
      throw err;
    }
  }
}
