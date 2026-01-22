import { check, param, query } from 'express-validator';
/**
 * Validador de campos
 */
export const createNewTenantValidator = [
	//TODO serão gerados com base no mapa mental
	check('name').notEmpty().withMessage('Name is required')
];

export const findAllTenantValidator = [
	query('page')
		.optional()
		.isNumeric()
		.withMessage('Only digits allowed in title page'),
	query('limit')
		.optional()
		.isNumeric()
		.withMessage('Only digits allowed in title limit')
];

export const findUserByUIDValidator = [
	param('UID').notEmpty().withMessage('UID is required')
];

export const inviteUserToTenant = [
	check('databaseCredentialId')
		.notEmpty()
		.withMessage('databaseCredentialId is required'),
	check('invitedUserEmail')
		.notEmpty()
		.withMessage('invitedUserEmail is required'),
	check('invitingUserEmail')
		.notEmpty()
		.withMessage('invitingUserEmail is required')
		.isEmail()
		.withMessage('invitingUserEmail not email format'),
	check('tenantId').notEmpty().withMessage('tenantId is required')
];

export const removeUserAccessToTenant = [
	check('databaseCredentialId')
		.notEmpty()
		.withMessage('databaseCredentialId is required'),
	check('removedAccessUserId')
		.notEmpty()
		.withMessage('removedAccessUserId is required'),
	check('removingAccessUserUID')
		.notEmpty()
		.withMessage('removingAccessUserUID is required'),
	check('tenantId').notEmpty().withMessage('tenantId is required')
];