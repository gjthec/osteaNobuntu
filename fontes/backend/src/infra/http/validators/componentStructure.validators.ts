import { check } from "express-validator";

export const getPageStructureValidator = [
  check('componentName').notEmpty().withMessage('componentName is required'),
  check('userId').notEmpty().withMessage('userId is required'),
]
