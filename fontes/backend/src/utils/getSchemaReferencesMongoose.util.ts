/**
 * Obtem o nome de todos os campos que se tem ObjectIds
 * @param {*} dbSchema MongoseModel
 * @returns Array de string de ObjectIds
 */
export default function getSchemaReferences(dbSchema: any): string[] {
	// Pegar schema do model passado
	const schema = dbSchema;
	const populate : string[] = [];

	// Retornar todas as referÃªncias estrangeiras
	for (const key in schema) {
		if (schema[key].ref) {
			populate.push(key);
		}
		if (schema[key][0] && schema[key][0].ref) {
			populate.push(key);
		}
	}
	return populate;
}