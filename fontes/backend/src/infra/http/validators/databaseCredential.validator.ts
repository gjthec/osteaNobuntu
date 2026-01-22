import { check, param, query } from 'express-validator';
/**
 * Validador de campos
 */
export const createNewDatabaseCredentialValidator = [
  check('dbName').notEmpty().withMessage('dbName is required'),
  check('dbType').notEmpty().withMessage('dbType is required'),
  check('dbUsername').notEmpty().withMessage('dbUsername is required'),
  check('dbPassword').notEmpty().withMessage('dbPassword is required'),
  check('dbHost').notEmpty().withMessage('dbHost is required'),
  check('dbPort').notEmpty().withMessage('dbPort is required'),
]

export const findAllDatabaseCredentialValidator = [
  query('page').optional().isNumeric().withMessage('Only digits allowed in title page'),
  query('limit').optional().isNumeric().withMessage('Only digits allowed in title limit')
]