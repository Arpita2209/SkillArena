// Frontend-only development mock. No user accounts or tokens are created.
// Replace these functions with Axios requests once backend contracts are agreed.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockLogin({ email, password }) {
  await delay(650);
  if (email.trim().toLowerCase() === 'demo@skillarena.dev' && password === 'Demo@12345') {
    return { message: 'Demo credentials accepted. This is not a real login.' };
  }
  throw new Error('Demo mode: use demo@skillarena.dev / Demo@12345. No real accounts exist yet.');
}

export async function mockRegister() {
  await delay(650);
  return { message: 'Form validated. Registration is not available until the backend API is ready.' };
}
