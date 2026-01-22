/**
 * Faz entradas como: "put:/api/filter-search-parameters/2/component/3" -> "put:/api/filter-search-parameters/:id/component/:id"
 * @param input Method em caixa baixa (exemplo: "put") e path (exemplo: "/api/filter-search-parameters/2") concatenados, como: "put:/api/filter-search-parameters/2/component/3"
 * @param opts
 * @returns
 */
export function normalizeRouteKey(
	input: string,
	opts?: { replaceUUID?: boolean }
) {
	const replaceUUID = !!opts?.replaceUUID;
	const [rawMethod, ...rest] = input.split(':');
	const method = rawMethod.toLowerCase();
	const path = rest.join(':'); // caso o path contenha ':'
	const [pathOnly, query = ''] = path.split('?');

	const intRe = /^-?\d+$/;
	const uuidRe =
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

	const parts = pathOnly.split('/').map((seg) => {
		if (!seg) return seg;
		if (intRe.test(seg)) return ':id';
		if (replaceUUID && uuidRe.test(seg)) return ':uuid';
		return seg;
	});

	const normalizedPath = parts.join('/');
	return query
		? `${method}:${normalizedPath}?${query}`
		: `${method}:${normalizedPath}`;
}
