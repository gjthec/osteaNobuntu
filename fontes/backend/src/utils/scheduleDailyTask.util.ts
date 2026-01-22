/**
 * Agenda uma tarefa para ser executada diariamente em um horário específico
 * @param hour - Hora do dia (0-23)
 * @param minute - Minuto da hora (0-59)
 * @param callback - Função a ser executada no horário agendado
 * @returns Uma função que cancela o agendamento quando chamada
 */
export function scheduleDailyTask(
	hour: number,
	minute: number,
	callback: () => void
): () => void {
	let timeoutId: NodeJS.Timeout;

	function runTask(): void {
		const now = new Date();
		const target = new Date();
		target.setHours(hour, minute, 0, 0); // Define o horário alvo

		// Se já passou do horário hoje, agenda para amanhã
		if (now > target) {
			target.setDate(target.getDate() + 1);
		}

		const delay = target.getTime() - now.getTime(); // Calcula o tempo até o horário alvo

		timeoutId = setTimeout(() => {
			callback(); // Executa a tarefa
			runTask(); // Agenda para o próximo dia
		}, delay);
	}

	runTask(); // Inicia o agendamento

	// Retorna uma função para cancelar o agendamento
	return (): void => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	};
}

// // Exemplo de uso: executar uma tarefa às 2:00 AM
// const cancelTask = scheduleDailyTask(11, 36, () => {
//   console.log(`Executando tarefa agendada às 2:00 AM: ${new Date().toISOString()}`);
//   // Sua lógica aqui
// });

// Para cancelar o agendamento posteriormente:
// cancelTask();
