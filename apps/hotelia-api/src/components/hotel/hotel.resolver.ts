import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Hotel } from '../../libs/dto/hotel/hotel';
import { HotelInput } from '../../libs/dto/hotel/hotel.input';
import { Types } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HotelService } from './hotel.service';

@Resolver(() => Hotel)
export class HotelResolver {
  constructor(private readonly hotelService: HotelService) {}

  @Roles(MemberType.HOTEL_OWNER)
  @UseGuards(RolesGuard)
  @Mutation(() => Hotel)
  public async createHotel(
    @AuthMember('_id') memberId: Types.ObjectId,
    @Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) input: HotelInput,
  ): Promise<Hotel> {
    input.ownerId = memberId;
    return await this.hotelService.createHotel(input);
  }
}
