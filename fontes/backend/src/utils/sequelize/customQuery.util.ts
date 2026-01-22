import { WhereOptions, Op, fn, where, literal, IncludeOptions } from 'sequelize';
import { QueryOptions } from 'mongoose';

// Interfaces para tipar os filtros
interface FilterParameter {
  parameter: string;
  value: any;
}

interface VariableInfo {
  fieldName: string;
  fieldType: string;
}

interface FilterValue {
  filterParameter: FilterParameter;
  variableInfo: VariableInfo;
}

export interface QueryStructure {
  whereOptions: WhereOptions,
  includeOptions?: IncludeOptions[]
}

/**
 * 
 * @param filterValues 
 * @param filterConditions 
 * @param databaseModels 
 * @param targetModelName Nome do model (referência da tabela) na qual está sendo feito a pesquisa 
 */
export function buildCustomQuery(
  filterValues: FilterValue[],
  filterConditions: string[],
  databaseModels?: Map<string, any>,
  targetModelName?: string,
): QueryStructure {

  let filterQueries: WhereOptions[] = [];
  let includeOptions: IncludeOptions[] = [];

  if (filterValues.length <= 0) {
    throw new Error("Não contém filtros para ser realizado a busca");
  }

  filterValues.forEach(filterValue => {
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
        if (filterValue.variableInfo.fieldType == "entity") {
          if(newQuery.hasOwnProperty("include")){
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

  return { whereOptions: newQuery, includeOptions: includeOptions.length == 0 ? undefined : includeOptions };
}

function createQueryWithConditions(filterConditions: string[], filterParams: WhereOptions[]): WhereOptions {
  let query: WhereOptions = {};
  let newFilterParams: WhereOptions[] = [];
  let filterConditionIndex = 0;

  for (let i = 0; i <= filterParams.length - 2; i += 2) {
    let param: WhereOptions = {};

    const filterParam1 = filterParams[i];
    const filterParam2 = filterParams[i + 1];

    switch (filterConditions[filterConditionIndex]) {
      case 'or':
        param = { [Op.or]: [filterParam1, filterParam2] };
        break;
      case 'and':
        param = { [Op.and]: [filterParam1, filterParam2] };
        break;
      default:
        param = { [Op.or]: [filterParam1, filterParam2] };
        break;
    }

    newFilterParams.push(param);
    filterConditionIndex += 2;
  }

  if (newFilterParams.length > 0) {
    filterParams = newFilterParams;
  }

  if (filterParams.length > 1) {
    filterParams = [createQueryWithConditions(filterConditions.slice(1), filterParams)];
  }

  return filterParams[0];
}

function createQueryBasedOnType(
  variableType: string,
  parameter: string,
  value1: any,
  value2: any,
  variableName: string,
  databaseModels?: Map<string, any>,
  targetModelName?: string,
): WhereOptions | IncludeOptions | null {
  switch (variableType) {
    case 'string':
      return createTextQuery(parameter, value1, variableName);
    case 'number':
      return !isNaN(parseFloat(value1)) ? createNumberQuery(parameter, value1, value2, variableName) : null;
    case 'date':
      return createDateQuery(parameter, value1, value2, variableName);
    case 'boolean':
      return createBooleanQuery(parameter, value1, variableName);
    case 'entity':

      if (!databaseModels || !targetModelName) {
        return createEntityQuery(parameter, value1, variableName);
      }

      
      const currentModel = databaseModels.get(targetModelName);
      //SE a pessoa gera o campo com nome em caixa alta?
      if (currentModel.rawAttributes.hasOwnProperty(variableName)) {
        return createEntityQuery(parameter, value1, variableName);
      }

      //ISSO aqui é triste
      const aliasName = "ALIAS" + variableName + "ALIAS" + targetModelName.toLowerCase() + "ALIAS";

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
        }
      }
    default:
      return null;
  }
}

function createTextQuery(parameter: string, value: string, variableName: string): WhereOptions {
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
    case 'dontContains':
      param[variableName] = { [Op.notILike]: `%${value}%` };
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


function createNumberQuery(parameter: string, value1: number, value2: number, variableName: string): WhereOptions {
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
      break

    default:
      param[variableName] = { [Op.eq]: value1 };
      break;
  }
  return param;
}

function createDateQuery(parameter: string, value1: string, value2: string, variableName: string): WhereOptions {
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
    case 'day':
      //TODO: Fazer a query para pegar o dia
      const dayValue = parseInt(value1, 10);
      param[variableName] = {
        [Op.and]: where(fn('EXTRACT', literal('DAY FROM ' + variableName)), dayValue)
      };
      break;
    case 'month':
      const month = parseInt(value1, 10);
      param[variableName] = {
        [Op.and]: [where(fn('EXTRACT', literal('MONTH FROM ' + variableName)), month)]
      };
      break;
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

function createBooleanQuery(parameter: string, value: boolean, variableName: string): WhereOptions {
  return {
    [variableName]: value
  };
}

function createEntityQuery(parameter: string, value: any, variableName: string): WhereOptions {
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
      param[variableName] = { [Op.notIn]: Array.isArray(value) ? value : [value] };
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