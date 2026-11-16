
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import { validateLogin } from "../utils/authValidation";
import { loginUser, getApiError } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setStatus(null);
  };

  async function submit(event) {
    event.preventDefault();

    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length) return;

    setLoading(true);

    try {
      const result = await loginUser(form);
      saveSession(result);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus({
        type: "error",
        text: getApiError(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to SkillArena"
      subtitle="Continue your interview preparation journey."
    >
      <form onSubmit={submit} noValidate className="sa-auth-form">
        <AuthInput
          id="login-email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          required
        />

        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          required
        />

        {status && (
          <div className={`sa-status sa-status-${status.type}`} role="alert">
            {status.text}
          </div>
        )}

        <button className="sa-submit" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign in"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="sa-auth-switch">
        New to SkillArena? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
