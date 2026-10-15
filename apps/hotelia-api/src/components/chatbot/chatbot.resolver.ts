import { ValidationPipe } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ChatbotInput, ChatbotReply } from './chatbot.dto';
import { ChatbotService } from './chatbot.service';
@Resolver()
export class ChatbotResolver {
	constructor(private readonly chatbot: ChatbotService) {}
	@Mutation(() => ChatbotReply)
	askHoteliaAssistant(
		@Args('input', new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
		input: ChatbotInput,
		@Context() context: { req?: { ip?: string; socket?: { remoteAddress?: string } } },
	): Promise<ChatbotReply> {
		return this.chatbot.ask(input, context.req?.ip || context.req?.socket?.remoteAddress || 'unknown');
	}
}
