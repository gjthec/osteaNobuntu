/**
 * Permite ver no console o erro e a sequência de erros que originaram ele.
 * @param error
 * @param level
 */
export function printErrorChain(error: any, level: number = 0): void {
	const prefix = '  '.repeat(level);
	console.log(`${prefix}${error.name || 'Error'}: ${error.message}`);

	if (error.cause) {
		printErrorChain(error.cause, level + 1);
	}
}

export function getLastError(error: any): any {
	let current = error;
	while (current.cause) {
		current = current.cause;
	}
	return current;
}
