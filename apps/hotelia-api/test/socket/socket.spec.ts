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
	});
	afterEach(() => jest.restoreAllMocks());
	it('broadcasts valid trimmed messages without requiring login', async () => {
		await gateway.handleMessage(sender, ' Hello ');
		expect(sender.send).toHaveBeenCalledWith(JSON.stringify({ event: 'message', text: 'Hello' }));
		expect(other.send).toHaveBeenCalledWith(JSON.stringify({ event: 'message', text: 'Hello' }));
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
});
