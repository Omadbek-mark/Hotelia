import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Connection, FilterQuery, Model, Types } from 'mongoose';
import { Hotel, Hotels } from '../../libs/dto/hotel/hotel';
import { HotelsInquiry } from '../../libs/dto/hotel/hotel.inquiry';
import { escapeSearchText } from '../../libs/search';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { MemberService } from '../member/member.service';
import { HotelSort, HotelStatus } from '../../libs/enums/hotel.enum';
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

  public async getHotels(input: HotelsInquiry): Promise<Hotels> {
    const match: FilterQuery<Hotel> = { hotelStatus: HotelStatus.ACTIVE };
    this.shapeMatchQuery(match, input);
    const sorts: Record<HotelSort, Record<string, 1 | -1>> = {
      [HotelSort.NEWEST]: { createdAt: -1, _id: -1 },
      [HotelSort.RATING]: { hotelRating: -1, _id: -1 },
      [HotelSort.MOST_POPULAR]: { hotelViews: -1, _id: -1 },
    };
    const result = await this.hotelModel.aggregate<Hotels>([
      { $match: match },
      { $sort: sorts[input.sort] },
      { $facet: {
        list: [
          { $skip: (input.page - 1) * input.limit },
          { $limit: input.limit },
          { $lookup: {
            from: 'members',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'memberData',
            pipeline: [
              { $match: { memberStatus: MemberStatus.ACTIVE, memberType: MemberType.HOTEL_OWNER } },
              { $project: { _id: 1, memberNick: 1, memberImage: 1, memberDesc: 1 } },
            ],
          } },
          { $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
        ],
        metaCounter: [{ $count: 'total' }],
      } },
    ]).exec();
    return result[0] ?? { list: [], metaCounter: [] };
  }

  private shapeMatchQuery(match: FilterQuery<Hotel>, input: HotelsInquiry): void {
    const { text, destination, hotelType, minRating, amenities } = input.search ?? {};
    if (text?.trim()) match.hotelName = { $regex: escapeSearchText(text.trim()), $options: 'i' };
    if (destination?.trim()) {
      const location = { $regex: escapeSearchText(destination.trim()), $options: 'i' };
      match.$or = [{ hotelCountry: location }, { hotelCity: location }, { hotelAddress: location }];
    }
    if (hotelType) match.hotelType = hotelType;
    if (minRating !== undefined) match.hotelRating = { $gte: minRating };
    // Every selected amenity must be present on the hotel.
    if (amenities?.length) match.hotelAmenities = { $all: amenities };
  }

  public async getHotel(hotelId: Types.ObjectId, memberId?: Types.ObjectId | null): Promise<Hotel> {
    const search = {
      _id: hotelId,
      hotelStatus: HotelStatus.ACTIVE,
    };

    let targetHotel: Hotel | null = await this.hotelModel.findOne(search).lean().exec();
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
        targetHotel = updatedHotel;
      }
    }

    targetHotel.memberData = await this.memberService.getHotelOwner(targetHotel.ownerId);
    return targetHotel;
  }

}
