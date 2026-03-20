// StepIndicator — shows a "1 Registration → 2 Payment" progress bar.
// Completed steps show a checkmark; the active step is highlighted in blue.

const STEPS = [
  { n: 1, label: 'Registration' },
  { n: 2, label: 'Payment' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
      {STEPS.map((step, i) => {
        const done = currentStep > step.n;
        const active = currentStep === step.n;

        return (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {/* Circle: checkmark if done, number if not */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (active || done) ? '#2563EB' : '#E5E7EB',
                color: (active || done) ? '#fff' : '#6B7280',
                fontSize: 12, fontWeight: 600, transition: 'all 200ms',
              }}>
                {done
                  ? (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                  : step.n
                }
              </div>

              {/* Step label */}
              <span style={{ fontSize: 13, fontWeight: 500, color: (active || done) ? '#111827' : '#9CA3AF' }}>
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 40, height: 2,
                background: done ? '#2563EB' : '#E5E7EB',
                margin: '0 10px', borderRadius: 2,
                transition: 'background 300ms',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
