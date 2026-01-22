export function toSnakeCase(text: string): string {
	return text
		.replace(/([A-Z])/g, '_$1') // Adiciona _ antes de cada maiúscula
		.toLowerCase() // Converte tudo para minúscula
		.replace(/^_/, ''); // Remove _ do início se houver
}

/**
 * Verifica se o texto contém apenas letras minúsculas, números e underscores e não contém letras minúsculas
 * @param text
 * @returns Verdadeiro se for Snake Case
 */
export function isSnakeCase(text: string): boolean {
	return /^[a-z0-9_]+$/.test(text) && !/[A-Z]/.test(text);
}
