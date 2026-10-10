import { Types } from 'mongoose';
import { NotificationService } from '../../src/components/notification/notification.service';

describe('Support notification privacy', () => {
	const receiverId = new Types.ObjectId(),
		id = new Types.ObjectId();
	const storage = { aggregate: jest.fn(), countDocuments: jest.fn(), findOneAndUpdate: jest.fn() };
	const service = new NotificationService(storage as any, {} as any);
	beforeEach(() => jest.resetAllMocks());
	test('list and unread count always use the authenticated receiver', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		storage.countDocuments.mockReturnValue({ exec: async () => 0 });
		await service.getMyNotifications(receiverId, { page: 1, limit: 10 });
		await service.getUnreadNotificationCount(receiverId);
		expect(storage.aggregate.mock.calls[0][0][0].$match).toEqual({ receiverId });
		expect(storage.countDocuments).toHaveBeenCalledWith({ receiverId, notificationStatus: 'WAIT' });
	});
	test('marking read cannot affect another receiver notification', async () => {
		storage.findOneAndUpdate.mockReturnValue({ lean: () => ({ exec: async () => null }) });
		await expect(service.markNotificationRead(receiverId, id)).rejects.toThrow();
		expect(storage.findOneAndUpdate.mock.calls[0][0]).toEqual({ _id: id, receiverId });
	});
});
