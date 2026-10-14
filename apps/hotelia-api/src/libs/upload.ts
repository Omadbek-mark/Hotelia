import { BadRequestException } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import type { FileUpload } from 'graphql-upload';
import { v4 as uuidv4 } from 'uuid';

const imageExtensions: Record<string, string> = {
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/jpg': '.jpg',
	'image/webp': '.webp',
};
export async function saveImage(file: FileUpload, target: string): Promise<string> {
	if (!['member', 'hotel', 'room', 'article'].includes(target)) throw new BadRequestException('Invalid image target');
	const extension = imageExtensions[file.mimetype];
	if (!extension) throw new BadRequestException('Please provide JPG, JPEG, PNG or WebP images!');
	const directory = `uploads/${target}`;
	await mkdir(directory, { recursive: true });
	const url = `${directory}/${uuidv4()}${extension}`;
	let header = Buffer.alloc(0);
	let validated = false;
	const validation = new Transform({
		transform(chunk: Buffer, _encoding, callback) {
			if (validated) return callback(null, chunk);
			header = Buffer.concat([header, chunk]);
			if (header.length < (extension === '.webp' ? 12 : 8)) return callback();
			const valid =
				extension === '.png'
					? header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
					: extension === '.webp'
						? header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP'
						: header[0] === 255 && header[1] === 216 && header[2] === 255;
			if (!valid) return callback(new BadRequestException('Image content does not match its type'));
			validated = true;
			callback(null, header);
			header = Buffer.alloc(0);
		},
		flush(callback) {
			callback(validated ? undefined : new BadRequestException('Empty or invalid image'));
		},
	});
	let created = false;
	const destination = createWriteStream(url, { flags: 'wx' });
	destination.once('open', () => {
		created = true;
	});
	try {
		await pipeline(file.createReadStream(), validation, destination);
		return url;
	} catch (error) {
		destination.destroy();
		if (!destination.closed) await new Promise<void>((resolve) => destination.once('close', resolve));
		if (created) await unlink(url);
		throw error;
	}
}

export async function saveImages(files: Promise<FileUpload>[], target: string): Promise<string[]> {
	if (!files.length || files.length > 10) throw new BadRequestException('Provide between 1 and 10 images');
	const uploaded: string[] = [];
	try {
		// Resolve all promises so a later rejected upload cannot become an unhandled rejection.
		const resolved = await Promise.all(files);
		for (const file of resolved) uploaded.push(await saveImage(file, target));
		return uploaded;
	} catch (error) {
		await Promise.all(uploaded.map((url) => unlink(url)));
		throw error;
	}
}
