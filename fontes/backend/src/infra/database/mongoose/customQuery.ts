import { Model } from 'mongoose';
import { FilterValue } from '../iFilterValue';

interface QueryCondition {
	$or?: object[];
	$and?: object[];
}

interface QueryObject {
	[key: string]: any;
}

// Função principal
export async function buildCustomQuery(
	filterValues: FilterValue[],
	filterConditions: string[]
) {
	const filterQuerys: QueryObject[] = [];

	if (filterValues.length <= 0) {
		new Error('Não contém filtros para ser realizado a busca');
	}

	filterValues.forEach((filterValue) => {
		if (
			filterValue.filterParameter &&
			filterValue.filterParameter != null &&
			filterValue.variableInfo &&
			filterValue.variableInfo.fieldName != null &&
			filterValue.variableInfo.fieldType != null
		) {
			let newQuery: QueryObject | null;

			if (
				filterValue.filterParameter.value &&
				!filterValue.filterParameter.value.start
			) {
				newQuery = createQueryBasedToType(
					filterValue.variableInfo.fieldType,
					filterValue.filterParameter.parameter,
					filterValue.filterParameter.value,
					null,
					filterValue.variableInfo.fieldName,
					'i'
				);
			} else {
				newQuery = createQueryBasedToType(
					filterValue.variableInfo.fieldType,
					filterValue.filterParameter.parameter,
					filterValue.filterParameter.value.start,
					filterValue.filterParameter.value.end,
					filterValue.variableInfo.fieldName,
					'i'
				);
			}

			if (newQuery != null) {
				filterQuerys.push(newQuery);
			}
		}
	});

	return createQueryWithConditions(filterConditions, filterQuerys);
}

// Função para criar query com condições
function createQueryWithConditions(
	filterConditions: string[],
	filterParams: QueryObject[]
): QueryObject[] {
	const query: QueryCondition[] = [];
	const newFilterParams: QueryObject[] = [];
	const newFilterConditions: string[] = [];
	let filterConditionIndex = 0;

	for (
		let filterParamIndex = 0;
		filterParamIndex <= filterParams.length - 2;
		filterParamIndex += 2
	) {
		let param: QueryCondition = {};

		const filterParam1 = filterParams[filterParamIndex];
		const filterParam2 = filterParams[filterParamIndex + 1];

		switch (filterConditions[filterConditionIndex]) {
			case 'or':
				param = { $or: [filterParam1, filterParam2] };
				break;
			case 'and':
				param = { $and: [filterParam1, filterParam2] };
				break;
			default:
				param = { $or: [filterParam1, filterParam2] };
				break;
		}

		newFilterParams.push(param);
		filterConditionIndex += 2;
	}

	if (newFilterParams.length > 0) {
		filterParams = newFilterParams;
	}

	for (
		let filterConditionIndex = 1;
		filterConditionIndex < filterConditions.length;
		filterConditionIndex++
	) {
		if (filterConditionIndex % 2 != 0) {
			newFilterConditions.push(filterConditions[filterConditionIndex]);
		}
	}

	if (filterParams.length > 1) {
		filterParams = createQueryWithConditions(newFilterConditions, filterParams);
	}

	return filterParams;
}

// Função para criar query baseado no tipo
function createQueryBasedToType(
	variableType: string,
	parameter: string,
	value1: any,
	value2: any | null,
	variableName: string,
	options: string
): QueryObject | null {
	switch (variableType) {
		case 'string':
			return createTextQuery(parameter, value1, variableName, options);
		case 'number':
			return !isNaN(parseFloat(value1))
				? createNumberQuery(parameter, value1, value2, variableName)
				: null;
		case 'date':
			return createDateQuery(parameter, value1, value2, variableName);
		case 'boolean':
			return createBooleanQuery(parameter, value1, variableName);
		case 'selector':
			return createTextQuery('equal', value1, variableName, options);
		default:
			return null;
	}
}

// Funções para diferentes tipos de query
function createTextQuery(
	parameter: string,
	value: any,
	variableName: string,
	options: string
): QueryObject {
	const param: QueryObject = {};
	switch (parameter) {
		case 'equal':
			param[variableName] = { $regex: '^' + value + '$', $options: options };
			break;
		case 'different':
			param[variableName] = {
				$not: { $regex: '^' + value + '$', $options: options }
			};
			break;
		case 'startWith':
			param[variableName] = { $regex: '^' + value, $options: options };
			break;
		case 'endWith':
			param[variableName] = { $regex: value + '$', $options: options };
			break;
		case 'contains':
			param[variableName] = { $regex: value, $options: options };
			break;
		case 'dontContains':
			param[variableName] = { $not: { $regex: value, $options: options } };
			break;
		case 'match':
			param[variableName] = { $text: { $search: value } };
			break;
		default:
			param[variableName] = { $regex: value, $options: options };
			break;
	}
	return param;
}

function createNumberQuery(
	parameter: string,
	value1: any,
	value2: any | null,
	variableName: string
): QueryObject {
	let param: QueryObject = {};
	switch (parameter) {
		case 'equal':
			param[variableName] = { $eq: value1 };
			break;
		case 'different':
			param[variableName] = { $ne: value1 };
			break;
		case 'biggerThan':
			param[variableName] = { $gt: value1 };
			break;
		case 'biggerOrEqualThan':
			param[variableName] = { $gte: value1 };
			break;
		case 'smallerThan':
			param[variableName] = { $lt: value1 };
			break;
		case 'smallerOrEqualThan':
			param[variableName] = { $lte: value1 };
			break;
		case 'between':
			param = {
				$and: [
					{ [variableName]: { $gte: value1 } },
					{ [variableName]: { $lte: value2 } }
				]
			};
			break;
		default:
			param[variableName] = { $eq: value1 };
			break;
	}
	return param;
}

function createBooleanQuery(
	parameter: string,
	value: boolean,
	variableName: string
): QueryObject {
	const param: QueryObject = {};
	param[variableName] = value;
	return param;
}

function createDateQuery(
	parameter: string,
	value1: any,
	value2: any | null,
	variableName: string
): QueryObject {
	let param: QueryObject = {};
	switch (parameter) {
		case 'day':
			param = { $expr: { $eq: [{ $dayOfMonth: '$' + variableName }, value1] } };
			break;
		case 'month':
			param = { $expr: { $eq: [{ $month: '$' + variableName }, value1] } };
			break;
		case 'year':
			param = { $expr: { $eq: [{ $year: '$' + variableName }, value1] } };
			break;
		case 'week':
			param = { $expr: { $eq: [{ $week: '$' + variableName }, value1] } };
			break;
		case 'different':
			param[variableName] = { $ne: new Date(value1) };
			break;
		case 'afterThan':
			param[variableName] = { $gt: new Date(value1) };
			break;
		case 'afterOrEqualThan':
			param[variableName] = { $gte: new Date(value1) };
			break;
		case 'beforeThan':
			param[variableName] = { $lt: new Date(value1) };
			break;
		case 'beforeOrEqualThan':
			param[variableName] = { $lte: new Date(value1) };
			break;
		case 'between':
			param = {
				$and: [
					{ [variableName]: { $gte: new Date(value1) } },
					{ [variableName]: { $lte: new Date(value2) } }
				]
			};
			break;
		default:
			param[variableName] = { $eq: new Date(value1) };
			break;
	}
	return param;
}
