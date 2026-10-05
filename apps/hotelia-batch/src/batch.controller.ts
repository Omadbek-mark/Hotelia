import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_TOP_OWNERS, BATCH_TOP_HOTELS } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('20 00 01 * * *', { name: BATCH_TOP_HOTELS, timeZone: 'Asia/Seoul' })
	async batchHotels() {
		try {
			this.logger['context'] = BATCH_TOP_HOTELS;
			this.logger.debug('Executed');
			await this.batchService.batchTopHotels();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 00 01 * * *', { name: BATCH_TOP_OWNERS, timeZone: 'Asia/Seoul' })
	async batchOwners() {
		try {
			this.logger['context'] = BATCH_TOP_OWNERS;
			this.logger.debug('Executed');
			await this.batchService.batchTopOwners();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
