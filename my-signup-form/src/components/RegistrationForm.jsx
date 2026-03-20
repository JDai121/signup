// RegistrationForm — Step 1 of the tournament registration.
// Collects personal info, address, martial arts profile, events, and waiver.
// All field state lives in the parent; this component is purely presentational.

import { Card, CardHeader, FormRow, Field, MMInput, MMSelect } from './primitives';
import EventCard from './EventCard';
import { BELT_OPTIONS, SCHOOL_OPTIONS, calculateTotal } from './constants';

export default function RegistrationForm({ formData, onChange, onSubmit, selectedEventsCount }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Personal Information ── */}
      <Card>
        <CardHeader title="Personal Information" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormRow>
            <Field label="First name" required flex={1} minWidth={120}>
              <MMInput type="text" name="firstName" value={formData.firstName} onChange={onChange} required placeholder="Jane" autoComplete="given-name" />
            </Field>
            <Field label="Last name" required flex={1} minWidth={120}>
              <MMInput type="text" name="lastName" value={formData.lastName} onChange={onChange} required placeholder="Doe" autoComplete="family-name" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Email" required flex={2} minWidth={180}>
              <MMInput type="email" name="email" value={formData.email} onChange={onChange} required placeholder="jane@example.com" autoComplete="email" />
            </Field>
            <Field label="Phone" required flex={1} minWidth={130}>
              <MMInput type="tel" name="phone" value={formData.phone} onChange={onChange} required placeholder="(555) 000-0000" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Date of birth" required flex={1} minWidth={140}>
              <MMInput type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange} required autoComplete="bday" />
            </Field>
            <Field label="Gender" required flex={1} minWidth={120}>
              <MMSelect name="gender" value={formData.gender} onChange={onChange} required>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </MMSelect>
            </Field>
          </FormRow>
        </div>
      </Card>

      {/* ── Address ── */}
      <Card>
        <CardHeader title="Address" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 15, fontWeight: 500, color: '#374151' }}>
              Street address <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
            </label>
            <MMInput type="text" name="street" value={formData.street} onChange={onChange} required placeholder="123 Dojo Lane" autoComplete="street-address" />
          </div>
          <FormRow>
            <Field label="City" required flex={2} minWidth={120}>
              <MMInput type="text" name="city" value={formData.city} onChange={onChange} required placeholder="Springfield" autoComplete="address-level2" />
            </Field>
            <Field label="State" required flex={1} minWidth={75}>
              <MMInput type="text" name="state" value={formData.state} onChange={onChange} required placeholder="IL" autoComplete="address-level1" />
            </Field>
            <Field label="ZIP" required flex={1} minWidth={85}>
              <MMInput type="text" name="zipCode" value={formData.zipCode} onChange={onChange} required placeholder="62701" autoComplete="postal-code" />
            </Field>
          </FormRow>
        </div>
      </Card>

      {/* ── Martial Arts Profile ── */}
      <Card>
        <CardHeader title="Martial Arts Profile" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormRow>
            <Field label="Belt rank" required flex={1} minWidth={150}>
              <MMSelect name="beltRank" value={formData.beltRank} onChange={onChange} required>
                <option value="">Select belt rank</option>
                {BELT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </MMSelect>
            </Field>
            <Field label="Weight (lbs)" required flex={1} minWidth={100}>
              <MMInput type="number" name="weight" value={formData.weight} onChange={onChange} required min="1" placeholder="150" />
            </Field>
          </FormRow>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 15, fontWeight: 500, color: '#374151' }}>
              School <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
            </label>
            <MMSelect name="schoolName" value={formData.schoolName} onChange={onChange} required>
              <option value="">Select your school</option>
              {SCHOOL_OPTIONS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="Other">Other (specify below)</option>
            </MMSelect>
          </div>
          {formData.schoolName === 'Other' && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 15, fontWeight: 500, color: '#374151' }}>
                School name <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
              </label>
              <MMInput
                type="text"
                name="customSchoolName"
                value={formData.customSchoolName || ''}
                onChange={onChange}
                required
                placeholder="Enter your school name"
              />
            </div>
          )}
        </div>
      </Card>

      {/* ── Event Selection ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Select Events</h2>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', background: '#F3F4F6', padding: '3px 9px', borderRadius: 20 }}>
            1–2 events $100 · 3 events $125
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EventCard name="poomsae" checked={formData.poomsae} onChange={onChange} title="Poomsae" desc="Traditional forms competition" />
          <EventCard name="boardBreaking" checked={formData.boardBreaking} onChange={onChange} title="Board Breaking" desc="Power & speed breaking" />
          <EventCard
            name="sparring"
            checked={formData.sparring}
            onChange={onChange}
            title="Sparring"
            desc="Olympic & point sparring"
            badge={selectedEventsCount >= 3 && formData.sparring ? '+$25' : null}
          />
        </div>

        {/* Running total */}
        {selectedEventsCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '11px 13px', background: '#EFF6FF', borderRadius: 6, border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1D4ED8' }}>
              {selectedEventsCount} event{selectedEventsCount !== 1 ? 's' : ''} selected
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>${calculateTotal(selectedEventsCount)}.00</span>
          </div>
        )}
      </Card>

      {/* ── Waiver ── */}
      <Card>
        <CardHeader title="Waiver of Liability" />
        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#6B7280', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
          I acknowledge that martial arts competition involves physical contact and inherent risks.
          I waive all claims against the tournament organizers, venue, officials, and staff for any
          injuries or damages that may occur. I confirm that I am adequately insured and physically
          prepared to compete. I understand that no refunds will be issued under any circumstances.
          I consent to the use of photographs and videos taken during the event for promotional purposes.
        </div>
        <div>
          <input type="checkbox" id="waiver" name="agreedToWaiver" checked={formData.agreedToWaiver} onChange={onChange} required className="waiver-input" />
          <label htmlFor="waiver" className="waiver-label-wrap">
            <div className="waiver-box">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, color: '#374151', lineHeight: 1.5 }}>
              I have read and agree to the waiver of liability <span style={{ color: '#EF4444' }}>*</span>
            </span>
          </label>
        </div>
      </Card>

      <button type="submit" className="btn-primary">Continue to Payment →</button>
    </form>
  );
}