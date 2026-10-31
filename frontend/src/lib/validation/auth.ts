/**
 * Legacy validation module re-exporting from features/auth for backward compatibility.
 * Features own their validation schemas: see @/features/auth/schemas/auth.schema.
 */
export { loginSchema, type LoginFormData } from "@/features/auth/schemas/auth.schema";
