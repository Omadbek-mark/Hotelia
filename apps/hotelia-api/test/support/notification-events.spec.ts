import { Types } from 'mongoose';
import { NotificationService } from '../../src/components/notification/notification.service';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../src/libs/enums/notification.enum';
import { MemberStatus, MemberType } from '../../src/libs/enums/member.enum';

describe('Notification recipients and event filters', () => {
	const admin = new Types.ObjectId(),
		owner = new Types.ObjectId(),
		guest = new Types.ObjectId();
	const hotel = { _id: new Types.ObjectId(), ownerId: owner, hotelName: 'Demo hotel' };
	const booking = { _id: new Types.ObjectId(), hotelId: hotel._id, memberId: guest, roomId: new Types.ObjectId() };
	const session = {} as any;
	const storage = { create: jest.fn(), bulkWrite: jest.fn(), aggregate: jest.fn() };
	const members = { find: jest.fn() };
	const hotels = { findById: jest.fn() };
	const service = new NotificationService(storage as any, hotels as any, members as any);
	beforeEach(() => {
		jest.resetAllMocks();
		members.find.mockReturnValue({
			select: () => ({ session: () => ({ lean: () => ({ exec: async () => [{ _id: admin }, { _id: owner }] }) }) }),
		});
		hotels.findById.mockReturnValue({ session: () => ({ lean: () => ({ exec: async () => hotel }) }) });
	});
	test('new bookings reach admins and owner once, excluding the actor', async () => {
		await service.notify(NotificationType.BOOKING_CREATED, guest, booking, session);
		const records = storage.create.mock.calls[0][0];
		expect(records.map((row: any) => String(row.receiverId)).sort()).toEqual([String(admin), String(owner)].sort());
		expect(records[0]).toMatchObject({ bookingId: booking._id, roomId: booking.roomId, notificationStatus: 'WAIT' });
		expect(members.find).toHaveBeenCalledWith({ memberType: MemberType.ADMIN, memberStatus: MemberStatus.ACTIVE });
		expect(storage.create.mock.calls[0][1]).toEqual({ session, ordered: true });
	});
	test.each([
		NotificationType.BOOKING_CONFIRMED,
		NotificationType.BOOKING_CANCELLED,
		NotificationType.BOOKING_COMPLETED,
	])('%s reaches admin and guest when owner acts', async (type) => {
		await service.notify(type, owner, booking, session);
		expect(storage.create.mock.calls[0][0].map((row: any) => String(row.receiverId)).sort()).toEqual(
			[String(admin), String(guest)].sort(),
		);
	});
	test('inventory notifications reference the new hotel or room', async () => {
		await service.notifyInventoryCreated(owner, hotel, session);
		expect(storage.create.mock.calls[0][0]).toHaveLength(1);
		expect(storage.create.mock.calls[0][0][0]).toMatchObject({
			receiverId: admin,
			hotelId: hotel._id,
			notificationType: 'HOTEL_CREATED',
		});
		const room = { _id: new Types.ObjectId(), roomName: 'Comfort room' };
		await service.notifyInventoryCreated(owner, hotel, session, room);
		expect(storage.create.mock.calls[1][0][0]).toMatchObject({
			roomId: room._id,
			notificationType: 'ROOM_CREATED',
			notificationGroup: 'ROOM',
		});
	});
	test('support retries use the same recipient/inquiry key and never reset read status', async () => {
		const inquiry = { _id: new Types.ObjectId(), noticeTitle: 'Arrival question' };
		await service.notifySupportMessage(guest, inquiry, session);
		await service.notifySupportMessage(guest, inquiry, session);
		const operation = storage.bulkWrite.mock.calls[0][0][0].updateOne;
		expect(operation.filter).toEqual({
			receiverId: admin,
			inquiryId: inquiry._id,
			notificationType: 'SUPPORT_MESSAGE',
		});
		expect(operation.update).toEqual({
			$setOnInsert: expect.objectContaining({ notificationStatus: 'WAIT', notificationDesc: 'Arrival question' }),
		});
		expect(operation.upsert).toBe(true);
		expect(storage.bulkWrite.mock.calls[1][0]).toEqual(storage.bulkWrite.mock.calls[0][0]);
	});
	test('no administrators is valid, while notification write failures propagate', async () => {
		members.find.mockReturnValue({ select: () => ({ session: () => ({ lean: () => ({ exec: async () => [] }) }) }) });
		await service.notifyInventoryCreated(owner, hotel, session);
		expect(storage.create).not.toHaveBeenCalled();
		storage.create.mockRejectedValue(new Error('write unavailable'));
		await expect(service.notify(NotificationType.BOOKING_CREATED, guest, booking, session)).rejects.toThrow(
			'write unavailable',
		);
	});
	test('type/group/read filters retain receiver scope and filtered pagination', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		await service.getMyNotifications(admin, {
			page: 2,
			limit: 5,
			notificationType: NotificationType.SUPPORT_MESSAGE,
			notificationGroup: NotificationGroup.SUPPORT,
			notificationStatus: NotificationStatus.WAIT,
		});
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({
			receiverId: admin,
			notificationType: 'SUPPORT_MESSAGE',
			notificationGroup: 'SUPPORT',
			notificationStatus: 'WAIT',
		});
		expect(pipeline[2].$facet.list[0]).toEqual({ $skip: 5 });
	});
	test('hotel and room additions share one paginated list scoped to the recipient', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ list: [], metaCounter: [] }] });
		await service.getMyNotifications(admin, {
			page: 2,
			limit: 10,
			notificationTypes: [NotificationType.HOTEL_CREATED, NotificationType.ROOM_CREATED],
		});
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({
			receiverId: admin,
			notificationType: { $in: ['HOTEL_CREATED', 'ROOM_CREATED'] },
		});
		expect(pipeline[2].$facet.list[0]).toEqual({ $skip: 10 });
	});
	test('tab counts include only this recipient unread messages across all pages', async () => {
		storage.aggregate.mockReturnValue({ exec: async () => [{ notificationType: 'BOOKING_CREATED', total: 12 }] });
		expect(await service.getUnreadNotificationCounts(owner)).toEqual([
			{ notificationType: 'BOOKING_CREATED', total: 12 },
		]);
		const pipeline = storage.aggregate.mock.calls[0][0];
		expect(pipeline[0].$match).toEqual({ receiverId: owner, notificationStatus: 'WAIT' });
		expect(pipeline.some((stage: any) => stage.$skip || stage.$limit)).toBe(false);
	});
});
