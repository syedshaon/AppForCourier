import Joi from "joi";
import { validationErrorResponse } from "../utils/response.js";

// Add validation middleware usage example
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      // Use the response utility instead of custom response
      return validationErrorResponse(res, "Validation failed", errors);
    }
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
  address: Joi.string().max(200).optional().allow(""),
  role: Joi.string().valid("ADMIN", "AGENT", "CUSTOMER").default("CUSTOMER"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New password must be at least 6 characters long",
    "any.required": "New password is required",
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  address: Joi.string().max(200).optional().allow(""),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "New password must be at least 6 characters long",
    "any.required": "New password is required",
  }),
});

export const parcelSchema = Joi.object({
  pickupAddress: Joi.object({
    street: Joi.string().required().messages({
      "any.required": "Pickup street address is required",
    }),
    city: Joi.string().required().messages({
      "any.required": "Pickup city is required",
    }),
    state: Joi.string().required().messages({
      "any.required": "Pickup state is required",
    }),
    zipCode: Joi.string().required().messages({
      "any.required": "Pickup zip code is required",
    }),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }).required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required().messages({
      "any.required": "Delivery street address is required",
    }),
    city: Joi.string().required().messages({
      "any.required": "Delivery city is required",
    }),
    state: Joi.string().required().messages({
      "any.required": "Delivery state is required",
    }),
    zipCode: Joi.string().required().messages({
      "any.required": "Delivery zip code is required",
    }),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }).required(),
  parcelSize: Joi.string().valid("SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE").required().messages({
    "any.only": "Parcel size must be one of: SMALL, MEDIUM, LARGE, EXTRA_LARGE",
    "any.required": "Parcel size is required",
  }),
  parcelType: Joi.string().valid("DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS", "CLOTHING", "FOOD", "OTHER").required().messages({
    "any.only": "Parcel type must be one of: DOCUMENT, PACKAGE, FRAGILE, ELECTRONICS, CLOTHING, FOOD, OTHER",
    "any.required": "Parcel type is required",
  }),
  weight: Joi.number().positive().optional().messages({
    "number.positive": "Weight must be a positive number",
  }),
  description: Joi.string().max(500).optional(),
  paymentType: Joi.string().valid("PREPAID", "COD").required().messages({
    "any.only": "Payment type must be PREPAID or COD",
    "any.required": "Payment type is required",
  }),
  codAmount: Joi.number()
    .positive()
    .when("paymentType", {
      is: "COD",
      then: Joi.required().messages({
        "any.required": "COD amount is required when payment type is COD",
      }),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.positive": "COD amount must be a positive number",
    }),
  pickupDate: Joi.date().min("now").optional().messages({
    "date.min": "Pickup date cannot be in the past",
  }),
});

// Additional schemas you might need
export const statusUpdateSchema = Joi.object({
  status: Joi.string().valid("PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED").required(),
  notes: Joi.string().max(500).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

export const assignAgentSchema = Joi.object({
  agentId: Joi.string().required().messages({
    "any.required": "Agent ID is required",
  }),
});
