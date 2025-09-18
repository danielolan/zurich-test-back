const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} property - Property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Show all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false // Don't allow unknown fields
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: validationErrors
        }
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Multiple validation middleware
 * Validates multiple properties (body, query, params) at once
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each schema
    Object.keys(schemas).forEach(property => {
      const schema = schemas[property];
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const propertyErrors = error.details.map(detail => ({
          property,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        errors.push(...propertyErrors);
      } else {
        // Replace with validated data
        req[property] = value;
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: errors
        }
      });
    }

    next();
  };
};

/**
 * Sanitize input middleware
 * Basic XSS protection
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '') // Remove < and > characters
        .trim();
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Check required fields middleware
 */
const checkRequired = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          details: missingFields.map(field => ({
            field,
            message: `${field} is required`
          }))
        }
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateMultiple,
  sanitizeInput,
  checkRequired
};