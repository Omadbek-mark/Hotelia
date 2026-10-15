import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Readable } from 'stream';
import { mkdir, readdir, readFile, unlink } from 'fs/promises';
import type { FileUpload } from 'graphql-upload-ts';
import { saveImage, saveImages } from '../../src/libs/upload';
import { MemberResolver } from '../../src/components/member/member.resolver';

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const file = (content = png, mimetype = 'image/png'): FileUpload =>
	({
		filename: 'test.png',
		mimetype,
		encoding: '7bit',
		createReadStream: () => Readable.from([content]),
	}) as FileUpload;

describe('Image uploads', () => {
	let before: string[];
	beforeEach(async () => {
		await mkdir('uploads/room', { recursive: true });
		before = await readdir('uploads/room');
	});
	afterEach(async () => {
		const created = (await readdir('uploads/room')).filter((name) => !before.includes(name));
		await Promise.all(created.map((name) => unlink(`uploads/room/${name}`)));
	});
	it('passes upload argument through the global validation pipe without constructing a Promise', async () => {
		const metatype = Reflect.getMetadata('design:paramtypes', MemberResolver.prototype, 'imageUploader')[0];
		expect(metatype).toBe(Object);
		const upload = file();
		const validated = await new ValidationPipe().transform(Promise.resolve(upload), { type: 'body', metatype });
		const resolver = new MemberResolver({} as any);
		const url = await resolver.imageUploader(validated, 'room');
		expect(await readFile(url)).toEqual(png);
	});
	it('awaits the GraphQL upload promise and supports room images', async () => {
		const resolver = new MemberResolver({} as any);
		const url = await resolver.imageUploader(Promise.resolve(file()), 'room');
		expect(url).toMatch(/^uploads\/room\/.+\.png$/);
		expect(await readFile(url)).toEqual(png);
	});
	it('accepts WebP signatures split across stream chunks', async () => {
		const content = Buffer.from('RIFF0000WEBPVP8 data');
		const upload = file(content, 'image/webp');
		upload.createReadStream = (() => Readable.from([content.subarray(0, 5), content.subarray(5, 10), content.subarray(10)])) as any;
		const url = await saveImage(upload, 'room');
		expect(url).toMatch(/\.webp$/);
		expect(await readFile(url)).toEqual(content);
	});
	it('accepts streamed images larger than the old 15 MB limit', async () => {
		const content = Buffer.concat([png, Buffer.alloc(16_000_000)]);
		const url = await saveImage(file(content), 'room');
		const saved = await readFile(url);
		expect(saved.length).toBe(content.length);
		expect(saved.subarray(0, png.length)).toEqual(png);
	});
	it('rejects mismatched WebP content and removes partial files', async () => {
		await expect(saveImage(file(Buffer.from('RIFF0000FAKEdata'), 'image/webp'), 'room')).rejects.toMatchObject({ status: 400 });
		expect(await readdir('uploads/room')).toEqual(before);
	});
	it('rejects fake image content and removes partial files', async () => {
		await expect(saveImage(file(Buffer.from('<html>invalid</html>')), 'room')).rejects.toMatchObject({ status: 400 });
		expect(await readdir('uploads/room')).toEqual(before);
	});
	it('removes earlier files when a later image fails', async () => {
		await expect(
			saveImages([Promise.resolve(file()), Promise.resolve(file(Buffer.alloc(0)))], 'room'),
		).rejects.toBeDefined();
		expect(await readdir('uploads/room')).toEqual(before);
	});
	it('rejects unsupported targets and too many images', async () => {
		await expect(saveImage(file(), '../other')).rejects.toMatchObject({ status: 400 });
		await expect(
			saveImages(
				Array.from({ length: 11 }, () => Promise.resolve(file())),
				'room',
			),
		).rejects.toMatchObject({ status: 400 });
	});
});
