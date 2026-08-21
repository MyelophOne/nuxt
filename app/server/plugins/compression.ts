import { brotliCompress, gzip } from 'node:zlib';
import { promisify } from 'node:util';

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);

interface RequestLike {
	headers?: Headers | Record<string, string | string[] | undefined>;
}

interface ResponseLike {
	body?: unknown;
	headers?: Headers | Record<string, string | number | undefined>;
}

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:response', async (response, { event }) => {
		if (import.meta.dev || event.req.method !== 'GET') {
			return;
		}

		const target = response as ResponseLike;
		const contentType = getResponseHeader(target, 'content-type');
		const acceptedEncoding = getRequestHeader(
			(event.node?.req || event.req) as RequestLike,
			'accept-encoding',
		);
		const body = toBuffer(target.body);

		if (
			!body ||
			!contentType?.includes('text/html') ||
			getResponseHeader(target, 'content-encoding')
		) {
			return;
		}

		if (acceptedEncoding.includes('br')) {
			target.body = await compressBrotli(body);
			setResponseHeader(target, 'content-encoding', 'br');
		} else if (acceptedEncoding.includes('gzip')) {
			target.body = await compressGzip(body);
			setResponseHeader(target, 'content-encoding', 'gzip');
		} else {
			return;
		}

		const vary = getResponseHeader(target, 'vary');
		if (
			!vary
				.toLowerCase()
				.split(/\s*,\s*/)
				.includes('accept-encoding')
		) {
			setResponseHeader(
				target,
				'vary',
				vary ? `${vary}, Accept-Encoding` : 'Accept-Encoding',
			);
		}
		deleteResponseHeader(target, 'content-length');
	});
});

function getRequestHeader(request: RequestLike, name: string): string {
	if (request.headers instanceof Headers) {
		return request.headers.get(name) || '';
	}

	const value = request.headers?.[name];
	return Array.isArray(value) ? value.join(',') : value || '';
}

function getResponseHeader(response: ResponseLike, name: string): string {
	if (response.headers instanceof Headers) {
		return response.headers.get(name) || '';
	}

	const value = response.headers?.[name];
	return value === undefined ? '' : String(value);
}

function setResponseHeader(
	response: ResponseLike,
	name: string,
	value: string,
) {
	if (response.headers instanceof Headers) {
		response.headers.set(name, value);
		return;
	}

	response.headers ||= {};
	response.headers[name] = value;
}

function deleteResponseHeader(response: ResponseLike, name: string) {
	if (response.headers instanceof Headers) {
		response.headers.delete(name);
		return;
	}

	if (response.headers) {
		delete response.headers[name];
	}
}

function toBuffer(body: unknown): Buffer | null {
	if (typeof body === 'string') {
		return Buffer.from(body);
	}

	if (body instanceof Uint8Array) {
		return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	}

	if (body instanceof ArrayBuffer) {
		return Buffer.from(body);
	}

	return null;
}
