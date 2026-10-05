import { Readable } from 'stream';
import { mkdir, readdir, readFile, unlink } from 'fs/promises';
import type { FileUpload } from 'graphql-upload';
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
	it('awaits the GraphQL upload promise and supports room images', async () => {
		const resolver = new MemberResolver({} as any);
		const url = await resolver.imageUploader(Promise.resolve(file()), 'room');
		expect(url).toMatch(/^uploads\/room\/.+\.png$/);
		expect(await readFile(url)).toEqual(png);
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
