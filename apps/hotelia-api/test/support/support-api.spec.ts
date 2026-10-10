import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { SupportService } from '../../src/components/support/support.service';
import { SupportResolver } from '../../src/components/support/support.resolver';
import { AuthService } from '../../src/components/auth/auth.service';
import NoticeSchema from '../../src/schemas/Notice.model';

describe('Support API privacy and request delivery', () => {
	let app: INestApplication;
	const memberId = new Types.ObjectId(),
		id = new Types.ObjectId();
	const storage = { aggregate: jest.fn(), findOneAndUpdate: jest.fn(), findOne: jest.fn() },
		auth = { verifyToken: jest.fn() };
	const input = {
		noticeTitle: 'Check-in question',
		noticeContent: 'Can I arrive late in the evening?',
		requestId: '11111111-1111-4111-8111-111111111111',
	};
	const row = {
		_id: id,
		noticeCategory: 'INQUIRY',
		noticeStatus: 'HOLD',
		...input,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	const lean = (value: any) => ({ lean: () => ({ exec: async () => value }) });
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				SupportService,
				SupportResolver,
				{ provide: getModelToken('Notice'), useValue: storage },
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
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'USER' });
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		storage.findOneAndUpdate.mockReturnValue(lean(row));
		storage.findOne.mockReturnValue(lean(row));
	});
	const run = (source: string, variables: any = {}, token?: string) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues: variables,
			contextValue: { req: { headers: token ? { authorization: `Bearer ${token}` } : {} } },
		});
	const send = (value: any = input, token: string | undefined = 'token') =>
		run(
			'mutation($input:SupportInquiryInput!){createSupportInquiry(input:$input){_id noticeStatus noticeTitle}}',
			{ input: value },
			token,
		);
	test('public notices include only active public categories', async () => {
		const response = await run('query{getSupportNotices(input:{page:2,limit:5}){list{_id} metaCounter{total}}}');
		expect(response.errors).toBeUndefined();
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({
			noticeStatus: 'ACTIVE',
			noticeCategory: { $in: ['FAQ', 'TERMS', 'ANNOUNCEMENT'] },
		});
		expect(pipeline[2].$facet.list[0].$skip).toBe(5);
		expect(auth.verifyToken).not.toHaveBeenCalled();
	});
	test('public queries reject the inquiry category and invalid page limits', async () => {
		for (const body of ['noticeCategory:INQUIRY', 'page:0', 'limit:51', 'page:1.5']) {
			expect((await run(`query{getSupportNotices(input:{${body}}){list{_id}}}`)).errors).toBeDefined();
		}
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
	test('anonymous inquiries cannot be read or created', async () => {
		expect((await run('query{getMyInquiries(input:{}){list{_id}}}')).errors).toBeDefined();
		expect(
			(await run('mutation($input:SupportInquiryInput!){createSupportInquiry(input:$input){_id}}', { input })).errors,
		).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	test('private inquiry listing scopes the database query to the session member', async () => {
		expect((await run('query{getMyInquiries(input:{page:1}){list{_id}}}', {}, 'token')).errors).toBeUndefined();
		expect(storage.aggregate.mock.calls[0][0][0].$match).toEqual({
			memberId,
			noticeCategory: 'INQUIRY',
			noticeStatus: { $ne: 'DELETE' },
		});
	});
	test('creation trims content and assigns status/category/member on the server', async () => {
		const response = await send({
			...input,
			noticeTitle: '  ' + input.noticeTitle + '  ',
			noticeContent: '  ' + input.noticeContent + '  ',
		});
		expect(response.errors).toBeUndefined();
		const [filter, update] = storage.findOneAndUpdate.mock.calls[0];
		expect(filter).toEqual({ memberId, noticeCategory: 'INQUIRY', requestId: input.requestId });
		expect(update.$setOnInsert).toEqual({
			...filter,
			noticeTitle: input.noticeTitle,
			noticeContent: input.noticeContent,
			noticeStatus: 'HOLD',
		});
	});
	test('schema rejects caller ownership and status fields', async () => {
		for (const value of [
			{ ...input, memberId: String(id) },
			{ ...input, noticeStatus: 'ACTIVE' },
			{ ...input, noticeCategory: 'FAQ' },
		])
			expect((await send(value)).errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	test('invalid lengths and request IDs are rejected before writing', async () => {
		for (const value of [
			{ ...input, noticeTitle: 'x' },
			{ ...input, noticeContent: 'short' },
			{ ...input, noticeContent: 'x'.repeat(2001) },
			{ ...input, requestId: 'bad' },
		])
			expect((await send(value)).errors).toBeDefined();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	test('duplicate-key races return the original request and retry does not change content', async () => {
		storage.findOneAndUpdate.mockReturnValue({
			lean: () => ({
				exec: async () => {
					throw { code: 11000 };
				},
			}),
		});
		expect((await send()).errors).toBeUndefined();
		expect(storage.findOne).toHaveBeenCalledWith({ memberId, noticeCategory: 'INQUIRY', requestId: input.requestId });
		expect((await send({ ...input, noticeContent: 'A different message for the same request.' })).errors).toBeDefined();
	});
	test('request identity is unique per member, without indexing historical missing IDs', () => {
		expect(NoticeSchema.indexes()).toContainEqual([
			{ memberId: 1, requestId: 1 },
			expect.objectContaining({ unique: true, partialFilterExpression: { requestId: { $type: 'string' } } }),
		]);
	});
	test('all support administration operations reject anonymous guests and hotel owners', async () => {
		const commands = [
			'query {getSupportByAdmin(input:{noticeCategory:INQUIRY}){list{_id memberId}}}',
			`mutation {createSupportByAdmin(input:{noticeTitle:"A guide",noticeContent:"Some helpful guidance",requestId:"${input.requestId}",noticeCategory:FAQ,noticeStatus:HOLD}){_id}}`,
			`mutation {updateSupportByAdmin(input:{_id:"${id}",expectedRevision:0,noticeTitle:"A guide",noticeContent:"Some helpful guidance",noticeStatus:ACTIVE}){_id}}`,
			`mutation {replySupportByAdmin(input:{_id:"${id}",expectedRevision:0,noticeResponse:"A considered reply"}){_id}}`,
		];
		for (const role of ['USER', 'HOTEL_OWNER']) {
			auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: role });
			for (const command of commands) expect((await run(command, {}, 'token')).errors).toBeDefined();
		}
		for (const command of commands) expect((await run(command)).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
		expect(storage.findOneAndUpdate).not.toHaveBeenCalled();
	});
	test('admin listing includes private inquiry references with a legacy revision of zero', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'ADMIN' });
		storage.aggregate.mockReturnValue({
			exec: async () => [{ list: [{ ...row, memberId }], metaCounter: [{ total: 1 }] }],
		});
		const response = await run(
			'query {getSupportByAdmin(input:{noticeCategory:INQUIRY,noticeStatus:HOLD,page:2,limit:5}){list{_id memberId noticeRevision} metaCounter{total}}}',
			{},
			'token',
		);
		expect(response.errors).toBeUndefined();
		expect((response.data as any).getSupportByAdmin.list[0]).toMatchObject({
			memberId: String(memberId),
			noticeRevision: 0,
		});
		expect(storage.aggregate.mock.calls[0][0][0].$match).toEqual({ noticeCategory: 'INQUIRY', noticeStatus: 'HOLD' });
	});
	test('admin public creation assigns the actor and prevents inquiry creation or caller ownership', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'ADMIN' });
		const publicInput = { ...input, noticeCategory: 'FAQ', noticeStatus: 'HOLD' };
		storage.findOneAndUpdate.mockReturnValue(lean({ ...row, ...publicInput, memberId, noticeRevision: 0 }));
		const command =
			'mutation($input:AdminSupportCreate!){createSupportByAdmin(input:$input){_id memberId noticeRevision}}';
		expect((await run(command, { input: publicInput }, 'token')).errors).toBeUndefined();
		expect(storage.findOneAndUpdate.mock.calls[0][1].$setOnInsert.memberId).toEqual(memberId);
		for (const invalid of [
			{ ...publicInput, noticeCategory: 'INQUIRY' },
			{ ...publicInput, memberId: String(id) },
			{ ...publicInput, noticeStatus: 'DELETE' },
		])
			expect((await run(command, { input: invalid }, 'token')).errors).toBeDefined();
		expect(storage.findOneAndUpdate).toHaveBeenCalledTimes(1);
	});
	test('public editing uses a revision compare-and-swap and cannot turn an inquiry public', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'ADMIN' });
		storage.findOneAndUpdate.mockReturnValue(lean({ ...row, memberId, noticeCategory: 'FAQ', noticeRevision: 4 }));
		const value = {
			_id: String(id),
			expectedRevision: 3,
			noticeTitle: 'Updated guide',
			noticeContent: 'Updated helpful content',
			noticeStatus: 'ACTIVE',
		};
		const command = 'mutation($input:AdminSupportUpdate!){updateSupportByAdmin(input:$input){_id noticeRevision}}';
		expect((await run(command, { input: value }, 'token')).errors).toBeUndefined();
		const [filter, update] = storage.findOneAndUpdate.mock.calls[0];
		expect(filter).toMatchObject({ noticeRevision: 3, noticeCategory: { $in: ['FAQ', 'TERMS', 'ANNOUNCEMENT'] } });
		expect(update.$inc).toEqual({ noticeRevision: 1 });
		expect(update.$set).not.toHaveProperty('memberId');
		expect(update.$set).not.toHaveProperty('noticeCategory');
		storage.findOneAndUpdate.mockReturnValue(lean(null));
		expect((await run(command, { input: value }, 'token')).errors?.[0].message).toMatch(/changed/);
	});
	test('inquiry reply remains private, trims text, increments revision and rejects stale saves', async () => {
		auth.verifyToken.mockResolvedValue({ _id: memberId, memberType: 'ADMIN' });
		storage.findOneAndUpdate.mockReturnValue(lean({ ...row, memberId, noticeRevision: 1 }));
		const value = { _id: String(id), expectedRevision: 0, noticeResponse: '  A considered reply to the guest.  ' };
		const command = 'mutation($input:AdminSupportReply!){replySupportByAdmin(input:$input){_id noticeRevision}}';
		expect((await run(command, { input: value }, 'token')).errors).toBeUndefined();
		const [filter, update] = storage.findOneAndUpdate.mock.calls[0];
		expect(filter).toMatchObject({
			noticeCategory: 'INQUIRY',
			noticeStatus: { $ne: 'DELETE' },
			$or: [{ noticeRevision: 0 }, { noticeRevision: { $exists: false } }],
		});
		expect(update.$set).toEqual({
			noticeResponse: value.noticeResponse.trim(),
			respondedAt: expect.any(Date),
			noticeStatus: 'ACTIVE',
		});
		expect(update.$inc).toEqual({ noticeRevision: 1 });
		storage.findOneAndUpdate.mockReturnValue(lean(null));
		expect((await run(command, { input: value }, 'token')).errors).toBeDefined();
	});
	test('public GraphQL types do not expose member ownership or administration revision', async () => {
		expect((await run('query {getSupportNotices(input:{}){list{memberId noticeRevision}}}')).errors).toBeDefined();
		expect(storage.aggregate).not.toHaveBeenCalled();
	});
});
