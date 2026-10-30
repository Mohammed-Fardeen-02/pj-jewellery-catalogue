/**
 * Features / Auth Module Entrypoint
 * Controlled public API for the Authentication feature.
 */

// API
export { authApi } from "./api/auth.api";

// Context & Provider
export { AuthContext, AuthProvider } from "./context/AuthContext";
export type { AuthContextValue } from "./context/AuthContext";

// Hooks
export { useAuth } from "./hooks/useAuth";

// Components
export { LoginForm } from "./components/LoginForm";
export type { LoginFormProps } from "./components/LoginForm";
export { AuthGuard } from "./components/AuthGuard";
export type { AuthGuardProps } from "./components/AuthGuard";
export { LogoutButton } from "./components/LogoutButton";
export type { LogoutButtonProps } from "./components/LogoutButton";

// Pages
export { LoginPage } from "./pages/LoginPage";

// Schemas & Types
export { loginSchema } from "./schemas/auth.schema";
export type { LoginFormData } from "./schemas/auth.schema";
export type { UserProfile, AuthTokens, AuthState } from "./types/auth.types";
