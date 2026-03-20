// TournamentRegistration — root component.
//
// Owns all form state and step navigation.
// Renders child components based on the current step and submission status.
//
// Step flow:
//   Step 1  →  RegistrationForm (personal info, events, waiver)
//   Step 2  →  PaymentForm (Stripe card payment)
//   Done    →  SuccessScreen (confirmation)

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';

import FontLoader from './FontLoader';
import StepIndicator from './StepIndicator';
import RegistrationForm from './RegistrationForm';
import PaymentForm from './PaymentForm';
import SuccessScreen from './SuccessScreen';
import { Card, CardHeader, ErrorBanner } from './primitives';
import { stripePromise, INITIAL_FORM_DATA, calculateTotal } from './constants';

export default function TournamentRegistration() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Single handler for all inputs — works for text, selects, and checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectedEventsCount = [formData.poomsae, formData.boardBreaking, formData.sparring].filter(Boolean).length;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedEventsCount === 0) {
      setError('Please select at least one event to continue.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = () => {
    setSubmitted(true);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentError = (msg) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setSubmitted(false);
    setError(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <FontLoader />
      <div style={{ minHeight: '100vh', background: '#F3F4F6', padding: '28px 16px 80px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              Martial Arts Tournament
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280' }}>
              2026 Season · Athlete Registration
            </p>
          </div>

          {!submitted && <StepIndicator currentStep={currentStep} />}

          <ErrorBanner message={error} />

          {/* ── Success ── */}
          {submitted && (
            <SuccessScreen formData={formData} onReset={handleReset} />
          )}

          {/* ── Step 1: Registration form ── */}
          {!submitted && currentStep === 1 && (
            <RegistrationForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleFormSubmit}
              selectedEventsCount={selectedEventsCount}
            />
          )}

          {/* ── Step 2: Payment ── */}
          {!submitted && currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Registration summary with edit button */}
              <Card>
                <CardHeader
                  title="Registration Summary"
                  action={
                    <button onClick={() => setCurrentStep(1)} className="btn-secondary">← Edit</button>
                  }
                />
                {[
                  ['Name', `${formData.firstName} ${formData.lastName}`],
                  ['Email', formData.email],
                  ['Belt rank', formData.beltRank],
                  ['School', formData.schoolName === 'Other' ? formData.customSchoolName : formData.schoolName],
                  ['Events', `${selectedEventsCount} event${selectedEventsCount !== 1 ? 's' : ''}`],
                ].map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6', fontSize: 15 }}>
                    <span style={{ color: '#6B7280' }}>{key}</span>
                    <span style={{ fontWeight: 500, color: '#111827', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </Card>

              {/* Stripe Elements wraps PaymentForm so it has access to useStripe/useElements */}
              <Elements stripe={stripePromise}>
                <PaymentForm
                  formData={formData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
