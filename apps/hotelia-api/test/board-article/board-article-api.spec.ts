import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { BoardArticleResolver } from '../../src/components/board-article/board-article.resolver';
import { BoardArticleService } from '../../src/components/board-article/board-article.service';
import { AuthService } from '../../src/components/auth/auth.service';

describe('Board article API', () => {
	let app: INestApplication;
	const id = new Types.ObjectId();
	const service = {
		createBoardArticle: jest.fn(),
		updateBoardArticle: jest.fn(),
		updateBoardArticleByAdmin: jest.fn(),
		getBoardArticles: jest.fn(),
	};
	const auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				BoardArticleResolver,
				{ provide: BoardArticleService, useValue: service },
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
	it('validates travel article creation and obtains its author from authentication', async () => {
		const source = 'mutation($input:BoardArticleInput!){createBoardArticle(input:$input){_id}}';
		const input = { articleCategory: 'TRAVEL_TIPS', articleTitle: 'Seoul trip', articleContent: 'My travel story' };
		expect((await run(source, input, false)).errors).toBeDefined();
		for (const change of [
			{ articleTitle: '  ' },
			{ articleContent: 'x' },
			{ articleCategory: 'PROPERTY' },
			{ memberId: String(id) },
		])
			expect((await run(source, { ...input, ...change })).errors).toBeDefined();
		expect(service.createBoardArticle).not.toHaveBeenCalled();
		service.createBoardArticle.mockResolvedValue({ _id: id });
		expect((await run(source, input)).errors).toBeUndefined();
		expect(service.createBoardArticle).toHaveBeenCalledWith(id, expect.objectContaining(input));
	});
	it('protects admin updates and rejects forged fields and null titles', async () => {
		const source = 'mutation($input:BoardArticleUpdate!){updateBoardArticleByAdmin(input:$input){_id}}';
		expect((await run(source, { _id: String(id), articleTitle: 'Updated' })).errors).toBeDefined();
		auth.verifyToken.mockResolvedValue({ _id: id, memberType: 'ADMIN' });
		for (const change of [{ articleTitle: null }, { articleLikes: 99 }, { _id: 'bad' }])
			expect((await run(source, { _id: String(id), ...change })).errors).toBeDefined();
		expect(service.updateBoardArticleByAdmin).not.toHaveBeenCalled();
		service.updateBoardArticleByAdmin.mockResolvedValue({ _id: id });
		expect((await run(source, { _id: String(id), articleTitle: 'Updated' })).errors).toBeUndefined();
	});
	it('validates public pagination and nested filters and hides private author fields', async () => {
		const source =
			'query($input:BoardArticlesInquiry!){getBoardArticles(input:$input){list{memberData{memberNick}} metaCounter{total}}}';
		const input = { page: 1, limit: 10, search: {} };
		for (const change of [
			{ page: 0 },
			{ limit: 101 },
			{ search: { memberId: 'bad' } },
			{ search: null },
			{ direction: 5 },
		])
			expect((await run(source, { ...input, ...change }, false)).errors).toBeDefined();
		expect(service.getBoardArticles).not.toHaveBeenCalled();
		service.getBoardArticles.mockResolvedValue({ list: [], metaCounter: [] });
		expect((await run(source, input, false)).errors).toBeUndefined();
		expect((await run(source.replace('memberNick', 'memberEmail'), input, false)).errors).toBeDefined();
	});
});
