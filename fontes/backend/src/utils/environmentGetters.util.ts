export function getEnvironmentNumber(key: string, defaultValue: number): number {
  const value = process.env[key]; // Obtém o valor do .env
  
  if (value && !isNaN(Number(value))) {
      return Number(value); // Converte para número se válido
  }
  
  return defaultValue; // Retorna valor padrão se ausente ou inválido
}