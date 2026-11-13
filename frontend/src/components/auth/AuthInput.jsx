export default function AuthInput({ label, id, error, ...props }) {
  return (
    <div className="sa-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p className="sa-field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
