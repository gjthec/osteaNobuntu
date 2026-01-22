// Função para formatar documento (CPF ou CNPJ)
export function formatDocument(document: string): string {
	if (!document) return '';

	// Verifica se parece com um CPF ou CNPJ apenas por comprimento aproximado
	const digits = document.replace(/[^\d]/g, '');

	if (digits.length <= 11) {
		return formatCPF(document);
	} else {
		return formatCNPJ(document);
	}
}

// Função para formatar CEP: 85960-140
// Preserva caracteres não numéricos
export function formatCEP(cep: string): string {
	// Garantir que cep seja uma string
	cep = String(cep || '');

	if (!cep) return '';

	// Se já estiver formatado ou tiver caracteres não numéricos além do hífen
	if (cep.includes('-') || cep.replace(/[\d-]/g, '').length > 0) {
		return cep;
	}

	// Formata apenas se for uma string de números pura
	const numbers = cep.trim();
	if (/^\d{8}$/.test(numbers)) {
		return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
	}

	return cep;
}

// Função para formatar telefone celular: (45) 99908-3444
export function formatCellPhone(phone: string): string {
	if (!phone) return '';

	// Remove caracteres não numéricos
	const numbers = phone.replace(/\D/g, '');

	// Verifica se é um número de celular (geralmente com 11 dígitos no Brasil)
	if (numbers.length === 11) {
		return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
	}

	return phone;
}

// Função para formatar telefone fixo: (45) 3284-2426
export function formatLandline(phone: string): string {
	if (!phone) return '';

	// Remove caracteres não numéricos
	const numbers = phone.replace(/\D/g, '');

	// Verifica se é um número fixo (geralmente com 10 dígitos no Brasil)
	if (numbers.length === 10) {
		return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
	}

	return phone;
}

// Função para formatar qualquer tipo de telefone
export function formatPhone(phone: string): string {
	if (!phone) return '';

	const numbers = phone.replace(/\D/g, '');

	if (numbers.length === 11) {
		return formatCellPhone(numbers);
	} else if (numbers.length === 10) {
		return formatLandline(numbers);
	}

	return phone;
}

// Função para formatar CPF: 000.000.000-00
// Preserva caracteres não numéricos
export function formatCPF(cpf: string): string {
	if (!cpf) return '';

	// Se já estiver formatado ou tiver caracteres não numéricos além da formatação padrão
	if (
		cpf.includes('.') ||
		cpf.includes('-') ||
		cpf.replace(/[\d.-]/g, '').length > 0
	) {
		return cpf;
	}

	// Formata apenas se for uma string de números pura
	let digits = cpf.trim();
	// Preenche com zeros à esquerda até ter 11 dígitos
	digits = digits.padStart(11, '0');

	if (/^\d{11}$/.test(digits)) {
		return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
	}

	return cpf;
}

// Função para formatar CNPJ: 00.000.000/0000-00
// Preserva caracteres não numéricos
export function formatCNPJ(cnpj: string): string {
	if (!cnpj) return '';

	// Se já estiver formatado ou tiver caracteres não numéricos além da formatação padrão
	if (
		cnpj.includes('.') ||
		cnpj.includes('/') ||
		cnpj.includes('-') ||
		cnpj.replace(/[\d.\/-]/g, '').length > 0
	) {
		return cnpj;
	}

	// Formata apenas se for uma string de números pura
	let digits = cnpj.trim();
	// Preenche com zeros à esquerda até ter 14 dígitos
	digits = digits.padStart(14, '0');
	if (/^\d{14}$/.test(digits)) {
		return digits.replace(
			/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
			'$1.$2.$3/$4-$5'
		);
	}

	return cnpj;
}

export function isValidDate(date: any): boolean {
	return date instanceof Date && !isNaN(date.getTime());
}
