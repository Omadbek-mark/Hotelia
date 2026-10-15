import { ViewService } from '../../src/components/view/view.service';
import { Types } from 'mongoose';
import { ViewGroup } from '../../src/libs/enums/view.enum';

describe('recordView duplicate handling', () => {
	const input = { memberId: new Types.ObjectId(), viewRefId: new Types.ObjectId(), viewGroup: ViewGroup.HOTEL };
	it('returns null for an existing view without inserting', async () => {
		const model = {
			findOne: () => ({ exec: async () => input }),
			create: jest.fn(),
			updateOne: jest.fn().mockReturnValue({ exec: async () => ({}) }),
		};
		expect(await new ViewService(model as any).recordView(input)).toBeNull();
		expect(model.create).not.toHaveBeenCalled();
		expect(model.updateOne).toHaveBeenCalledWith(
			input,
			{ $set: { updatedAt: expect.any(Date) } },
			{ timestamps: false },
		);
	});
	it('returns only one successful insert for a duplicate-key race', async () => {
		const model = {
			findOne: () => ({ exec: async () => null }),
			create: jest.fn().mockResolvedValueOnce(input).mockRejectedValueOnce({ code: 11000 }),
			updateOne: jest.fn().mockReturnValue({ exec: async () => ({}) }),
		};
		const service = new ViewService(model as any);
		const results = await Promise.all([service.recordView(input), service.recordView(input)]);
		expect(results).toEqual([input, null]);
		expect(model.updateOne).toHaveBeenCalledTimes(1);
	});
	it('does not swallow database errors', async () => {
		const error = new Error('database unavailable');
		const model = { findOne: () => ({ exec: async () => null }), create: jest.fn().mockRejectedValue(error) };
		await expect(new ViewService(model as any).recordView(input)).rejects.toBe(error);
	});
});

describe('visited hotel collection', () => {
	it('scopes history to the member and HOTEL group, filters active hotels before counting/pagination and sorts latest visit first', async () => {
		const memberId = new Types.ObjectId();
		const model = { aggregate: jest.fn().mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] }) };
		await new ViewService(model as any).getVisitedHotels(memberId, { page: 2, limit: 6 });
		const pipeline = model.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({ memberId, viewGroup: 'HOTEL' });
		expect(pipeline[1].$sort).toEqual({ updatedAt: -1, _id: -1 });
		expect(pipeline[2].$lookup.pipeline).toEqual([{ $match: { hotelStatus: 'ACTIVE' } }]);
		expect(pipeline[3]).toEqual({ $unwind: '$hotel' });
		expect(pipeline[4].$facet.list.slice(0, 2)).toEqual([{ $skip: 6 }, { $limit: 6 }]);
		expect(pipeline[4].$facet.metaCounter).toEqual([{ $count: 'total' }]);
	});
	it('returns an empty collection when no visits exist and propagates read failures', async () => {
		const model = { aggregate: jest.fn().mockReturnValue({ exec: async () => [] }) };
		const service = new ViewService(model as any);
		expect(await service.getVisitedHotels(new Types.ObjectId(), { page: 1, limit: 6 })).toEqual({
			list: [],
			metaCounter: [],
		});
		const failure = new Error('database unavailable');
		model.aggregate.mockReturnValue({
			exec: async () => {
				throw failure;
			},
		});
		await expect(service.getVisitedHotels(new Types.ObjectId(), { page: 1, limit: 6 })).rejects.toBe(failure);
	});
	it('does not change member/article repeat view behavior', async () => {
		const model = { findOne: () => ({ exec: async () => ({}) }), updateOne: jest.fn(), create: jest.fn() };
		const service = new ViewService(model as any);
		await service.recordView({
			memberId: new Types.ObjectId(),
			viewRefId: new Types.ObjectId(),
			viewGroup: ViewGroup.ARTICLE,
		});
		expect(model.updateOne).not.toHaveBeenCalled();
		expect(model.create).not.toHaveBeenCalled();
	});
});
