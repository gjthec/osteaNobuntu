import moment from 'moment';
import 'moment/locale/pt-br';


interface IErrorResult {
    message: string;
    code: number;
    status: string;
}

interface IChartDefault {
    name: string;
    value: number;
}

interface IChartSeries {
    name: string;
    series: { name: string; value: number }[];
}

export interface IFilter {
    typeFilter: string;
    startDate?: string;
    endDate?: string;
    series?: string;
    name?: string;
    value?: string;
}

/**
 * Gera de forma assíncrona dados para gráficos com base nos parâmetros fornecidos.
 * 
 * @param data - Os dados a serem utilizados no gráfico.
 * @param type - O tipo de gráfico a ser gerado. Os valores suportados são "default" e "series".
 * @param name - O nome a ser usado nos dados do gráfico, tipicamente representando a categoria ou etiqueta dos dados.
 * @param value - O valor a ser usado nos dados do gráfico, tipicamente representando o valor dos dados para cada categoria ou etiqueta.
 * @param series - Opcional. A série a ser usada nos dados do gráfico, necessário apenas para gráficos do tipo "series".
 * 
 * @returns Uma promessa que resolve para um objeto. Se bem-sucedido, o objeto contém os dados do gráfico gerados.
 * Se ocorrer um erro, o objeto contém uma mensagem de erro, um código de erro e uma descrição do status.
 */
async function chartUtil(data: any, type: string, name: string, value: string, series?: string): Promise<IChartDefault[] | IChartSeries[] | IErrorResult> {
    try {

        switch (type) {
            case "default":
                return defaultGraphic(data, name, value);
            case "series":
                return seriesGraphic(data, series!, name, value);
            default:
                return { message: "Tipo de gráfico não suportado.", code: 400, status: "Bad Request" };
        }
    } catch (error) {
        return { message: (error as Error).message, code: 500, status: "Internal Server Error" };
    }
}

/**
 * Filtra os dados de um gráfico com base no tipo de filtro especificado no corpo da requisição.
 * 
 * @param bodyReq - O corpo da requisição contendo os parâmetros do filtro.
 * @param data - Os dados a serem filtrados.
 * @returns Uma promessa que resolve para um objeto. Se o filtro for aplicado com sucesso,
 * o objeto contém os dados filtrados. Se o tipo de filtro não for suportado, retorna uma mensagem de erro,
 * código de status HTTP e texto de status. Em caso de outro erro, retorna uma mensagem de erro genérica,
 * código de status HTTP e texto de status.
 */
async function chartFilter(filter: IFilter, data: any): Promise<IChartSeries[] | IErrorResult> {
    try {
        const { typeFilter } = filter;

        switch (typeFilter) {
            case "date":
                return dateFilter(filter, data);
            default:
                return { message: "Tipo de gráfico não suportado.", code: 400, status: "Bad Request" };
        }
    } catch (error) {
        return { message: (error as Error).message, code: 500, status: "Internal Server Error" };
    }
}

/**
 * Gera um gráfico de séries a partir dos dados fornecidos.
 * 
 * @param data - Os dados a serem utilizados no gráfico.
 * @param series - Um array contendo os nomes das séries presentes nos dados.
 * @param name - O nome do campo nos dados que será usado como rótulo no eixo X do gráfico.
 * @param value - O nome do campo nos dados que será usado para determinar os valores no eixo Y do gráfico.
 * @returns Um objeto contendo as séries formatadas para serem utilizadas na construção de um gráfico de séries.
 */
function seriesGraphic(data: any[], series: string, name: string, value: string): IChartSeries[] {
    let mappedData = seriesMapFormatted(data, series, name, value);
    return mappedData;
}

