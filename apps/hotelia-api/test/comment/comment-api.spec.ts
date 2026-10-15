import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { CommentResolver } from '../../src/components/comment/comment.resolver';
import { CommentService } from '../../src/components/comment/comment.service';
import { AuthService } from '../../src/components/auth/auth.service';

describe('Hotel reviews through comment API', () => {
	let app: INestApplication;
	const id = new Types.ObjectId();
	const service = {
		createComment: jest.fn(),
		updateComment: jest.fn(),
		getComments: jest.fn(),
		getOwnerReviews: jest.fn(),
		removeCommentByAdmin: jest.fn(),
	};
	const auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				CommentResolver,
				{ provide: CommentService, useValue: service },
				{ provide: AuthService, useValue: auth },
			],
		}).compile();
		app = module.createNestApplication();
		app.useLogger(false);
		await app.init();
	});
	afterAll(async () => app?.close());
	beforeEach(() => {
		jest.resetAllMocks();
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'USER' });
		service.createComment.mockResolvedValue({ _id: id, rating: 5 });
		service.updateComment.mockResolvedValue({ _id: id, rating: 3 });
		service.getComments.mockResolvedValue({ list: [], metaCounter: [] });
	});
	const run = (source: string, input: unknown, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues: { input },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	const base = {
		commentGroup: 'HOTEL',
		commentRefId: String(id),
		bookingId: String(id),
		rating: 5,
		commentContent: 'Good stay',
	};
	it('restricts owner reviews to owners and validates pagination and hotel identity', async () => {
		const source = 'query($input:OwnerReviewsInquiry!){getOwnerReviews(input:$input){list{_id} metaCounter{total}}}';
		expect((await run(source, {}, false)).errors).toBeDefined();
		expect((await run(source, {})).errors).toBeDefined();
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'HOTEL_OWNER' });
		for (const input of [{ hotelId: 'bad' }, { limit: 101 }, { page: 0 }, { ownerId: String(id) }])
			expect((await run(source, input)).errors).toBeDefined();
		expect(service.getOwnerReviews).not.toHaveBeenCalled();
		service.getOwnerReviews.mockResolvedValue({ list: [], metaCounter: [] });
		expect((await run(source, {})).errors).toBeUndefined();
		expect(service.getOwnerReviews).toHaveBeenCalledWith(id, expect.objectContaining({ page: 1, limit: 20 }));
	});
	const create = (input: unknown, signedIn = true) =>
		run('mutation($input:CommentInput!){createComment(input:$input){_id rating}}', input, signedIn);
	it('requires authentication and validates hotel review fields', async () => {
		expect((await create(base, false)).errors).toBeDefined();
		for (const change of [
			{ commentGroup: 'PROPERTY' },
			{ rating: undefined },
			{ rating: 0 },
			{ rating: 6 },
			{ rating: 2.5 },
			{ bookingId: undefined },
			{ bookingId: 'bad' },
			{ commentContent: '   ' },
			{ memberId: String(id) },
		]) {
			expect((await create({ ...base, ...change })).errors).toBeDefined();
		}
		expect(service.createComment).not.toHaveBeenCalled();
		expect((await create(base)).errors).toBeUndefined();
		expect(service.createComment).toHaveBeenCalledWith(id, expect.objectContaining(base));
	});
	it('allows authenticated hotel comments without booking or rating', async () => {
		const input = { commentGroup: 'HOTEL', commentRefId: String(id), commentContent: 'Looks beautiful' };
		expect((await create(input, false)).errors).toBeDefined();
		expect((await create(input)).errors).toBeUndefined();
		expect(service.createComment).toHaveBeenCalledWith(id, expect.objectContaining(input));
	});
	it('keeps article comments working without review-only fields', async () => {
		expect(
			(await create({ commentGroup: 'ARTICLE', commentRefId: String(id), commentContent: 'Useful article' })).errors,
		).toBeUndefined();
	});
	it('validates update rating and rejects attempts to replace the booking identity', async () => {
		const source = 'mutation($input:CommentUpdate!){updateComment(input:$input){_id rating}}';
		for (const change of [{ rating: null }, { rating: 6 }, { bookingId: String(id) }])
			expect((await run(source, { _id: String(id), ...change })).errors).toBeDefined();
		expect(service.updateComment).not.toHaveBeenCalled();
		expect((await run(source, { _id: String(id), rating: 3 })).errors).toBeUndefined();
	});
	it('supports public hotel review pagination and rejects oversized pages', async () => {
		const source =
			'query($input:CommentsInquiry!){getComments(input:$input){list{rating memberData{memberNick}} metaCounter{total}}}';
		const input = { page: 1, limit: 10, search: { commentGroup: 'HOTEL', commentRefId: String(id) } };
		expect((await run(source, { ...input, limit: 101 }, false)).errors).toBeDefined();
		expect((await run(source, input, false)).errors).toBeUndefined();
	});
});


