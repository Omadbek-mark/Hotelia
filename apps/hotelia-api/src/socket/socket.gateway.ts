import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { randomUUID } from 'crypto';
import * as WebSocket from 'ws';

interface MessagePayload {
	event: string;
	text: string;
	id: string;
	clientId: string;
	createdAt: string;
}

interface InfoPayload {
	event: string;
	totalClients: number;
}

@WebSocketGateway({ maxPayload: 16 * 1024 })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private readonly clients = new Map<WebSocket, string>();
	private readonly messageList: MessagePayload[] = [];
	private readonly lastMessageAt = new WeakMap<WebSocket, number>();

	@WebSocketServer()
	server: Server | undefined;

	public afterInit(server: Server) {
		this.server = server;
		this.logger.verbose(`WebSocket Server Initialized`);
	}

	handleConnection(client: WebSocket) {
		if (client.readyState !== WebSocket.OPEN || this.clients.has(client)) return;
		const clientId = randomUUID();
		this.clients.set(client, clientId);
		// Public chat identity is connection-scoped; no JWT or member details are exposed.
		client.send(JSON.stringify({ event: 'getMessages', clientId, list: this.messageList }));
		this.emitMessage({ event: 'info', totalClients: this.clients.size });
	}

	handleDisconnect(client: WebSocket) {
		this.lastMessageAt.delete(client);
		if (!this.clients.delete(client)) return;
		this.broadcastMessage(client, { event: 'info', totalClients: this.clients.size });
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: unknown): Promise<void> {
		if (client.readyState !== WebSocket.OPEN || !this.clients.has(client)) return;
		if (typeof payload !== 'string' || payload.length > 1000 || !payload.trim()) {
			this.sendError(client, 'INVALID_MESSAGE', 'Send a non-empty message of at most 1000 characters');
			return;
		}
		const now = Date.now();
		const previous = this.lastMessageAt.get(client);
		if (previous !== undefined && now - previous < 2000) {
			this.sendError(client, 'RATE_LIMITED', 'Please wait before sending another message', 2000 - (now - previous));
			return;
		}
		this.lastMessageAt.set(client, now);
		const message: MessagePayload = {
			event: 'message',
			id: randomUUID(),
			clientId: this.clients.get(client)!,
			text: payload.trim(),
			createdAt: new Date(now).toISOString(),
		};
		this.messageList.push(message);
		if (this.messageList.length > 5) this.messageList.shift();
		this.emitMessage(message);
	}

	private sendError(client: WebSocket, code: string, message: string, retryAfterMs?: number): void {
		client.send(
			JSON.stringify({ event: 'error', code, message, ...(retryAfterMs !== undefined ? { retryAfterMs } : {}) }),
		);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server?.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server?.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
