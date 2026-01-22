import { body, check, query } from 'express-validator';
/**
 * Validador de campos
 */
export const createNewFilterSearchParameterValidator = [
	body('name')
		.exists({ checkFalsy: true })
		.withMessage({ messageCode: 'FIELD_REQUIRED', metaData: { field: 'name' } })
		.isString()
		.withMessage({
			messageCode: 'VALIDATION_FAILED_FORMAT',
			metaData: { field: 'name' }
		})
		.isLength({ min: 3, max: 60 })
		.withMessage({
			messageCode: 'VALIDATION_FAILED_LENGTH',
			metaData: { field: 'name', min_length: 3, max_length: 60 }
		}),
	body('isPublic')
		.exists()
		.withMessage({
			messageCode: 'FIELD_REQUIRED',
			metaData: { field: 'isPublic' }
		})
		.isBoolean()
		.withMessage({
			messageCode: 'VALIDATION_FAILED_FORMAT',
			metaData: { field: 'isPublic' }
		})
		.toBoolean(), // converte "true"/"false"/1/0 em boolean
	body('parameters')
		.exists({ checkFalsy: true })
		.withMessage({
			messageCode: 'FIELD_REQUIRED',
			metaData: { field: 'parameters' }
		}),
	body('className')
		.exists({ checkFalsy: true })
		.withMessage({
			messageCode: 'FIELD_REQUIRED',
			metaData: { field: 'className' }
		})
		.isString()
		.withMessage({
			messageCode: 'VALIDATION_FAILED_FORMAT',
			metaData: { field: 'name' }
		})
];

export const findAllFilterSearchParameterValidator = [
	query('page')
		.optional()
		.isNumeric()
		.withMessage({
			messageCode: 'VALIDATION_FAILED_FORMAT',
			metaData: { field: 'page' }
		}),
	query('limit')
		.optional()
		.isNumeric()
		.withMessage({
			messageCode: 'VALIDATION_FAILED_FORMAT',
			metaData: { field: 'limit' }
		})
];
