
import { body, query, ValidationChain } from 'express-validator';


export const createCustomrValidationRules: ValidationChain[] = [

    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters long')
        .escape(),

    body('last_name')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters long')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, dashes, parentheses and plus signs')  
        .isLength({ max: 25 }).withMessage('Phone number must be at most 20 characters long')
        .escape(),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Company name must be at most 255 characters long')
        .escape(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Address must be at most 255 characters long')
        .escape(),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City must be at most 100 characters long')
        .escape(),

    body('state')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('State must be at most 100 characters long')
        .escape(),

    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Postal code must be at most 20 characters long')
        .escape(),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country must be at most 100 characters long')
        .escape(),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Notes must be at most 1000 characters long')
        .escape(),

];

export const updateCustomrValidationRules: ValidationChain[] = [

    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters long')
        .escape(),

    body('last_name')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters long')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number can only contain digits, spaces, dashes, parentheses and plus signs')  
        .isLength({ max: 25 }).withMessage('Phone number must be at most 20 characters long')
        .escape(),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Company name must be at most 255 characters long')
        .escape(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Address must be at most 255 characters long')
        .escape(),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City must be at most 100 characters long')
        .escape(),

    body('state')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('State must be at most 100 characters long')
        .escape(),

    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Postal code must be at most 20 characters long')
        .escape(),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country must be at most 100 characters long')
        .escape(),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Notes must be at most 1000 characters long')
        .escape(),

];

export const queryParamsValidationRules: ValidationChain[] = [

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be an integer greater than 0')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100')
        .toInt(),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Search query must be at most 255 characters long')
        .escape(),

    query('sortBy')
        .optional()
        .isIn(['first_name', 'last_name', 'email', 'created_at', 'updated_at']).withMessage('Invalid sortBy value')
        .escape(),

    query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC']).withMessage('Invalid sortOrder value')
        .escape(),

];
