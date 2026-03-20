// EventCard — a styled checkbox used to select tournament events (Poomsae, Sparring, etc.)
// Hides the native checkbox and renders a fully custom card with visual feedback.

export default function EventCard({ name, checked, onChange, title, desc, badge }) {
  return (
    <label style={{ display: 'block' }}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="event-card-input"
      />
      <div className="event-card-surface">
        {/* Custom checkbox box */}
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `1.5px solid ${checked ? '#2563EB' : '#D1D5DB'}`,
          background: checked ? '#2563EB' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 150ms',
        }}>
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Event title and description */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: '#111827', fontSize: 15 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{desc}</div>
        </div>

        {/* Pricing badge */}
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
            background: checked ? '#DBEAFE' : '#F3F4F6',
            color: checked ? '#1D4ED8' : '#6B7280',
            flexShrink: 0, transition: 'all 150ms',
          }}>
            {badge}
          </span>
        )}
      </div>
    </label>
  );
}
