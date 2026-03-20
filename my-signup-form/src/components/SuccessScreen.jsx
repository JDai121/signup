// SuccessScreen — shown after a successful payment.
// Displays a confirmation summary and a button to register another athlete.

import { Card, Divider } from './primitives';
import { calculateTotal } from './constants';

export default function SuccessScreen({ formData, onReset }) {
  const selectedEventsCount = [formData.poomsae, formData.boardBreaking, formData.sparring].filter(Boolean).length;
  const total = calculateTotal(selectedEventsCount);

  const summaryRows = [
    ['Competitor', `${formData.firstName} ${formData.lastName}`],
    ['Events', `${selectedEventsCount} event${selectedEventsCount !== 1 ? 's' : ''}`],
    ['Amount charged', `$${total}.00`],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card>
        {/* Green checkmark header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3.5 11L8.5 16L18.5 5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Registration Complete!</h2>
          <p style={{ fontSize: 15, color: '#6B7280' }}>
            Confirmation sent to <strong>{formData.email}</strong>
          </p>
        </div>

        <Divider />

        {/* Summary rows */}
        <div style={{ paddingTop: 12 }}>
          {summaryRows.map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>{key}</span>
              <span style={{ fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
      </Card>

      <button onClick={onReset} className="btn-ghost">Register Another Athlete</button>
    </div>
  );
}
