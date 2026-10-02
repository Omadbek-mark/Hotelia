import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Connection, Model, Types } from 'mongoose';
import { Hotel } from '../../libs/dto/hotel/hotel';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { MemberService } from '../member/member.service';
import { HotelStatus } from '../../libs/enums/hotel.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class HotelService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService,
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

  public async getHotel(hotelId: Types.ObjectId, memberId?: Types.ObjectId | null): Promise<Hotel> {
    const search = {
      _id: hotelId,
      hotelStatus: HotelStatus.ACTIVE,
    };

    const targetHotel: Hotel | null = await this.hotelModel.findOne(search).lean().exec();
    if (!targetHotel) throw new NotFoundException(Message.NO_DATA_FOUND);

    if (memberId) {
      const newView = await this.viewService.recordView({
        memberId, viewRefId: hotelId, viewGroup: ViewGroup.HOTEL,
      });
      if (newView) {
        const updatedHotel = await this.hotelModel.findOneAndUpdate(
          search, { $inc: { hotelViews: 1 } }, { new: true, timestamps: false },
        ).lean().exec();
        if (!updatedHotel) throw new NotFoundException(Message.NO_DATA_FOUND);
        return updatedHotel;
      }
    }

    return targetHotel;
  }

}
