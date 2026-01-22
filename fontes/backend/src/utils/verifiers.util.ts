export function checkEnvironmentVariableIsEmpty(variable: string): boolean {
	if (
		!variable ||
		typeof variable !== 'string' ||
		!variable.trim() ||
		variable == undefined
	) {
		return true;
	}
	return false;
}

export function checkEmailIsValid(email: string): boolean {
	// Expressão regular para validar endereços de e-mail
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
}