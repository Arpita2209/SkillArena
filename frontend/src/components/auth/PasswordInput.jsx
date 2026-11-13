import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ label, id, error, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="sa-field">
      <label htmlFor={id}>{label}</label>
      <div className="sa-password-wrap">
        <input id={id} type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
        <button type="button" className="sa-visibility" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="sa-field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
