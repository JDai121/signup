// ── Primitive UI building blocks ─────────────────────────────────────────────
// These are small, stateless components used throughout the registration form.

export function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', marginBottom: 6, fontSize: 15, fontWeight: 500, color: '#374151' }}>
      {children}
      {required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
    </label>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '24px', ...style }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #E5E7EB' }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{title}</h2>
      {action}
    </div>
  );
}

export function FormRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

export function Field({ label, required, children, flex = 1, minWidth = 140 }) {
  return (
    <div style={{ flex, minWidth }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function MMInput(props) {
  return <input className="mm-input" {...props} />;
}

export function MMSelect({ children, ...props }) {
  return (
    <div className="mm-select-wrap">
      <select className="mm-input" style={{ paddingRight: 32, cursor: 'pointer' }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 15, color: '#DC2626' }}>
      <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 5V8M7.5 10.5H7.51M13.5 7.5C13.5 10.8137 10.8137 13.5 7.5 13.5C4.18629 13.5 1.5 10.8137 1.5 7.5C1.5 4.18629 4.18629 1.5 7.5 1.5C10.8137 1.5 13.5 4.18629 13.5 7.5Z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {message}
    </div>
  );
}
