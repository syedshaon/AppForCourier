import Joi from "joi";
import { validationErrorResponse } from "../utils/response.js";

// Address validation schema
const addressSchema = Joi.object({
  street: Joi.string().required().min(5).max(200),
  city: Joi.string().required().min(2).max(50),
  state: Joi.string().required().min(2).max(50),
  zipCode: Joi.string()
    .required()
    .pattern(/^\d{4,6}$/),
  country: Joi.string().optional().default("Bangladesh"),
  latitude: Joi.number().optional().min(-90).max(90),
  longitude: Joi.number().optional().min(-180).max(180),
});

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
    phoneNumber: Joi.string()
      .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid phone number for pickup address",
        "any.required": "Pickup phone number is required",
      }),
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
    phoneNumber: Joi.string()
      .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid phone number for pickup address",
        "any.required": "Pickup phone number is required",
      }),
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

  notes: Joi.string().max(500).optional().allow("").empty(""),

  latitude: Joi.number().min(-90).max(90).optional().allow(null).empty(""),
  longitude: Joi.number().min(-180).max(180).optional().allow(null).empty(""),
});

export const assignAgentSchema = Joi.object({
  agentId: Joi.string().required().messages({
    "any.required": "Agent ID is required",
  }),
});

// Parcel creation validation schema
// export const parcelSchema = Joi.object({
//   pickupAddress: addressSchema.required(),
//   deliveryAddress: addressSchema.required(),
//   parcelSize: Joi.string().valid("SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE").required(),
//   parcelType: Joi.string().valid("DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS", "CLOTHING", "FOOD", "OTHER").required(),
//   weight: Joi.number().optional().min(0.1).max(50), // Max 50kg
//   description: Joi.string().optional().max(500),
//   paymentType: Joi.string().valid("PREPAID", "COD").required(),
//   codAmount: Joi.when("paymentType", {
//     is: "COD",
//     then: Joi.number().required().min(1),
//     otherwise: Joi.number().optional().allow(null),
//   }),
//   pickupDate: Joi.date().optional().min("now"),
// });

// Status update validation schema
// export const statusUpdateSchema = Joi.object({
//   status: Joi.string().valid("PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED").required(),
//   notes: Joi.string().optional().max(500),
//   latitude: Joi.number().optional().min(-90).max(90),
//   longitude: Joi.number().optional().min(-180).max(180),
// });

// Agent assignment validation schema
export const agentAssignSchema = Joi.object({
  agentId: Joi.string().required().length(25), // Prisma cuid length
});

// Search query validation schema
export const searchSchema = Joi.object({
  q: Joi.string().optional().min(1).max(100),
  status: Joi.string().valid("PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED").optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional().min(Joi.ref("dateFrom")),
  page: Joi.number().optional().min(1).default(1),
  limit: Joi.number().optional().min(1).max(100).default(10),
});

// Validation middleware function
// export const validate = (schema) => {
//   return (req, res, next) => {
//     const { error, value } = schema.validate(req.body, {
//       abortEarly: false, // Return all validation errors
//       stripUnknown: true, // Remove unknown fields
//     });

//     if (error) {
//       const errors = error.details.map((detail) => ({
//         field: detail.path.join("."),
//         message: detail.message,
//       }));

//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors,
//       });
//     }

//     // Replace req.body with validated and sanitized data
//     req.body = value;
//     next();
//   };
// };

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Query validation error",
        errors,
      });
    }

    req.query = value;
    next();
  };
};

// Exported validation middlewares
export const validateParcel = validate(parcelSchema);
export const validateStatusUpdate = validate(statusUpdateSchema);
export const validateAgentAssign = validate(agentAssignSchema);
export const validateSearch = validateQuery(searchSchema);

// Custom validation for tracking number
export const validateTrackingNumber = (req, res, next) => {
  const { trackingNumber } = req.params;

  const trackingSchema = Joi.string()
    .pattern(/^CMS\d{14}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid tracking number format",
    });

  const { error } = trackingSchema.validate(trackingNumber);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};

// Custom validation for parcel ID (Prisma cuid)
export const validateParcelId = (req, res, next) => {
  const { id } = req.params;

  const idSchema = Joi.string().length(25).required().messages({
    "string.length": "Invalid parcel ID format",
  });

  const { error } = idSchema.validate(id);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid parcel ID",
    });
  }

  next();
};

// Validate coordinates for location tracking
export const validateCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.body;

  if ((latitude && !longitude) || (!latitude && longitude)) {
    return res.status(400).json({
      success: false,
      message: "Both latitude and longitude are required for location tracking",
    });
  }

  if (latitude && longitude) {
    const coordSchema = Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    });

    const { error } = coordSchema.validate({ latitude, longitude });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates provided",
        errors: error.details.map((d) => d.message),
      });
    }
  }

  next();
};

// Validate payment details
export const validatePayment = (req, res, next) => {
  const { paymentType, codAmount } = req.body;

  if (paymentType === "COD") {
    if (!codAmount || codAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "COD amount is required and must be greater than 0 for COD payments",
      });
    }

    if (codAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: "COD amount cannot exceed 100,000 BDT",
      });
    }
  }

  next();
};

// Validate date ranges
export const validateDateRange = (req, res, next) => {
  const { dateFrom, dateTo } = req.query;

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from > to) {
      return res.status(400).json({
        success: false,
        message: "dateFrom cannot be later than dateTo",
      });
    }

    // Don't allow date ranges more than 1 year
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (to - from > oneYear) {
      return res.status(400).json({
        success: false,
        message: "Date range cannot exceed 1 year",
      });
    }
  }

  next();
};

// Add to your existing validation schemas
// export const updateRoleSchema = Joi.object({
//   role: Joi.string().valid("ADMIN", "AGENT", "CUSTOMER").required().messages({
//     "any.only": "Role must be one of ADMIN, AGENT, or CUSTOMER",
//     "any.required": "Role is required",
//   }),
// });

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "AGENT").required().messages({
    "any.only": "Role must be one of  AGENT, or CUSTOMER",
    "any.required": "Role is required",
  }),
});
