import { z } from "zod";

export const requestSchema = z.object({
  category: z.enum([
    "education",
    "food_and_essentials",
    "medical_assistance",
    "shelter_and_support",
    "community_support"
  ], { required_error: "Assistance category is required" }),
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().min(10, "Please describe the problem in at least 10 characters").max(2000),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  pin_code: z.string().max(10).optional(),
  urgency: z.enum(["standard", "urgent", "critical_emergency"]).default("standard"),
  assistance_type: z.string().min(2, "Specific assistance type is required"),
  preferred_contact_method: z.string().default("phone"),
  phone: z.string().min(7, "Valid contact telephone number is required"),
  helper_id: z.string().optional(),
  proxy_consent: z.boolean().optional(),
  consent_given: z.union([z.boolean(), z.string()]).refine(val => val === true || val === "true", {
    message: "Consent to assist and share relevant details with providers is required"
  })
});

export const contactAttemptSchema = z.object({
  provider_id: z.string().min(1, "Provider ID is required"),
  outcome: z.enum([
    "connected",
    "no_answer",
    "number_unavailable",
    "provider_cannot_help",
    "asked_to_call_later",
    "help_promised",
    "other"
  ], { required_error: "Valid contact outcome is required" }),
  notes: z.string().max(500).optional()
});

export const offerSchema = z.object({
  message: z.string().min(5, "Offer message must be at least 5 characters").max(500),
  helper_name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: err.errors[0]?.message || "Validation failed",
            details: err.errors
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Malformed request payload" }
      });
    }
  };
}
