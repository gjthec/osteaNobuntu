/**
 * validateStringLength - valida se string respeita limite máximo do tamanho
 * validateDatePast - valida se uma data é anterior à data atual (passado)
 * validateDateFutureStrict - valida se uma data está no futuro
 * validateDateRange - valida data em range
 * validateNumberRange - valida inteiro em range
 * validateDecimalRange - valida decimal em range
 * validateEmail - valida e-mail
 * validateUrl - valida URL
 * validateCPF - valida CPF brasileiro
 * validateCNPJ - valida CNPJ brasileiro
 */

/**
 * Valida se o tamanho de uma string está dentro de um limite definido.
 *
 * @param value - String a ser validada
 * @param minLength - Tamanho mínimo permitido (opcional)
 * @param maxLength - Tamanho máximo permitido (opcional)
 * @returns true se a validação passar, false caso contrário
 */
export function validateStringLength(
	value: string | undefined | null,
	minLength?: number,
	maxLength?: number
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	const length = value.length;

	// Valida tamanho mínimo se fornecido
	if (minLength !== undefined && length < minLength) {
		return false;
	}

	// Valida tamanho máximo se fornecido
	if (maxLength !== undefined && length > maxLength) {
		return false;
	}

	return true;
}

/**
 * Valida se uma data é anterior à data atual (passado).
 *
 * @param value - Data a ser validada
 * @param allowToday - Se true, permite a data de hoje; se false, apenas datas anteriores a hoje
 * @returns true se a validação passar, false caso contrário
 */
export function validateDatePast(
	value: Date | string | undefined | null,
	allowToday: boolean = false
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	let dateValue: Date;

	// Converte string para Date se necessário
	if (typeof value === 'string') {
		dateValue = new Date(value);

		// Verifica se a data é válida
		if (isNaN(dateValue.getTime())) {
			return false;
		}
	} else if (value instanceof Date) {
		// Verifica se a data é válida
		if (isNaN(value.getTime())) {
			return false;
		}
		dateValue = value;
	} else {
		return false;
	}

	const now = new Date();

	// Zera as horas para comparar apenas a data
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const inputDate = new Date(
		dateValue.getFullYear(),
		dateValue.getMonth(),
		dateValue.getDate()
	);

	if (allowToday) {
		return inputDate <= today;
	} else {
		return inputDate < today;
	}
}

/**
 * Valida se uma data está no futuro.
 *
 * @param value - Data a ser validada
 * @param allowToday - Se true, permite a data de hoje; se false, apenas datas futuras
 * @returns true se a validação passar, false caso contrário
 */
export function validateDateFutureStrict(
	value: Date | string | undefined | null,
	allowToday: boolean = false
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	let dateValue: Date;

	// Converte string para Date se necessário
	if (typeof value === 'string') {
		dateValue = new Date(value);

		// Verifica se a data é válida
		if (isNaN(dateValue.getTime())) {
			return false;
		}
	} else if (value instanceof Date) {
		// Verifica se a data é válida
		if (isNaN(value.getTime())) {
			return false;
		}
		dateValue = value;
	} else {
		return false;
	}

	const now = new Date();

	// Zera as horas para comparar apenas a data
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const inputDate = new Date(
		dateValue.getFullYear(),
		dateValue.getMonth(),
		dateValue.getDate()
	);

	if (allowToday) {
		return inputDate >= today;
	} else {
		return inputDate > today;
	}
}

/**
 * Valida se uma data está dentro de um range (intervalo) definido.
 *
 * @param value - Data a ser validada
 * @param startDate - Data inicial do range (obrigatória)
 * @param endDate - Data final do range (opcional, se não definida não há limite máximo)
 * @returns true se a validação passar, false caso contrário
 */
export function validateDateRange(
	value: Date | string | undefined | null,
	startDate: Date | string,
	endDate?: Date | string | null
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	let dateValue: Date;
	let startDateValue: Date;
	let endDateValue: Date | null = null;

	// Converte value para Date
	if (typeof value === 'string') {
		dateValue = new Date(value);
		if (isNaN(dateValue.getTime())) {
			return false;
		}
	} else if (value instanceof Date) {
		if (isNaN(value.getTime())) {
			return false;
		}
		dateValue = value;
	} else {
		return false;
	}

	// Converte startDate para Date
	if (typeof startDate === 'string') {
		startDateValue = new Date(startDate);
		if (isNaN(startDateValue.getTime())) {
			return false;
		}
	} else if (startDate instanceof Date) {
		if (isNaN(startDate.getTime())) {
			return false;
		}
		startDateValue = startDate;
	} else {
		return false;
	}

	// Converte endDate para Date (se fornecida)
	if (endDate !== null && endDate !== undefined) {
		if (typeof endDate === 'string') {
			endDateValue = new Date(endDate);
			if (isNaN(endDateValue.getTime())) {
				return false;
			}
		} else if (endDate instanceof Date) {
			if (isNaN(endDate.getTime())) {
				return false;
			}
			endDateValue = endDate;
		} else {
			return false;
		}
	}

	// Valida se está dentro do range
	const isAfterStart = dateValue >= startDateValue;
	const isBeforeEnd = endDateValue === null || dateValue <= endDateValue;

	return isAfterStart && isBeforeEnd;
}

