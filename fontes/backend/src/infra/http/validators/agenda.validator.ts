import { body, check, query } from 'express-validator'; 
import { validateCNPJ, validateCPF } from '../../database/validators'; 

export const createNewAgendaValidator = [ 
    body('titulo')
    .exists({ checkFalsy: true }).withMessage({ messageCode: "FIELD_REQUIRED", metaData: { field: "titulo" } })
    .isLength({ max: 60 }).withMessage({ messageCode: "VALIDATION_FAILED_LENGTH", metaData: { field: "titulo", max_length: 60 } })
    .isString().withMessage({ messageCode: "VALIDATION_FAILED_FORMAT", metaData: { field: "titulo" } }) 
,    body('observacao')
    .isLength({ max: 255 }).withMessage({ messageCode: "VALIDATION_FAILED_LENGTH", metaData: { field: "observacao", max_length: 255 } })
    .isString().withMessage({ messageCode: "VALIDATION_FAILED_FORMAT", metaData: { field: "observacao" } }) 
,    body('data')
.isISO8601().withMessage({
        messageCode: "VALIDATION_FAILED_FORMAT", metaData: { field: "data" } }).toDate() 
,    body('hora')
,    body('status')
,    body('paciente')
,    body('avaliacao')
,  ]; 

export const findAllAgendaValidator = [ 
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
