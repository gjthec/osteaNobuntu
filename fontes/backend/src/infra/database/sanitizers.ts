/**
 * sanitizeEmail - normaliza e-mail (lowercase + trim)
 * sanitizeDocument - remove caracteres não numéricos (CPF/CNPJ)
 * sanitizePhone - remove caracteres não numéricos (telefone)
 * sanitizeUrl - adiciona protocolo https:// se necessário
 * clampNumber - ajusta número para ficar dentro de um range
 * sanitizeHtml - remove tags HTML (prevenção básica XSS)
 * sanitizeSlug - cria slug válido (URL-friendly)
 * normalizeWhitespace - remove espaços extras
 */

/**
 * Sanitiza (trunca) uma string para o tamanho máximo especificado.
 *
 * @param value - Valor a ser truncado
 * @param maxLength - Tamanho máximo permitido
 * @returns String truncada ou o valor original se não for string
 */
export function truncateString(
	value: string | undefined | null,
	maxLength: number
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/**
 * Sanitiza (limita) um array para a quantidade máxima de itens especificada.
 * Remove os itens excedentes do final do array.
 *
 * @param value - Array a ser limitado
 * @param maxItems - Quantidade máxima de itens permitida
 * @returns Array limitado ou o valor original se não for array
 */
export function truncateArray<T>(
	value: T[] | undefined | null,
	maxItems: number
): T[] | undefined | null {
	if (!Array.isArray(value)) {
		return value;
	}

	return value.length > maxItems ? value.slice(0, maxItems) : value;
}

/**
 * Sanitiza um e-mail: converte para minúsculas e remove espaços.
 *
 * @param value - E-mail a ser sanitizado
 * @returns E-mail sanitizado ou o valor original se não for string
 */
export function sanitizeEmail(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value.trim().toLowerCase();
}

/**
 * Sanitiza um CPF/CNPJ: remove todos os caracteres não numéricos.
 *
 * @param value - CPF/CNPJ a ser sanitizado
 * @returns Apenas os dígitos numéricos ou o valor original se não for string
 */
export function sanitizeDocument(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value.replace(/\D/g, '');
}

/**
 * Sanitiza um telefone: remove todos os caracteres não numéricos.
 *
 * @param value - Telefone a ser sanitizado
 * @returns Apenas os dígitos numéricos ou o valor original se não for string
 */
export function sanitizePhone(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value.replace(/\D/g, '');
}

/**
 * Sanitiza uma URL: adiciona protocolo https:// se não houver.
 *
 * @param value - URL a ser sanitizada
 * @returns URL com protocolo ou o valor original se não for string
 */
export function sanitizeUrl(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	const trimmed = value.trim();

	// Se já tem protocolo, retorna como está
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	// Adiciona https:// se não tiver protocolo
	return `https://${trimmed}`;
}

/**
 * Sanitiza um número: garante que está dentro de um range, ajustando se necessário.
 *
 * @param value - Número a ser sanitizado
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns Número dentro do range ou o valor original se não for número
 */
export function clampNumber(
	value: number | undefined | null,
	min: number,
	max: number
): number | undefined | null {
	if (typeof value !== 'number' || isNaN(value)) {
		return value;
	}

	return Math.max(min, Math.min(max, value));
}

/**
 * Sanitiza uma string removendo caracteres HTML/scripts (prevenção básica de XSS).
 *
 * @param value - String a ser sanitizada
 * @returns String sem tags HTML ou o valor original se não for string
 */
export function sanitizeHtml(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	// Remove tags HTML básicas
	return value
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<[^>]+>/g, '');
}

/**
 * Sanitiza um slug: converte para minúsculas, remove acentos e caracteres especiais.
 *
 * @param value - String a ser convertida em slug
 * @returns Slug sanitizado ou o valor original se não for string
 */
export function sanitizeSlug(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove acentos
		.replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
		.replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
}

/**
 * Remove espaços em branco extras (múltiplos espaços, tabs, quebras de linha).
 *
 * @param value - String a ser sanitizada
 * @returns String com espaços normalizados ou o valor original se não for string
 */
export function normalizeWhitespace(
	value: string | undefined | null
): string | undefined | null {
	if (typeof value !== 'string') {
		return value;
	}

	return value.replace(/\s+/g, ' ').trim();
}
