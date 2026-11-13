export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return { score, label: ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    errors.password = 'Use 8+ characters with upper/lowercase, a number, and a symbol.';
  }
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}
