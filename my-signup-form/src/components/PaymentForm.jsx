import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardHeader, FieldLabel } from './primitives';
import { CARD_ELEMENT_OPTIONS, API_BASE, calculateTotal } from './constants';

// PaymentForm — handles the Stripe payment flow.
//
// Flow:
//   1. POST to /api/create-payment-intent/ → receive clientSecret
//   2. stripe.confirmCardPayment(clientSecret) → Stripe charges the card
//   3. POST to /api/confirm-payment/ → backend saves the registration
//
// Props:
//   formData   — full form state from the parent
//   onSuccess  — called with the server result on successful payment
//   onError    — called with an error message string on failure

export default function PaymentForm({ formData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const eventsCount = [formData.poomsae, formData.boardBreaking, formData.sparring].filter(Boolean).length;
  const totalAmount = calculateTotal(eventsCount);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      // Map camelCase form fields → snake_case for Django
      const backendData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        belt_rank: formData.beltRank,
        weight: parseInt(formData.weight),
        school_name: formData.schoolName === 'Other' ? formData.customSchoolName : formData.schoolName,
        poomsae: formData.poomsae,
        board_breaking: formData.boardBreaking,
        sparring: formData.sparring,
        agreed_to_waiver: formData.agreedToWaiver,
      };

      // Step 1: Create a PaymentIntent on the backend
      const intentResponse = await fetch(`${API_BASE}/create-payment-intent/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      const { clientSecret } = await intentResponse.json();

      // Step 2: Confirm the card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.street,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
            },
          },
        },
      });

      if (error) throw new Error(error.message);

      // Step 3: Tell the backend the payment succeeded → save the registration
      const confirmResponse = await fetch(`${API_BASE}/confirm-payment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          registration_data: backendData,
        }),
      });
      const result = await confirmResponse.json();

      if (result.success) onSuccess(result);
      else throw new Error(result.error || 'Registration failed');

    } catch (err) {
      console.error('Payment error:', err);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Order summary breakdown */}
      <Card>
        <CardHeader title="Order Summary" />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F3F4F6', fontSize: 14 }}>
            <span style={{ color: '#6B7280' }}>Registration ({eventsCount} event{eventsCount !== 1 ? 's' : ''})</span>
            <span style={{ fontWeight: 500 }}>${totalAmount}.00</span>
          </div>

          {/* Show line-item breakdown when all 3 events selected */}
          {eventsCount === 3 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280' }}>
                <span>Base fee (2 events)</span><span>$100.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280' }}>
                <span>Additional event</span><span>$25.00</span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0 0', fontSize: 15, fontWeight: 700 }}>
            <span>Total due</span>
            <span style={{ color: '#2563EB' }}>${totalAmount}.00</span>
          </div>
        </div>
      </Card>

      {/* Stripe card input */}
      <Card>
        <CardHeader title="Payment Details" />
        <div>
          <FieldLabel required>Card information</FieldLabel>
          <div style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#fff' }}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M3 6V4.5a3 3 0 016 0V6M2 6h8a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Secured by Stripe · Card data is encrypted and never stored.
          </p>
        </div>
      </Card>

      <button type="submit" className="btn-primary" disabled={processing || !stripe}>
        {processing ? 'Processing…' : `Pay $${totalAmount}.00`}
      </button>
    </form>
  );
}
