import {
	WhereOptions,
	Op,
	fn,
	where,
	literal,
	IncludeOptions
} from 'sequelize';
import { QueryOptions } from 'mongoose';
import { FilterValue } from '../iFilterValue';
import { InternalServerError } from '../../../errors/internal.error';
import { ValidationError } from '../../../errors/client.error';

export interface QueryStructure {
	whereOptions: WhereOptions;
	includeOptions?: IncludeOptions[];
}

/**
 * Função responsável por construir uma query para o pacote
 * @param filterValues
 * @param filterConditions
 * @param databaseModels
 * @param targetModelName Nome do model (referência da tabela) na qual está sendo feito a pesquisa
 */
export function buildCustomQuery(
	filterValues: FilterValue[],
	filterConditions: string[],
	databaseModels?: Map<string, any>,
	targetModelName?: string
): QueryStructure {
	const filterQueries: WhereOptions[] = [];
	const includeOptions: IncludeOptions[] = [];

	if (!Array.isArray(filterValues)) {
		throw new ValidationError('VALITADION', {
			cause: 'Filter values format error.'
		});
	}
	if (filterValues.length <= 0) {
		throw new ValidationError('VALITADION', {
			cause: 'Filter values format error.'
		});
	}

	filterValues.forEach((filterValue) => {
		if (
			filterValue.filterParameter &&
			filterValue.variableInfo &&
			filterValue.variableInfo.fieldName &&
			filterValue.variableInfo.fieldType
		) {
			let newQuery: WhereOptions | null = null;
			if (!filterValue.filterParameter.value.start) {
				newQuery = createQueryBasedOnType(
					filterValue.variableInfo.fieldType,
					filterValue.filterParameter.parameter,
					filterValue.filterParameter.value,
					null,
					filterValue.variableInfo.fieldName,
					databaseModels,
					targetModelName
				) as QueryOptions;
			} else {
				newQuery = createQueryBasedOnType(
					filterValue.variableInfo.fieldType,
					filterValue.filterParameter.parameter,
					filterValue.filterParameter.value.start,
					filterValue.filterParameter.value.end,
					filterValue.variableInfo.fieldName,
					databaseModels,
					targetModelName
				) as QueryOptions;
			}

			if (newQuery) {
				//ele pode ser entidade mas ele pode ser associaçào direta ou não, tem que verificar isso
				if (filterValue.variableInfo.fieldType == 'entity') {
					if (newQuery.include) {
						includeOptions.push(newQuery.include);
					} else {
						filterQueries.push(newQuery);
					}
				} else {
					filterQueries.push(newQuery);
				}
			}
		}
	});

	// console.log(filterConditions, filterQueries);
	const newQuery = createQueryWithConditions(filterConditions, filterQueries);

	return {
		whereOptions: newQuery,
		includeOptions: includeOptions.length == 0 ? undefined : includeOptions
	};
}

function createQueryWithConditions(
    filterConditions: string[],
    filterParams: WhereOptions[]
): WhereOptions {
    // Se não houver filtros, retorna vazio
    if (filterParams.length === 0) return {};
    
    // Se houver apenas 1, retorna ele mesmo
    if (filterParams.length === 1) return filterParams[0];

    // Começa com o primeiro filtro
    let currentQuery = filterParams[0];

    // Itera sobre o restante, aplicando a condição correspondente
    for (let i = 0; i < filterConditions.length; i++) {
		console.log(currentQuery)
        const nextParam = filterParams[i + 1];
        
        // Segurança caso o array de condições seja maior que o de filtros
        if (!nextParam) break;

        const condition = filterConditions[i];

        if (condition === 'or') {
            currentQuery = { [Op.or]: [currentQuery, nextParam] };
        } else {
            // Padrão 'and'
            currentQuery = { [Op.and]: [currentQuery, nextParam] };
        }
    }

    return currentQuery;
}

function createQueryBasedOnType(
	variableType: string,
	parameter: string,
	value1: any,
	value2: any,
	variableName: string,
	databaseModels?: Map<string, any>,
	targetModelName?: string
): WhereOptions | IncludeOptions | null {
	switch (variableType) {
		case 'string':
			return createTextQuery(parameter, value1, variableName);
		case 'number':
			return !isNaN(parseFloat(value1))
				? createNumberQuery(parameter, value1, value2, variableName)
				: null;
		case 'date':
			return createDateQuery(parameter, value1, value2, variableName);
		case 'boolean':
			return createBooleanQuery(parameter, value1, variableName);
		case 'entity': {
			if (!databaseModels || !targetModelName) {
				return createEntityQuery(parameter, value1, variableName);
			}

			const currentModel = databaseModels.get(targetModelName);
			//SE a pessoa gera o campo com nome em caixa alta?
			if (currentModel.rawAttributes.variableName) {
				return createEntityQuery(parameter, value1, variableName);
			}

			//ISSO aqui é triste
			const aliasName =
				'ALIAS' +
				variableName +
				'ALIAS' +
				targetModelName.toLowerCase() +
				'ALIAS';

			const associationModel = currentModel.associations[aliasName];

			if (!associationModel) {
				return createEntityQuery(parameter, value1, variableName);
			} else {
				//TODO isso aqui é gambiarra pq o nome tá vindo no plural mas as tabels não são, é foda. Propenso a dar erro fácil
				if (variableName.endsWith('S') || variableName.endsWith('s')) {
					variableName = variableName.slice(0, -1);
				}

				const associationModel = databaseModels.get(variableName);

				return {
					include: {
						model: associationModel,
						as: aliasName,
						where: {
							id: {
								[Op.in]: value1
							}
						}
					}
				};
			}
		}
		case 'selector':
			return createTextQuery('equal', value1, variableName);
		default:
			return null;
	}
}

