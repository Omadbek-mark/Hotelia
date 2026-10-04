import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { FollowResolver } from '../../src/components/follow/follow.resolver';
import { FollowService } from '../../src/components/follow/follow.service';
import { AuthService } from '../../src/components/auth/auth.service';

describe('Follow API', () => {
	let app: INestApplication;
	const id = new Types.ObjectId(),
		target = new Types.ObjectId();
	const service = {
		subscribe: jest.fn(),
		unsubscribe: jest.fn(),
		getMemberFollowings: jest.fn(),
		getMemberFollowers: jest.fn(),
	};
	const auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				FollowResolver,
				{ provide: FollowService, useValue: service },
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
	});
	const run = (source: string, input: unknown, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues: { input },
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer valid' } : {} } },
		});
	it.each(['subscribe', 'unsubscribe'] as const)('%s requires authentication and a valid ID', async (action) => {
		const source = `mutation($input:String!){${action}(input:$input){_id}}`;
		expect((await run(source, String(target), false)).errors).toBeDefined();
		expect((await run(source, 'bad')).errors).toBeDefined();
		expect(service[action]).not.toHaveBeenCalled();
		service[action].mockResolvedValue({ _id: target });
		expect((await run(source, String(target))).errors).toBeUndefined();
		expect(service[action]).toHaveBeenCalledWith(id, target);
	});
	it('validates public inquiry and exposes only public member data', async () => {
		const source =
			'query($input:FollowInquiry!){getMemberFollowers(input:$input){list{followerData{memberNick}} metaCounter{total}}}';
		const input = { page: 1, limit: 10, search: { followingId: String(target) } };
		for (const invalid of [
			{ ...input, limit: 101 },
			{ ...input, page: 0 },
			{ ...input, search: { followingId: 'bad' } },
			{ ...input, search: null },
		])
			expect((await run(source, invalid, false)).errors).toBeDefined();
		expect(service.getMemberFollowers).not.toHaveBeenCalled();
		service.getMemberFollowers.mockResolvedValue({ list: [], metaCounter: [] });
		expect((await run(source, input, false)).errors).toBeUndefined();
		expect((await run(source.replace('memberNick', 'memberPassword'), input, false)).errors).toBeDefined();
	});
});
