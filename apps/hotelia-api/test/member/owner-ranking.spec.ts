import { ValidationPipe } from '@nestjs/common';
import { Types } from 'mongoose';
import { MemberService } from '../../src/components/member/member.service';
import { HotelOwnersInquiry } from '../../src/libs/dto/member/member.input';
import { Direction } from '../../src/libs/enums/common.enum';

describe('Home owner ranking', () => {
 const aggregate = jest.fn();
 const service = new MemberService({ aggregate } as any, {} as any, {} as any, {} as any, {} as any);
 beforeEach(() => aggregate.mockReset().mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] }));
 const input = { page: 1, limit: 3, sort: 'memberFollowers', direction: Direction.DESC, search: {} };
 it('allows ranking by followers and applies the order before limiting the active owner list', async () => {
  await expect(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }).transform(input, { type: 'body', metatype: HotelOwnersInquiry })).resolves.toMatchObject(input);
  await service.getHotelOwners(null as any, input);
  const pipeline = aggregate.mock.calls[0][0];
  expect(pipeline[0].$match).toEqual({ memberType: 'HOTEL_OWNER', memberStatus: 'ACTIVE' });
  expect(pipeline[1].$sort).toEqual({ memberFollowers: -1, _id: -1 });
  expect(pipeline[2].$facet.list[1]).toEqual({ $limit: 3 });
  expect(pipeline[2].$facet.list.some(stage => stage.$lookup?.as === 'meFollowed')).toBe(false);
 });
 it('looks up only the current viewer’s follow relationship for each ranked owner', async () => {
  const viewer = new Types.ObjectId();
  await service.getHotelOwners(viewer, input);
  const lookup = aggregate.mock.calls[0][0][2].$facet.list.find(stage => stage.$lookup?.as === 'meFollowed').$lookup;
  expect(lookup.let.localFollowerId).toEqual(viewer);
  expect(lookup.let.localFollowingId).toBe('$_id');
  expect(lookup.pipeline[0].$match.$expr.$and).toHaveLength(2);
 });
});
