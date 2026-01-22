import { check, query } from 'express-validator';
/**
 * Validador de campos
 */
export const createNewRoleValidator = [
  //TODO serão gerados com base no mapa mental
  check('name').notEmpty().withMessage('Name is required'),
]

export const findAllRoleValidator = [
  query('page').optional().isNumeric().withMessage('Only digits allowed in title page'),
  query('limit').optional().isNumeric().withMessage('Only digits allowed in title limit')
]