function createTextQuery(
	parameter: string,
	value: string,
	variableName: string
): WhereOptions {
	const param: WhereOptions = {};
	switch (parameter) {
		case 'equal':
			param[variableName] = { [Op.eq]: value };
			break;
		case 'different':
			param[variableName] = { [Op.ne]: value };
			break;
		case 'contains':
			param[variableName] = { [Op.iLike]: `%${value}%` };
			break;
		case 'dontContains':
			param[variableName] = { [Op.notILike]: `%${value}%` };
			break;
		case 'startWith':
			param[variableName] = { [Op.iLike]: `${value}%` };
			break;
		case 'endWith':
			param[variableName] = { [Op.iLike]: `%${value}` };
			break;
		case 'match':
			param[variableName] = { [Op.iLike]: `%${value}%` };
			break;
		default:
			param[variableName] = { [Op.iLike]: `%${value}%` };
			break;
	}
	return param;
}

function createNumberQuery(
	parameter: string,
	value1: number,
	value2: number,
	variableName: string
): WhereOptions {
	const param: WhereOptions = {};
	switch (parameter) {
		case 'equal':
			param[variableName] = { [Op.eq]: value1 };
			break;
		case 'between':
			param[variableName] = { [Op.between]: [value1, value2] };
			break;
		case 'biggerThan':
			param[variableName] = { [Op.gt]: value1 };
			break;
		case 'smallerThan':
			param[variableName] = { [Op.lt]: value1 };
			break;
		case 'biggerOrEqualThan':
			param[variableName] = { [Op.gte]: value1 };
			break;
		case 'smallerOrEqualThan':
			param[variableName] = { [Op.lte]: value1 };
			break;
		case 'different':
			param[variableName] = { [Op.ne]: value1 };
			break;

		default:
			param[variableName] = { [Op.eq]: value1 };
			break;
	}
	return param;
}

function createDateQuery(
	parameter: string,
	value1: string,
	value2: string,
	variableName: string
): WhereOptions {
	const param: WhereOptions = {};
	const date1 = new Date(value1);
	const date2 = new Date(value2);

	switch (parameter) {
		case 'between':
			param[variableName] = { [Op.between]: [date1, date2] };
			break;
		case 'beforeThan':
			param[variableName] = { [Op.lt]: date1 };
			break;
		case 'afterThan':
			param[variableName] = { [Op.gt]: date1 };
			break;
		case 'beforeOrEqualThan':
			param[variableName] = { [Op.lte]: date1 };
			break;
		case 'afterOrEqualThan':
			param[variableName] = { [Op.gte]: date1 };
			break;
		case 'day': {
			const dayValue = parseInt(value1, 10);
			param[variableName] = {
				[Op.and]: where(
					fn('EXTRACT', literal('DAY FROM ' + variableName)),
					dayValue
				)
			};
			break;
		}
		case 'month': {
			console.log('variableName: ', variableName);

			const month = parseInt(value1, 10);
			param[variableName] = {
				[Op.and]: [
					where(fn('EXTRACT', literal('MONTH FROM ' + variableName)), month)
				]
			};
			break;
		}
		case 'year':
			param[variableName] = { [Op.eq]: value1 };
			break;
		case 'week':
			param[variableName] = { [Op.eq]: value1 };
			break;
		default:
			param[variableName] = { [Op.eq]: date1 };
			break;
	}
	return param;
}

function createBooleanQuery(
	parameter: string,
	value: boolean,
	variableName: string
): WhereOptions {
	return {
		[variableName]: value
	};
}

function createEntityQuery(
	parameter: string,
	value: any,
	variableName: string
): WhereOptions {
	const param: WhereOptions = {};

	switch (parameter) {
		case 'equal':
			param[variableName] = { [Op.eq]: value };
			break;
		case 'different':
			param[variableName] = { [Op.ne]: value };
			break;
		case 'in':
			// Para quando value é um array de IDs
			param[variableName] = { [Op.in]: Array.isArray(value) ? value : [value] };
			break;
		case 'notIn':
			// Para quando value é um array de IDs que não devem estar incluídos
			param[variableName] = {
				[Op.notIn]: Array.isArray(value) ? value : [value]
			};
			break;
		case 'isNull':
			param[variableName] = { [Op.is]: null };
			break;
		case 'isNotNull':
			param[variableName] = { [Op.not]: null };
			break;
		default:
			param[variableName] = { [Op.eq]: value };
			break;
	}

	return param;
}
