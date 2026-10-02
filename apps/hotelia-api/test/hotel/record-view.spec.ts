import { ViewService } from '../../src/components/view/view.service';
import { Types } from 'mongoose';
import { ViewGroup } from '../../src/libs/enums/view.enum';

describe('recordView duplicate handling', () => {
  const input = { memberId: new Types.ObjectId(), viewRefId: new Types.ObjectId(), viewGroup: ViewGroup.HOTEL };
  it('returns null for an existing view without inserting', async () => {
    const model = { findOne: () => ({ exec: async () => input }), create: jest.fn() };
    expect(await new ViewService(model as any).recordView(input)).toBeNull();
    expect(model.create).not.toHaveBeenCalled();
  });
  it('returns only one successful insert for a duplicate-key race', async () => {
    const model = {
      findOne: () => ({ exec: async () => null }),
      create: jest.fn().mockResolvedValueOnce(input).mockRejectedValueOnce({ code: 11000 }),
    };
    const service = new ViewService(model as any);
    const results = await Promise.all([service.recordView(input), service.recordView(input)]);
    expect(results).toEqual([input, null]);
  });
  it('does not swallow database errors', async () => {
    const error = new Error('database unavailable');
    const model = { findOne: () => ({ exec: async () => null }), create: jest.fn().mockRejectedValue(error) };
    await expect(new ViewService(model as any).recordView(input)).rejects.toBe(error);
  });
});
