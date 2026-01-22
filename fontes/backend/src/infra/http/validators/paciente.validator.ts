import { body, check, query } from 'express-validator'; 
import { validateCNPJ, validateCPF } from '../../database/validators'; 

export const createNewPacienteValidator = [ 
    body('nome')
        .isLength({ max: 50 }).withMessage({ messageCode: "VALIDATION_FAILED_LENGTH", metaData: { field: "nome", max_length: 50 } })
        .isString().withMessage({ messageCode: "VALIDATION_FAILED_FORMAT", metaData: { field: "nome" } }),

    body('sexo')
        .optional({ checkFalsy: true }).isString(),

    body('dataNascimento')
        .optional({ checkFalsy: true }) // CRUCIAL PARA O PUT
        .isISO8601().toDate(),

    body('cpf')
        .optional({ checkFalsy: true })
        .custom((value) => {
            return validateCPF(value);
        }).withMessage({ messageCode: "VALIDATION_FAILED_FORMAT", metaData: { field: "cpf" } }),

    body('telefone')
        .optional({ checkFalsy: true })
        .isLength({ max: 20 }).isString(),

    body('email')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 }),

    body('indicacao')
        .optional({ checkFalsy: true }).isString(),

    body('exigenciasTrabalho')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 }).isString(),

    body('atividadesLazer')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 }).isString(),

    body('posturaStress')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 }).isString(),

    body('limitacaoFuncionalAtual')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 }).isString(),

    body('pontuacaoIncapacidadeFuncional')
        .optional({ checkFalsy: true })
        .isNumeric().toInt(),

    body('pontuacaoEVA')
        .optional({ checkFalsy: true })
        .isNumeric().toInt()
];

export const findAllPacienteValidator = [ 
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
