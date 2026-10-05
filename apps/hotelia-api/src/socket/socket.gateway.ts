import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';

interface MessagePayload {
	event: string;
	text: string;
}

interface InfoPayload {
	event: string;
	totalClients: number;
}

@WebSocketGateway({ maxPayload: 16 * 1024 })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;
	private readonly lastMessageAt = new WeakMap<WebSocket, number>();

	@WebSocketServer()
	server: Server | undefined;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.verbose(`Connection & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};

		this.emitMessage(infoMsg);
	}

	handleDisconnect(client: WebSocket) {
		this.lastMessageAt.delete(client);
		this.summaryClient--;
		this.logger.verbose(`Disconnection && total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
		};

		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: unknown): Promise<void> {
		if (client.readyState !== WebSocket.OPEN) return;
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
		this.emitMessage({ event: 'message', text: payload.trim() });
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
