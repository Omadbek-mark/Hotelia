import { SocketGateway } from '../../src/socket/socket.gateway';
import { Server } from 'ws';
import * as WebSocket from 'ws';

describe('Public chat safeguards', () => {
	let gateway: SocketGateway;
	let sender: WebSocket, other: WebSocket;
	let now: number;
	beforeEach(() => {
		now = 10000;
		jest.spyOn(Date, 'now').mockImplementation(() => now);
		gateway = new SocketGateway();
		sender = { readyState: WebSocket.OPEN, send: jest.fn() } as unknown as WebSocket;
		other = { readyState: WebSocket.OPEN, send: jest.fn() } as unknown as WebSocket;
		gateway.server = { clients: new Set([sender, other]) } as unknown as Server;
		gateway.handleConnection(sender);
		gateway.handleConnection(other);
		jest.clearAllMocks();
	});
	afterEach(() => jest.restoreAllMocks());
	it('broadcasts valid trimmed messages without requiring login', async () => {
		await gateway.handleMessage(sender, ' Hello ');
		const message = JSON.parse((sender.send as jest.Mock).mock.calls[0][0]);
		expect(message).toMatchObject({ event: 'message', text: 'Hello', createdAt: new Date(now).toISOString() });
		expect(message.id).toEqual(expect.any(String));
		expect(message.clientId).toEqual(expect.any(String));
		expect(other.send).toHaveBeenCalledWith(JSON.stringify(message));
	});
	it('rejects invalid messages only to the sender', async () => {
		for (const payload of [null, {}, 1, '', '   ', 'a'.repeat(1001)]) await gateway.handleMessage(sender, payload);
		expect(other.send).not.toHaveBeenCalled();
		expect(sender.send).toHaveBeenCalledTimes(6);
		expect(JSON.parse((sender.send as jest.Mock).mock.calls[0][0]).code).toBe('INVALID_MESSAGE');
		await gateway.handleMessage(sender, 'a'.repeat(1000));
		expect(other.send).toHaveBeenCalledTimes(1);
	});
	it('limits each connection independently and allows a message after two seconds', async () => {
		await gateway.handleMessage(sender, 'First');
		now += 1999;
		await gateway.handleMessage(sender, 'Too soon');
		expect(JSON.parse((sender.send as jest.Mock).mock.calls[1][0])).toMatchObject({
			event: 'error',
			code: 'RATE_LIMITED',
			retryAfterMs: 1,
		});
		expect(other.send).toHaveBeenCalledTimes(1);
		await gateway.handleMessage(other, 'Independent');
		now += 1;
		await gateway.handleMessage(sender, 'Allowed');
		expect(other.send).toHaveBeenCalledTimes(3);
	});
	it('sends the last five accepted messages and a separate guest identity on connection', async () => {
		for (let i = 0; i < 7; i++) {
			now += 2000;
			await gateway.handleMessage(sender, `Message ${i}`);
		}
		const newcomer = { readyState: WebSocket.OPEN, send: jest.fn() } as unknown as WebSocket;
		gateway.server!.clients.add(newcomer);
		gateway.handleConnection(newcomer);
		const history = JSON.parse((newcomer.send as jest.Mock).mock.calls[0][0]);
		expect(history.event).toBe('getMessages');
		expect(history.list.map((m: { text: string }) => m.text)).toEqual([
			'Message 2',
			'Message 3',
			'Message 4',
			'Message 5',
			'Message 6',
		]);
		expect(history.clientId).not.toBe(history.list[0].clientId);
		expect(JSON.parse((newcomer.send as jest.Mock).mock.calls[1][0])).toEqual({ event: 'info', totalClients: 3 });
	});
	it('updates online counts once and ignores duplicate disconnects', () => {
		gateway.handleDisconnect(sender);
		expect(other.send).toHaveBeenCalledWith(JSON.stringify({ event: 'info', totalClients: 1 }));
		gateway.handleDisconnect(sender);
		expect(other.send).toHaveBeenCalledTimes(1);
	});
});
