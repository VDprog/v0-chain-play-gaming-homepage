// Username validation rules for ChainPlay
// These rules are enforced on both frontend and backend

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

// Rules displayed to users in the UI
export const USERNAME_RULES = [
  `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters`,
  "Letters, numbers, and underscores only",
  "Case-insensitive (e.g., 'Player' and 'player' are the same)",
]

export interface UsernameValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Validates a username against ChainPlay rules:
 * - Only letters (a-z, A-Z), digits (0-9), and underscore (_) allowed
 * - Must be between 3 and 20 characters
 * - Cannot be empty
 */
export function validateUsername(username: string): UsernameValidationResult {
  // Check if empty
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: "Username is required",
    }
  }

  const trimmed = username.trim()

  // Check minimum length
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
    }
  }

  // Check maximum length
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or less`,
    }
  }

  // Check allowed characters
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, and underscores",
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

/**
 * Normalizes a username for case-insensitive comparison
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}
