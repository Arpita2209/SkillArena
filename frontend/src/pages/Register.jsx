import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import PasswordInput from '../components/auth/PasswordInput';
import { passwordStrength, validateRegister } from '../utils/authValidation';
import { mockRegister } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);
  const update = (key, value) => { setForm((prev) => ({ ...prev, [key]: value })); setErrors((prev) => ({ ...prev, [key]: undefined })); setStatus(null); };
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    setStatus(null);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try { const result = await mockRegister(); setStatus({ type: 'success', text: result.message }); }
    catch (error) { setStatus({ type: 'error', text: error.message }); }
    finally { setLoading(false); }
  }
  return (
    <AuthLayout eyebrow="GET STARTED" title="Create your account" subtitle="Start building confidence for your next opportunity.">
      <form onSubmit={submit} noValidate className="sa-auth-form">
        <AuthInput id="register-name" label="Full name" type="text" placeholder="Your full name" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} required />
        <AuthInput id="register-email" label="Email address" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} required />
        <PasswordInput id="register-password" label="Password" placeholder="Create a strong password" autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password} required />
        {form.password && <div className="sa-strength" aria-label={`Password strength: ${strength.label}`}><div className="sa-strength-bars">{[1,2,3,4].map((step) => <span key={step} className={step <= strength.score ? 'active' : ''} />)}</div><span>{strength.label}</span></div>}
        <PasswordInput id="register-confirm" label="Confirm password" placeholder="Repeat your password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} error={errors.confirmPassword} required />
        {status && <div className={`sa-status sa-status-${status.type}`} role="status">{status.text}</div>}
        <button className="sa-submit" disabled={loading} type="submit">{loading ? 'Validating form…' : 'Create account'} {!loading && <ArrowRight size={18} />}</button>
      </form>
      <p className="sa-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