/**
 * Valida se um número inteiro está dentro de um range (intervalo) definido.
 *
 * @param value - Número a ser validado
 * @param min - Valor mínimo permitido (opcional)
 * @param max - Valor máximo permitido (opcional)
 * @returns true se a validação passar, false caso contrário
 */
export function validateNumberRange(
	value: number | undefined | null,
	min?: number,
	max?: number
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	// Verifica se é um número válido
	if (typeof value !== 'number' || isNaN(value)) {
		return false;
	}

	// Verifica se é inteiro
	if (!Number.isInteger(value)) {
		return false;
	}

	// Valida mínimo se fornecido
	if (min !== undefined && value < min) {
		return false;
	}

	// Valida máximo se fornecido
	if (max !== undefined && value > max) {
		return false;
	}

	return true;
}

/**
 * Valida se um número decimal está dentro de um range (intervalo) definido.
 * Similar ao validateNumberRange, mas aceita decimais.
 *
 * @param value - Número a ser validado
 * @param min - Valor mínimo permitido (opcional)
 * @param max - Valor máximo permitido (opcional)
 * @returns true se a validação passar, false caso contrário
 */
export function validateDecimalRange(
	value: number | undefined | null,
	min?: number,
	max?: number
): boolean {
	// Se o valor for nulo/undefined, deixa outras validações (como required) tratarem
	if (value === null || value === undefined) {
		return true;
	}

	// Verifica se é um número válido
	if (typeof value !== 'number' || isNaN(value)) {
		return false;
	}

	// Valida mínimo se fornecido
	if (min !== undefined && value < min) {
		return false;
	}

	// Valida máximo se fornecido
	if (max !== undefined && value > max) {
		return false;
	}

	return true;
}

/**
 * Valida se um valor é um e-mail válido.
 *
 * @param value - String a ser validada
 * @returns true se for um e-mail válido, false caso contrário
 */
export function validateEmail(value: string | undefined | null): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	// Regex simples para validação de e-mail
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
}

/**
 * Valida se um valor é uma URL válida.
 *
 * @param value - String a ser validada
 * @param requireProtocol - Se true, exige protocolo (http/https)
 * @returns true se for uma URL válida, false caso contrário
 */
export function validateUrl(
	value: string | undefined | null,
	requireProtocol: boolean = true
): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	try {
		const url = new URL(value);

		if (requireProtocol) {
			return url.protocol === 'http:' || url.protocol === 'https:';
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Valida se um CPF é válido (apenas formato brasileiro).
 *
 * @param value - String do CPF a ser validado
 * @returns true se for um CPF válido, false caso contrário
 */
export function validateCPF(value: string | undefined | null): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	// Remove caracteres não numéricos
	const cpf = value.replace(/\D/g, '');

	// Verifica se tem 11 dígitos
	if (cpf.length !== 11) {
		return false;
	}

	// Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
	if (/^(\d)\1{10}$/.test(cpf)) {
		return false;
	}

	// Validação dos dígitos verificadores
	let sum = 0;
	let remainder: number;

	// Valida primeiro dígito verificador
	for (let i = 1; i <= 9; i++) {
		sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	if (remainder !== parseInt(cpf.substring(9, 10))) return false;

	// Valida segundo dígito verificador
	sum = 0;
	for (let i = 1; i <= 10; i++) {
		sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	if (remainder !== parseInt(cpf.substring(10, 11))) return false;

	return true;
}

/**
 * Valida se um CNPJ é válido (apenas formato brasileiro).
 *
 * @param value - String do CNPJ a ser validado
 * @returns true se for um CNPJ válido, false caso contrário
 */
export function validateCNPJ(value: string | undefined | null): boolean {
	if (value === null || value === undefined) {
		return true;
	}

	if (typeof value !== 'string') {
		return false;
	}

	// Remove caracteres não numéricos
	const cnpj = value.replace(/\D/g, '');

	// Verifica se tem 14 dígitos
	if (cnpj.length !== 14) {
		return false;
	}

	// Verifica se todos os dígitos são iguais
	if (/^(\d)\1{13}$/.test(cnpj)) {
		return false;
	}

	// Validação dos dígitos verificadores
	let length = cnpj.length - 2;
	let numbers = cnpj.substring(0, length);
	const digits = cnpj.substring(length);
	let sum = 0;
	let pos = length - 7;

	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbers.charAt(length - i)) * pos--;
		if (pos < 2) pos = 9;
	}

	let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	if (result !== parseInt(digits.charAt(0))) return false;

	length = length + 1;
	numbers = cnpj.substring(0, length);
	sum = 0;
	pos = length - 7;

	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbers.charAt(length - i)) * pos--;
		if (pos < 2) pos = 9;
	}

	result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	if (result !== parseInt(digits.charAt(1))) return false;

	return true;
}
