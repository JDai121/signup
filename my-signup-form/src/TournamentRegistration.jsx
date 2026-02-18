import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('pk_test_51T1E7DRzcIO6rKBYS182mq9MTVErggM56M3mps6ELP3vAJoM0PRqaNbA2Bg0AMhoxrmBKRiUzxdUpDvq1mJGxjCv00DRpGM0sL');

// Card styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

function PaymentForm({ formData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const calculateTotal = () => {
    const eventsCount = [
      formData.poomsae,
      formData.boardBreaking,
      formData.sparring
    ].filter(Boolean).length;

    if (eventsCount === 0) return 0;
    if (eventsCount <= 2) return 100;
    return 125; // 3 events
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Prepare data for backend
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
        agreed_to_waiver: formData.agreedToWaiver
      };

      // Step 1: Create Payment Intent
      const intentResponse = await fetch('http://localhost:8000/api/create-payment-intent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      });

      const { clientSecret, amount } = await intentResponse.json();

      // Step 2: Confirm payment with Stripe
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

      if (error) {
        throw new Error(error.message);
      }

      // Step 3: Confirm payment and save registration
      const confirmResponse = await fetch('http://localhost:8000/api/confirm-payment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          registration_data: backendData
        })
      });

      const result = await confirmResponse.json();

      if (result.success) {
        onSuccess(result);
      } else {
        throw new Error(result.error || 'Registration failed');
      }

    } catch (err) {
      console.error('Payment error:', err);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = calculateTotal();
  const eventsCount = [
    formData.poomsae,
    formData.boardBreaking,
    formData.sparring
  ].filter(Boolean).length;

  return (
    <form onSubmit={handlePayment}>
      {/* Payment Summary */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>PAYMENT INFORMATION</h2>
        
        <div style={styles.pricingSummary}>
          <div style={styles.pricingRow}>
            <span>Registration Fee ({eventsCount} event{eventsCount !== 1 ? 's' : ''}):</span>
            <span style={styles.priceAmount}>${totalAmount}.00</span>
          </div>
          {eventsCount === 3 && (
            <div style={styles.pricingDetail}>
              <small>Base fee (2 events): $100.00</small><br />
              <small>Additional event: $25.00</small>
            </div>
          )}
          <div style={styles.totalRow}>
            <span><strong>TOTAL:</strong></span>
            <span style={styles.totalAmount}><strong>${totalAmount}.00</strong></span>
          </div>
        </div>

        {/* Credit Card Form */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Credit Card Information <span style={styles.required}>*</span>
          </label>
          <div style={styles.cardElement}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p style={styles.secureNote}>
            🔒 Secure payment powered by Stripe. Your card information is encrypted.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        style={{
          ...styles.submitBtn,
          opacity: processing || !stripe ? 0.6 : 1,
          cursor: processing || !stripe ? 'not-allowed' : 'pointer'
        }}
        disabled={processing || !stripe}
      >
        {processing ? 'Processing Payment...' : `Pay $${totalAmount} & Complete Registration`}
      </button>
    </form>
  );
}

export default function TournamentRegistration() {
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Martial Arts Info
    beltRank: '',
    weight: '',
    schoolName: '',
    customSchoolName: '',
    
    // Events (checkboxes)
    poomsae: false,
    boardBreaking: false,
    sparring: false,
    
    // Signature
    agreedToWaiver: false
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Payment
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate at least one event is selected
    const eventsSelected = [
      formData.poomsae,
      formData.boardBreaking,
      formData.sparring
    ].filter(Boolean).length;

    if (eventsSelected === 0) {
      setError('Please select at least one event');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError(null);
    setCurrentStep(2); // Move to payment step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (result) => {
    setSubmitted(true);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedEventsCount = [
    formData.poomsae,
    formData.boardBreaking,
    formData.sparring
  ].filter(Boolean).length;

  const calculateTotal = () => {
    if (selectedEventsCount === 0) return 0;
    if (selectedEventsCount <= 2) return 100;
    return 125;
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>ATHLETE REGISTRATION</h1>
          <p style={styles.subtitle}>Martial Arts Tournament 2026</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div style={styles.successMessage}>
            <h2 style={{margin: '0 0 15px 0', fontSize: '22px', color: '#155724'}}>
              ✓ Payment Successful! Registration Complete!
            </h2>
            <div style={styles.submittedData}>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Events:</strong> {selectedEventsCount} selected</p>
              <p><strong>Amount Paid:</strong> ${calculateTotal()}.00</p>
              <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#c3e6cb', borderRadius: '4px'}}>
                <p style={{margin: 0, fontSize: '14px'}}>
                  🎯 Confirmation email sent to {formData.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '18px'}}>❌ Error</h3>
            <p style={{margin: 0}}>{error}</p>
          </div>
        )}

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={currentStep === 1 ? styles.stepActive : styles.stepComplete}>
            <span style={styles.stepNumber}>1</span>
            <span style={styles.stepText}>Registration Info</span>
          </div>
          <div style={styles.stepLine}></div>
          <div style={currentStep === 2 ? styles.stepActive : styles.stepInactive}>
            <span style={styles.stepNumber}>2</span>
            <span style={styles.stepText}>Payment</span>
          </div>
        </div>

        {/* STEP 1: Registration Form */}
        {currentStep === 1 && (
          <form onSubmit={handleFormSubmit}>
            
            {/* COMPETITOR INFORMATION */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>COMPETITOR INFORMATION</h2>
              
              <div style={styles.row}>
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    First Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Last Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Phone <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Email <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Gender <span style={styles.required}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    style={styles.select}
                  >
                    <option value="">- Select -</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Date of Birth <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>ADDRESS</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Street Address <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    City <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.quarterWidth}>
                  <label style={styles.label}>
                    State <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.quarterWidth}>
                  <label style={styles.label}>
                    Zip Code <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* MARTIAL ARTS INFORMATION */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>MARTIAL ARTS INFORMATION</h2>
              
              <div style={styles.row}>
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Belt Rank <span style={styles.required}>*</span>
                  </label>
                  <select
                    name="beltRank"
                    value={formData.beltRank}
                    onChange={handleChange}
                    required
                    style={styles.select}
                  >
                    <option value="">- Select Belt -</option>
                    <option value="white">White Belt</option>
                    <option value="yellow">Yellow Belt</option>
                    <option value="green">Green Belt</option>
                    <option value="blue">Blue Belt</option>
                    <option value="red">Red Belt</option>
                    <option value="black">Black Belt</option>
                    <option value="black-dan2">Black Belt (2nd Dan)</option>
                    <option value="black-dan3">Black Belt (3rd Dan)</option>
                  </select>
                </div>
                
                <div style={styles.halfWidth}>
                  <label style={styles.label}>
                    Weight in Pounds <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    min="1"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Martial Arts School Name <span style={styles.required}>*</span>
                </label>
                <select
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">- Select School -</option>
                  <option value="Dragon Martial Arts Academy">Dragon Martial Arts Academy</option>
                  <option value="Elite Taekwondo Center">Elite Taekwondo Center</option>
                  <option value="Phoenix Martial Arts">Phoenix Martial Arts</option>
                  <option value="Tiger Strike Dojo">Tiger Strike Dojo</option>
                  <option value="Warrior Spirit Academy">Warrior Spirit Academy</option>
                  <option value="Champions Taekwondo">Champions Taekwondo</option>
                  <option value="Black Belt Excellence">Black Belt Excellence</option>
                  <option value="Master Kim's Taekwondo">Master Kim's Taekwondo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.schoolName === 'Other' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Enter School Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="customSchoolName"
                    value={formData.customSchoolName || ''}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="Type your school name"
                  />
                </div>
              )}
            </div>

            {/* EVENT SELECTION */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>SELECT YOUR EVENTS</h2>
              <p style={styles.eventNote}>
                <strong>Pricing:</strong> $100 for 1-2 events | $125 for 3 events
              </p>
              
              <div style={styles.eventGrid}>
                <label style={styles.checkboxCard}>
                  <input
                    type="checkbox"
                    name="poomsae"
                    checked={formData.poomsae}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <div style={styles.checkboxContent}>
                    <div style={styles.eventTitle}>POOMSAE</div>
                    <div style={styles.eventDesc}>Traditional forms competition</div>
                  </div>
                </label>

                <label style={styles.checkboxCard}>
                  <input
                    type="checkbox"
                    name="boardBreaking"
                    checked={formData.boardBreaking}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <div style={styles.checkboxContent}>
                    <div style={styles.eventTitle}>BOARD BREAKING</div>
                    <div style={styles.eventDesc}>Power & speed breaking</div>
                  </div>
                </label>

                <label style={styles.checkboxCard}>
                  <input
                    type="checkbox"
                    name="sparring"
                    checked={formData.sparring}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <div style={styles.checkboxContent}>
                    <div style={styles.eventTitle}>SPARRING</div>
                    <div style={styles.eventDesc}>Olympic & point sparring</div>
                  </div>
                </label>
              </div>

              {selectedEventsCount > 0 && (
                <div style={styles.eventSummary}>
                  <strong>Events Selected:</strong> {selectedEventsCount} | 
                  <strong> Total: ${calculateTotal()}.00</strong>
                </div>
              )}
            </div>

            {/* WAIVER */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>WAIVER OF LIABILITY</h2>
              
              <div style={styles.waiverBox}>
                <p style={styles.waiverText}>
                  I acknowledge that martial arts competition involves physical contact and inherent risks. 
                  I waive all claims against the tournament organizers, venue, officials, and staff for any 
                  injuries or damages that may occur. I confirm that I am adequately insured and physically 
                  prepared to compete. I understand that no refunds will be issued under any circumstances. 
                  I consent to the use of photographs and videos taken during the event for promotional purposes.
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="agreedToWaiver"
                    checked={formData.agreedToWaiver}
                    onChange={handleChange}
                    required
                    style={styles.checkbox}
                  />
                  <span style={styles.waiverAgree}>
                    I have read and agree to the waiver of liability <span style={styles.required}>*</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Continue to Payment Button */}
            <button type="submit" style={styles.submitBtn}>
              Continue to Payment
            </button>
          </form>
        )}

        {/* STEP 2: Payment Form */}
        {currentStep === 2 && (
          <div>
            <div style={styles.reviewSection}>
              <h2 style={styles.sectionTitle}>REVIEW YOUR INFORMATION</h2>
              <div style={styles.reviewGrid}>
                <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Belt Rank:</strong> {formData.beltRank}</div>
                <div><strong>School:</strong> {formData.schoolName === 'Other' ? formData.customSchoolName : formData.schoolName}</div>
                <div><strong>Events:</strong> {selectedEventsCount} selected</div>
              </div>
              <button 
                onClick={() => setCurrentStep(1)} 
                style={styles.backButton}
              >
                ← Edit Information
              </button>
            </div>

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
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  formContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    borderBottom: '3px solid #d32f2f',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: '5px',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    padding: '20px 0',
  },
  stepActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  stepComplete: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  stepInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#999',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid currentColor',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: '16px',
  },
  stepLine: {
    width: '80px',
    height: '2px',
    backgroundColor: '#d32f2f',
    margin: '0 20px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e0e0e0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  halfWidth: {
    flex: '1',
    minWidth: '200px',
  },
  quarterWidth: {
    flex: '0.5',
    minWidth: '100px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px',
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  eventNote: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  checkboxCard: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    backgroundColor: '#fafafa',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#d32f2f',
  },
  checkboxContent: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333',
    marginBottom: '5px',
  },
  eventDesc: {
    fontSize: '13px',
    color: '#666',
  },
  eventSummary: {
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    fontSize: '15px',
    color: '#1565c0',
  },
  waiverBox: {
    padding: '20px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  waiverText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#555',
    margin: 0,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  waiverAgree: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5',
  },
  pricingSummary: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #dee2e6',
  },
  pricingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '15px',
  },
  priceAmount: {
    fontWeight: '500',
  },
  pricingDetail: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '15px',
    paddingLeft: '10px',
    borderLeft: '3px solid #dee2e6',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    marginTop: '15px',
    borderTop: '2px solid #dee2e6',
    fontSize: '18px',
  },
  totalAmount: {
    color: '#d32f2f',
    fontSize: '20px',
  },
  cardElement: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  secureNote: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  backButton: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  reviewSection: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  successMessage: {
    background: '#d4edda',
    color: '#155724',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '2px solid #c3e6cb',
    fontSize: '15px',
  },
  submittedData: {
    marginTop: '15px',
    lineHeight: '1.8',
  },
  errorMessage: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '2px solid #f5c6cb',
    fontSize: '14px',
  },
};
