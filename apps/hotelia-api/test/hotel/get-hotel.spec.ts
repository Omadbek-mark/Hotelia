import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { ViewService } from '../../src/components/view/view.service';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { HotelResolver } from '../../src/components/hotel/hotel.resolver';
import { MemberService } from '../../src/components/member/member.service';
import { AuthService } from '../../src/components/auth/auth.service';
import { HotelStatus } from '../../src/libs/enums/hotel.enum';

describe('getHotel GraphQL', () => {
  let app: INestApplication;
  const id = new Types.ObjectId();
  const storage = { findOne: jest.fn(), findOneAndUpdate: jest.fn() };
  const views = { recordView: jest.fn() };
  const session = {};
  const connection = { transaction: jest.fn(async callback => callback(session)) };
  const auth = { verifyToken: jest.fn() };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
      providers: [HotelService, HotelResolver,
        { provide: getConnectionToken(), useValue: connection },
        { provide: ViewService, useValue: views },
        { provide: getModelToken('Hotel'), useValue: storage },
        { provide: MemberService, useValue: {} },
        { provide: AuthService, useValue: auth },
      ],
    }).compile();
    app = module.createNestApplication(); app.useLogger(false); await app.init();
  });
  afterAll(async () => app?.close());
  beforeEach(() => {
    jest.resetAllMocks();
    storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 4 }) }) });
  });
  const run = (hotelId = String(id), token?: string) => graphql({
    schema: app.get(GraphQLSchemaHost).schema,
    source: 'query($id:String!){getHotel(hotelId:$id){_id hotelName hotelStatus hotelViews}}',
    variableValues: { id: hotelId }, contextValue: { req: { headers: token ? { authorization: `Bearer ${token}` } : {} } },
  });
  it('returns an ACTIVE hotel to a guest without modifying views', async () => {
    storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 4 }) }) });
    const result = await run();
    expect(result.errors).toBeUndefined();
    expect(result.data?.getHotel).toMatchObject({ _id: String(id), hotelName: 'Seoul Stay', hotelViews: 4 });
    expect(storage.findOne).toHaveBeenCalledWith({ _id: id, hotelStatus: HotelStatus.ACTIVE });
    expect(auth.verifyToken).not.toHaveBeenCalled();
  });
  it.each([HotelStatus.PAUSED, HotelStatus.DELETE, 'MISSING'])('does not expose %s hotels', async status => {
    storage.findOne.mockImplementation(filter => ({ lean: () => ({ exec: async () => status === filter.hotelStatus ? { _id: id } : null }) }));
    const result = await run();
    expect((result.errors?.[0].originalError as any).getStatus()).toBe(404);
    expect(result.data).toBeNull();
  });
  it('rejects malformed IDs before querying MongoDB', async () => {
    const result = await run('invalid');
    expect((result.errors?.[0].originalError as any).getStatus()).toBe(400);
    expect(storage.findOne).not.toHaveBeenCalled();
  });
  it('does not disguise database failures as not-found', async () => {
    const failure = new Error('Database unavailable');
    storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => { throw failure; } }) });
    expect((await run()).errors?.[0].originalError).toBe(failure);
  });
  it('records a signed-in first visit and returns the updated count', async () => {
    const memberId = new Types.ObjectId();
    auth.verifyToken.mockResolvedValue({ _id: memberId });
    storage.findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id, hotelName: 'Seoul Stay', hotelStatus: HotelStatus.ACTIVE, hotelViews: 5 }) }) });
    views.recordView.mockResolvedValue({ _id: new Types.ObjectId() });
    const result = await run(String(id), 'valid');
    expect(result.errors).toBeUndefined();
    expect(result.data?.getHotel).toMatchObject({ hotelViews: 5 });
    expect(views.recordView).toHaveBeenCalledWith({ memberId, viewRefId: id, viewGroup: 'HOTEL' });
    expect(storage.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(storage.findOneAndUpdate.mock.calls[0][2]).toEqual({ new: true, timestamps: false });
  });
  it('does not write the hotel counter for a repeat visit', async () => {
    auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
    views.recordView.mockResolvedValue(null);
    const result = await run(String(id), 'valid');
    expect(result.errors).toBeUndefined();
    expect(result.data?.getHotel).toMatchObject({ hotelViews: 4 });
    expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
    expect(connection.transaction).not.toHaveBeenCalled();
  });
  it('propagates view failure before incrementing the counter', async () => {
    auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
    storage.findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: async () => ({ _id: id }) }) });
    const error = new Error('view write failed');
    views.recordView.mockRejectedValue(error);
    expect((await run(String(id), 'valid')).errors?.[0].originalError).toBe(error);
  });
  it('does not write a view when the signed-in request targets an unavailable hotel', async () => {
    auth.verifyToken.mockResolvedValue({ _id: new Types.ObjectId() });
    storage.findOne.mockReturnValue({ lean: () => ({ exec: async () => null }) });
    expect((await run(String(id), 'valid')).errors).toBeDefined();
    expect(views.recordView).not.toHaveBeenCalled();
  });

});
