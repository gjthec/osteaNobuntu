export function getDateRangeForYesterdayToToday(): {
	startDate: Date;
	endDate: Date;
} {
	const now = new Date();

	const startDate = new Date();
	startDate.setDate(now.getDate() - 1); //Pega o dia anterior
	startDate.setHours(0, 0, 0, 0); // Início do dia

	const endDate = new Date();
	endDate.setHours(23, 59, 59, 999); //Fim do dia

	return {
		startDate,
		endDate
	};
}
