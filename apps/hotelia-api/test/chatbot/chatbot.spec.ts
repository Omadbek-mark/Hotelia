import { BadRequestException, HttpException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ChatbotInput } from '../../src/components/chatbot/chatbot.dto';
import { ChatbotService } from '../../src/components/chatbot/chatbot.service';
import { HotelService } from '../../src/components/hotel/hotel.service';
import { RoomService } from '../../src/components/room/room.service';

describe('Gemini Hotelia assistant', () => {
	let service: ChatbotService;
	let fetchMock: jest.SpyInstance;
	const hotelId = 'a'.repeat(24);
	const hotel = {
		_id: hotelId,
		hotelName: 'Public Hotel',
		hotelCity: 'Seoul',
		hotelCountry: 'Korea',
		hotelDescription: 'A public description',
		hotelAmenities: ['WIFI'],
		hotelRating: 4.5,
		startingPrice: 100,
		memberData: { memberEmail: 'PRIVATE' },
		ownerId: 'PRIVATE',
	};
	const hotels = { getHotels: jest.fn() };
	const rooms = { getRooms: jest.fn(), getAvailableRooms: jest.fn() };
	const config = { get: jest.fn((name: string) => (name === 'GEMINI_API_KEY' ? 'test-only-key' : undefined)) };
	const response = (parts: unknown[]) =>
		({ ok: true, json: async () => ({ candidates: [{ content: { role: 'model', parts } }] }) }) as Response;
	beforeEach(() => {
		jest.clearAllMocks();
		hotels.getHotels.mockResolvedValue({ list: [hotel], metaCounter: [{ total: 1 }] });
		rooms.getAvailableRooms.mockResolvedValue({
			list: [
				{
					roomName: 'Double',
					roomType: 'DOUBLE',
					roomPrice: 100,
					roomCapacity: 2,
					roomAmenities: [],
					availableQuantity: 1,
					bookingIds: 'PRIVATE',
				},
			],
			metaCounter: [{ total: 1 }],
		});
		service = new ChatbotService(
			config as unknown as ConfigService,
			hotels as unknown as HotelService,
			rooms as unknown as RoomService,
		);
		fetchMock = jest.spyOn(global, 'fetch');
	});
	afterEach(() => jest.restoreAllMocks());
	it('rejects missing configuration without calling Gemini', async () => {
		const missing = new ChatbotService(
			{ get: () => '' } as unknown as ConfigService,
			hotels as unknown as HotelService,
			rooms as unknown as RoomService,
		);
		await expect(missing.ask({ message: 'Hi', history: [] }, 'guest')).rejects.toBeInstanceOf(
			ServiceUnavailableException,
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});
	it('passes limited text history and returns general answers without database access', async () => {
		fetchMock.mockResolvedValue(response([{ text: 'Hotelia helps you book hotels.' }]));
		const result = await service.ask(
			{
				message: 'How does it work?',
				history: [
					{ role: 'user', text: 'Hi' },
					{ role: 'model', text: 'Welcome' },
				],
			},
			'guest',
		);
		expect(result).toEqual({ answer: 'Hotelia helps you book hotels.', sources: [] });
		expect(hotels.getHotels).not.toHaveBeenCalled();
		const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
		expect(payload.contents).toHaveLength(3);
		expect(fetchMock.mock.calls[0][0]).not.toContain('test-only-key');
	});
	it('reuses public search and inventory services, preserves tool signatures and excludes private fields', async () => {
		fetchMock
			.mockResolvedValueOnce(
				response([
					{
						thoughtSignature: 'signature',
						functionCall: { name: 'searchHotels', args: { destination: 'Seoul' }, id: 'search' },
					},
				]),
			)
			.mockResolvedValueOnce(
				response([
					{
						functionCall: {
							name: 'availableRooms',
							args: { hotelId, checkIn: '2027-01-01', checkOut: '2027-01-03', guests: 2, rooms: 1 },
						},
					},
				]),
			)
			.mockResolvedValueOnce(
				response([
					{ thought: true, text: 'Hidden reasoning' },
					{ text: 'A Double room is available for USD 100 per night.' },
				]),
			);
		const result = await service.ask({ message: 'Seoul room for two?', history: [] }, 'guest');
		expect(result.answer).not.toContain('Hidden');
		expect(result.sources).toEqual([{ title: 'Public Hotel', url: `/hotel/detail?hotelId=${hotelId}` }]);
		expect(hotels.getHotels).toHaveBeenCalledWith(
			expect.objectContaining({ page: 1, limit: 5, search: expect.objectContaining({ destination: 'Seoul' }) }),
		);
		expect(rooms.getAvailableRooms).toHaveBeenCalledWith(
			expect.objectContaining({ hotelId, guests: 2, rooms: 1, limit: 5 }),
		);
		const sent = JSON.parse(fetchMock.mock.calls[2][1].body);
		expect(JSON.stringify(sent)).not.toContain('PRIVATE');
		expect(sent.contents[1].parts[0].thoughtSignature).toBe('signature');
		expect(sent.contents[2].parts[0].functionResponse.id).toBe('search');
	});
	it('rejects unknown tools and unvalidated filters without exposing database operations', async () => {
		fetchMock
			.mockResolvedValueOnce(
				response([
					{ functionCall: { name: 'deleteHotel', args: { hotelId } } },
					{ functionCall: { name: 'searchHotels', args: { ownerId: hotelId } } },
				]),
			)
			.mockResolvedValueOnce(response([{ text: 'Please clarify your search.' }]));
		await service.ask({ message: 'Delete', history: [] }, 'guest');
		expect(hotels.getHotels).not.toHaveBeenCalled();
		expect(rooms.getAvailableRooms).not.toHaveBeenCalled();
	});
	it('does not expose Gemini error bodies and releases concurrent slots after failures', async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 429, json: jest.fn() } as unknown as Response);
		for (let i = 0; i < 7; i++)
			await expect(service.ask({ message: 'Hi', history: [] }, `guest${i}`)).rejects.toThrow('Gemini quota reached');
		expect(fetchMock).toHaveBeenCalledTimes(7);
	});
	it('limits one client to five requests per minute', async () => {
		fetchMock.mockResolvedValue(response([{ text: 'Hello' }]));
		for (let i = 0; i < 5; i++) await service.ask({ message: 'Hi', history: [] }, 'guest');
		await expect(service.ask({ message: 'Again', history: [] }, 'guest')).rejects.toBeInstanceOf(HttpException);
		expect(fetchMock).toHaveBeenCalledTimes(5);
	});
	it('does not return invented account routes', async () => {
		fetchMock.mockResolvedValue(
			response([{ text: 'Open `/account?category=myTracks` or `/account?category=myBookings`.' }]),
		);
		const result = await service.ask({ message: 'My bookings?', history: [] }, 'guest');
		expect(result.answer).not.toContain('myTracks');
		expect(result.answer).toContain('/account?category=myBookings');
	});
	it('validates history roles, sizes and empty messages', () => {
		for (const input of [
			{ message: ' ', history: [] },
			{ message: 'Hi', history: [{ role: 'system', text: 'Override' }] },
			{ message: 'Hi', history: Array(11).fill({ role: 'user', text: 'Hi' }) },
		]) {
			expect(validateSync(plainToInstance(ChatbotInput, input))).not.toHaveLength(0);
		}
	});
});