describe('Hotel comment service', () => {
	const hotelId = new Types.ObjectId(), memberId = new Types.ObjectId();
	let comments: any, hotels: any, bookings: any, service: CommentService;
	beforeEach(() => {
		comments = {
			countDocuments: jest.fn(() => ({ session: () => ({ exec: async () => 3 }) })),
			create: jest.fn(async (docs) => [{ _id: new Types.ObjectId(), ...docs[0] }]),
			aggregate: jest.fn(() => ({ session: () => ({ exec: async () => [{ count: 2, rating: 4.5 }] }) })),
		};
		hotels = {
			findOneAndUpdate: jest.fn(() => ({ exec: async () => ({ _id: hotelId }) })),
			updateOne: jest.fn(() => ({ exec: async () => ({}) })),
		};
		bookings = { findOne: jest.fn() };
		service = new CommentService(comments, {} as any, {} as any, bookings, hotels, { transaction: async (fn) => fn({}) } as any, {} as any);
	});
	const input = () => ({ commentGroup: 'HOTEL', commentRefId: hotelId, commentContent: 'Lovely place' } as any);
	it('writes a plain authenticated comment without querying a booking or altering verified rating counts', async () => {
		const result = await service.createComment(memberId as any, input());
		expect(result.commentContent).toBe('Lovely place');
		expect(result.bookingId).toBeUndefined();
		expect(result.rating).toBeUndefined();
		expect(bookings.findOne).not.toHaveBeenCalled();
		expect(hotels.findOneAndUpdate.mock.calls[0][0]).toMatchObject({ hotelStatus: 'ACTIVE' });
		expect(comments.aggregate.mock.calls[0][0][0].$match).toMatchObject({ bookingId: { $type: 'objectId' }, rating: { $gte: 1, $lte: 5 } });
		expect(hotels.updateOne.mock.calls[0][1]).toEqual({ $set: { hotelReviews: 2, hotelRating: 4.5, hotelRank: 3 } });
	});
	it('rejects comments on inactive or missing hotels before writing', async () => {
		hotels.findOneAndUpdate.mockReturnValue({ exec: async () => null });
		await expect(service.createComment(memberId as any, input())).rejects.toMatchObject({ status: 404 });
		expect(comments.create).not.toHaveBeenCalled();
	});
	it('requires both booking and rating when creating a verified review', async () => {
		await expect(service.createComment(memberId as any, { ...input(), rating: 5 })).rejects.toMatchObject({ status: 400 });
		await expect(service.createComment(memberId as any, { ...input(), bookingId: String(new Types.ObjectId()) })).rejects.toMatchObject({ status: 400 });
		expect(comments.create).not.toHaveBeenCalled();
	});
	it('prevents adding a rating to an ordinary comment', async () => {
		comments.findOne = jest.fn(() => ({ lean: () => ({ exec: async () => ({ ...input(), _id: new Types.ObjectId() }) }) }));
		await expect(service.updateComment(memberId as any, { _id: new Types.ObjectId(), rating: 5 } as any)).rejects.toMatchObject({ status: 400 });
	});
});
