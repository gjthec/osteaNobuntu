import e from 'express';
import { check, param, query } from 'express-validator';
/**
 * Validador de campos
 */
export const createNewUserValidator = [
	//TODO serão gerados com base no mapa mental
	check('userName').notEmpty().withMessage('userName is required'),
	check('firstName').notEmpty().withMessage('firstName is required'),
	check('lastName').notEmpty().withMessage('lastName is required'),
	check('email').isEmail().withMessage('email is required'),
	check('password').notEmpty().withMessage('password is required')
];

export const findAllUserValidator = [
	query('page')
		.optional()
		.isNumeric()
		.withMessage('Only digits allowed in title page'),
	query('limit')
		.optional()
		.isNumeric()
		.withMessage('Only digits allowed in title limit')
];

export const sendVerificationEmailCodeValidator = [
	check('email').isEmail().withMessage('email is required')
];

export const validateVerificationEmailCodeValidator = [
	check('verificationEmailCode')
		.notEmpty()
		.withMessage('verificationEmailCode is required')
];

export const sendResetPasswordLinkToEmailValidator = [
	check('email').isEmail().withMessage('email is required')
];

export const findUserByUIDValidator = [
	param('UID').notEmpty().withMessage('UID is required')
];

export const checkEmailExistValidator = [
	check('email').notEmpty().withMessage('email is required')
];

export const signinValidator = [
	check('password').notEmpty().withMessage('password is required'),
	check('email').isEmail().withMessage('email is required')
];

export const inviteUserValidator = [
	check('invitingUserEmail')
		.notEmpty()
		.withMessage('invitingUserEmail is required')
		.isEmail()
		.withMessage('invitingUserEmail is wrong format'),
	check('invitedUserEmail')
		.notEmpty()
		.withMessage('invitedUserEmail is required')
		.isEmail()
		.withMessage('invitedUserEmail is wrong format'),
	check('invitingUserId').notEmpty().withMessage('invitingUserId is required'),
	check('invitedUserTenantIds')
		.notEmpty()
		.withMessage('nvitedUserTenantIds is required')
];