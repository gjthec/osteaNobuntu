// Interfaces para tipar os filtros
interface FilterParameter {
	parameter: string;
	value: any;
}

interface VariableInfo {
	fieldName: string;
	fieldType: string;
}

export interface FilterValue {
	filterParameter: FilterParameter;
	variableInfo: VariableInfo;
}
