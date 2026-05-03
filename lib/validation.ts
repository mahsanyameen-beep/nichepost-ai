export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface FieldError {
  field: string;
  message: string;
}

export function validateEmail(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return "Email is required.";
  if (value.length > 254) return "Email is too long.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value: unknown): string | null {
  if (typeof value !== "string" || !value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 128) return "Password must be 128 characters or fewer.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Password must include both letters and numbers.";
  }
  return null;
}

export function validateName(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return "Name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  if (value.trim().length > 60) return "Name must be 60 characters or fewer.";
  return null;
}

export function validateBio(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return "Bio must be a string.";
  if (value.length > 280) return "Bio must be 280 characters or fewer.";
  return null;
}

export function validateSignupPayload(body: unknown): {
  ok: boolean;
  errors: FieldError[];
  value?: { name: string; email: string; password: string };
} {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: [{ field: "_", message: "Body must be JSON." }] };
  }
  const { name, email, password } = body as Record<string, unknown>;
  const errors: FieldError[] = [];
  const nameErr = validateName(name);
  const emailErr = validateEmail(email);
  const pwErr = validatePassword(password);
  if (nameErr) errors.push({ field: "name", message: nameErr });
  if (emailErr) errors.push({ field: "email", message: emailErr });
  if (pwErr) errors.push({ field: "password", message: pwErr });
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    value: {
      name: (name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      password: password as string,
    },
  };
}

export function validateLoginPayload(body: unknown): {
  ok: boolean;
  errors: FieldError[];
  value?: { email: string; password: string; remember: boolean };
} {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: [{ field: "_", message: "Body must be JSON." }] };
  }
  const { email, password, remember } = body as Record<string, unknown>;
  const errors: FieldError[] = [];
  const emailErr = validateEmail(email);
  if (emailErr) errors.push({ field: "email", message: emailErr });
  if (typeof password !== "string" || !password) {
    errors.push({ field: "password", message: "Password is required." });
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    value: {
      email: (email as string).trim().toLowerCase(),
      password: password as string,
      remember: remember === true,
    },
  };
}

export function validateProfilePayload(body: unknown): {
  ok: boolean;
  errors: FieldError[];
  value?: { name: string; bio: string; avatarColor?: string };
} {
  if (!body || typeof body !== "object") {
    return { ok: false, errors: [{ field: "_", message: "Body must be JSON." }] };
  }
  const { name, bio, avatarColor } = body as Record<string, unknown>;
  const errors: FieldError[] = [];
  const nameErr = validateName(name);
  if (nameErr) errors.push({ field: "name", message: nameErr });
  const bioErr = validateBio(bio);
  if (bioErr) errors.push({ field: "bio", message: bioErr });
  if (avatarColor != null && typeof avatarColor !== "string") {
    errors.push({ field: "avatarColor", message: "avatarColor must be a string." });
  }
  if (avatarColor != null && typeof avatarColor === "string" && !/^#[0-9A-Fa-f]{6}$/.test(avatarColor)) {
    errors.push({ field: "avatarColor", message: "avatarColor must be a hex color." });
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    value: {
      name: (name as string).trim(),
      bio: typeof bio === "string" ? bio.trim() : "",
      avatarColor: typeof avatarColor === "string" ? avatarColor : undefined,
    },
  };
}