function seriesMapFormatted(data: any[], series: string, name: string, value: string): IChartSeries[] {
    let resData: IChartSeries[] = [];
    let seriesData: { [key: string]: { name: string; value: number }[] } = {};

    for(let i = 0; i < data.length; i++) {
        let item = data[i];
        if (seriesData[item[name]]) {
            seriesData[item[name]].push({
                name: moment(item[series]).format('ddd, DD MMM'),
                value: item[value]
            });
        } else {
            seriesData[item[name]] = [{
                name: moment(item[series]).format('ddd, DD MMM'),
                value: item[value]
            }];
        }
        resData = Object.keys(seriesData).map(key => {
            if (!seriesData[key] || seriesData[key].length === 0) return null;

            return {
                name: key,
                series: seriesData[key]
            };
        }).filter(item => item !== null) as IChartSeries[];
    }
    
    return resData;
}

/**
 * Gera um gráfico padrão a partir dos dados fornecidos.
 * 
 * @param data - Os dados a serem utilizados no gráfico.
 * @param name - O nome do campo nos dados que será usado como rótulo para cada categoria no gráfico.
 * @param value - O nome do campo nos dados que será usado para determinar os valores associados a cada categoria.
 * @returns Um array de objetos, onde cada objeto representa uma categoria com um nome e um valor agregado.
 */
function defaultGraphic(data: any[], name: string, value: string): IChartDefault[] | IErrorResult { 
    return data.reduce((result: IChartDefault[], currentData: any) => {
        const existingData = result.find(item => item.name === currentData[name]);
        if (existingData) {
            existingData.value = parseInt(existingData.value!.toString()) + parseInt(currentData[value]);
        } else {
            result.push({
                name: currentData[name],
                value: currentData[value]
            });
        }
        return result;
    }, []);
}

/**
 * Filtra os dados de um gráfico com base em um intervalo de datas especificado no corpo da requisição.
 * 
 * @param filter - O objeto contendo os parâmetros do filtro.
 * @param data - Os dados a serem filtrados.
 * @returns Uma promessa que resolve para um objeto contendo os dados filtrados por data.
 */
async function dateFilter(filter: IFilter, data: any): Promise<IChartSeries[] | IErrorResult> {
    const { startDate, endDate, series, name, value } = filter;

    if (!startDate || !endDate) {
        return { message: "Data de início e fim são obrigatórias.", code: 400, status: "Bad Request" };
    }

    data = filterDataByDate(data, startDate, endDate, series!);

    return seriesMapFormatted(data, series!, name!, value!);
}

async function filterDataByDate(data: any[], startDate: string, endDate: string, series: string): Promise<any[]> {
    let filteredData = data.filter(item => {
        let date = moment(item[series]).format('YYYY-MM-DD');
        return moment(date).isBetween(startDate, endDate, 'days', '[]');
    });

    return filteredData;
}

function replacer(key: string, value: any): any {
    return typeof value === 'bigint' ? value.toString() : value;
}

function insertWhereClause(query: string, whereClause: string): string {
    query = query.replace(/\s+/g, ' ').trim();

    const joinPattern = /JOIN\b/gi;
    const fromPattern = /FROM\b/gi;
    const groupByPattern = /GROUP BY\b/gi;
    const havingPattern = /HAVING\b/gi;
    const orderByPattern = /ORDER BY\b/gi;

    let joinMatches = [...query.matchAll(joinPattern)];
    let fromMatch = query.match(fromPattern);
    let lastJoinIndex = joinMatches.length > 0 ? joinMatches[joinMatches.length - 1].index : null;
    let fromIndex = fromMatch ? fromMatch.index : null;

    let insertPosition = lastJoinIndex !== null ? lastJoinIndex : fromIndex;

    if (insertPosition === null) {
        throw new Error("Cláusula FROM não encontrada na consulta.");
    }

    let groupByIndex = query.search(groupByPattern);
    let havingIndex = query.search(havingPattern);
    let orderByIndex = query.search(orderByPattern);

    let minIndex = Math.min(
        groupByIndex === -1 ? Infinity : groupByIndex,
        havingIndex === -1 ? Infinity : havingIndex,
        orderByIndex === -1 ? Infinity : orderByIndex
    );

    let finalInsertPosition = minIndex === Infinity ? query.length : minIndex;

    return query.slice(0, finalInsertPosition).trim() + ' ' + whereClause.trim() + ' ' + query.slice(finalInsertPosition).trim();
}

export { chartUtil, chartFilter };
