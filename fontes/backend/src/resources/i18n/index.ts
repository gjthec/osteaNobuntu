import type { Request } from 'express';
import { catalogs, type Locale, type MessageCode } from './catalog';

const DEFAULT_LOCALE: Locale = 'en';

function normalizeLocale(input?: string): Locale {
	if (!input) return DEFAULT_LOCALE;
	const rawInput = input.trim();

	// exemplos: pt-BR;q=0.9,en-US;q=0.8 → pegamos a primeira parte antes da vírgula
	const primary = rawInput.split(',')[0]?.trim();
	if (!primary) return DEFAULT_LOCALE;

	// candidatos: ex "pt-BR" → ["pt-BR", "pt", "en"]
	const parts = primary.split(';')[0]?.trim(); // remove ;q=...
	const candidates: string[] = [];

	if (parts) {
		candidates.push(parts);
		const base = parts.split('-')[0];
		if (base && base !== parts) candidates.push(base);
	}

	candidates.push(DEFAULT_LOCALE);

	for (const cantidate of candidates) {
		if (cantidate in catalogs) return cantidate as Locale;
	}

	return DEFAULT_LOCALE;
}

/**
 * Obtem dados e linguagem na qual foi feito a requisição
 * @param request Dados da requisição
 * @returns
 */
export function resolveLocale(request: Request): Locale {
	const override =
		(request.query?.lang as string | undefined) ||
		request.header('X-Language') ||
		undefined;

	if (override) return normalizeLocale(override);
	const accept = request.header('Accept-Language') || undefined;
	return normalizeLocale(accept);
}

export type TemplateParams = Record<string, string | number | boolean>;

/**
 * Faz a tradução dos erros
 * @param locale Texto com código de linguagem na qual irá traduzir o erro
 * @param messageCode Código de mensagem do erro
 * @param params
 * @returns Retorna texto de erro traduzido
 */
export function translateError(
	locale: Locale,
	messageCode: MessageCode,
	params: TemplateParams = {}
): string {
	const localCatalog = catalogs[locale] ?? catalogs[DEFAULT_LOCALE];

	let message = catalogs[DEFAULT_LOCALE]['INTERNAL_ERROR']; // Se não achar nada ele vai pegar o texto padrão

	if (locale) {
		message = localCatalog[messageCode] ?? localCatalog['INTERNAL_ERROR'];
	} else {
		message = catalogs[DEFAULT_LOCALE][messageCode];
	}

	for (const [fieldName, value] of Object.entries(params)) {
		const replacement = new RegExp(`\\{${fieldName}\\}`, 'g');
		message = message.replace(replacement, String(value));
	}

	return message;
}
