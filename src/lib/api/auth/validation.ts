export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateSignupData(email: string, password: string, fullName: string): string | null {
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  if (!validatePassword(password)) {
    return 'Password must be at least 6 characters long';
  }
  
  if (!fullName.trim()) {
    return 'Please enter your full name';
  }
  
  return null;
}