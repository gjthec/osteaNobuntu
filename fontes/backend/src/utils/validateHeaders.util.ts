export default function validateHeaders(
	requiredHeaders: string[],
	headers: string[]
) {
	const missingHeaders: string[] = [];

	for (const item of headers) {
		if (!requiredHeaders.includes(item)) {
			missingHeaders.push(item);
		}
	}

	if (missingHeaders.length > 0) {
		return {
			error: 'Headers faltantes',
			missingHeaders
		};
	} else {
		return null;
	}
}