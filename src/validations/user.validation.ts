import { body, param } from 'express-validator';

export const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('gender')
    .optional()
    .trim()
    .isIn(['male', 'female', 'other', ''])
    .withMessage('Gender must be one of: male, female, other, or empty string'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (ISO 8601 format)')
    .custom((value) => {
      if (value) {
        const dob = new Date(value);
        if (dob > new Date()) {
          throw new Error('Date of birth cannot be in the future');
        }
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,6}[)]?[-\s.]?[0-9]{1,10}$/
    )
    .withMessage(
      'Please provide a valid phone number. Accepted formats: +91-9876543210, +919876543210, +91-98765-43210, +1-555-0100, (555) 123-4567, 555.123.4567 (digits with optional +, parentheses, and separators - . or space)'
    ),
];

export const getUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('User ID must be a valid Mongo ObjectId'),
];

