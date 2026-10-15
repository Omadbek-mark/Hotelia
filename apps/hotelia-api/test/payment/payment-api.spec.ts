import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { AuthService } from '../../src/components/auth/auth.service';
import { PaymentService } from '../../src/components/payment/payment.service';
import { PaymentResolver } from '../../src/components/payment/payment.resolver';
import PaymentCardSchema from '../../src/schemas/PaymentCard.model';

const memberId = new Types.ObjectId(),
	cardId = new Types.ObjectId();
const input = { cardBrand: 'VISA', cardLast4: '4242', cardHolderName: ' Bobur ', expiryMonth: 12, expiryYear: 2030 };
const record = {
	_id: cardId,
	...input,
	cardHolderName: 'Bobur',
	cardStatus: 'PENDING',
	createdAt: new Date(),
	updatedAt: new Date(),
};
describe('Private demo payment card API', () => {
	let app: INestApplication;
	const cards = { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
		auth = { verifyToken: jest.fn() };
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true })],
			providers: [
				PaymentService,
				PaymentResolver,
				{ provide: getModelToken('PaymentCard'), useValue: cards },
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
		cards.findOne.mockReturnValue({ lean: () => ({ exec: async () => record }) });
		cards.findOneAndUpdate.mockReturnValue({ exec: async () => record });
	});
	const run = (source: string, variableValues = {}, signedIn = true) =>
		graphql({
			schema: app.get(GraphQLSchemaHost).schema,
			source,
			variableValues,
			contextValue: { req: { headers: signedIn ? { authorization: 'Bearer demo' } : {} } },
		});
	const save = (value = input, signedIn = true) =>
		run(
			'mutation($input:PaymentCardInput!){saveMyPaymentCard(input:$input){_id cardLast4 cardStatus cardHolderName}}',
			{ input: value },
			signedIn,
		);
	it('requires authentication and derives ownership from JWT for reads and writes', async () => {
		expect((await save(input, false)).errors).toBeDefined();
		expect((await run('query{getMyPaymentCard{_id}}', {}, false)).errors).toBeDefined();
		expect(cards.findOne).not.toHaveBeenCalled();
		expect(cards.findOneAndUpdate).not.toHaveBeenCalled();
		expect((await run('query{getMyPaymentCard{_id cardLast4}}')).errors).toBeUndefined();
		expect(cards.findOne).toHaveBeenCalledWith({ memberId });
		const other = new Types.ObjectId();
		auth.verifyToken.mockResolvedValue({ _id: other, memberType: 'USER' });
		await run('query{getMyPaymentCard{_id}}');
		expect(cards.findOne).toHaveBeenLastCalledWith({ memberId: other });
	});
	it('saves only masked demo metadata and forces pending status', async () => {
		const result = await save();
		expect(result.errors).toBeUndefined();
		expect((result.data as any).saveMyPaymentCard).toMatchObject({ cardStatus: 'PENDING', cardLast4: '4242' });
		expect(cards.findOneAndUpdate).toHaveBeenCalledWith(
			{ memberId },
			{ $set: { ...input, cardHolderName: 'Bobur', cardStatus: 'PENDING' } },
			{ upsert: true, new: true, runValidators: true },
		);
		expect(PaymentCardSchema.path('cardNumber')).toBeUndefined();
		expect(PaymentCardSchema.path('cvv')).toBeUndefined();
		expect(PaymentCardSchema.indexes()).toContainEqual([{ memberId: 1 }, expect.objectContaining({ unique: true })]);
	});
	it.each([
		{ cardNumber: '4242424242424242' },
		{ cvv: '123' },
		{ memberId: String(new Types.ObjectId()) },
		{ cardStatus: 'VERIFIED' },
		{ cardLast4: '1234' },
		{ expiryMonth: 13 },
		{ expiryYear: 2020 },
		{ cardHolderName: '  ' },
	])('rejects forged or invalid card input %j', async (change) => {
		expect((await save({ ...input, ...change })).errors).toBeDefined();
		expect(cards.findOneAndUpdate).not.toHaveBeenCalled();
	});
	it('handles a concurrent insert without creating a second card', async () => {
		cards.findOneAndUpdate
			.mockReturnValueOnce({
				exec: async () => {
					throw { code: 11000 };
				},
			})
			.mockReturnValueOnce({ orFail: () => ({ exec: async () => record }) });
		expect((await save()).errors).toBeUndefined();
		expect(cards.findOneAndUpdate.mock.calls[1][0]).toEqual({ memberId });
		expect(cards.findOneAndUpdate.mock.calls[1][2].upsert).toBeUndefined();
	});
});
