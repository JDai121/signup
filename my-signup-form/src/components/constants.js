import { loadStripe } from '@stripe/stripe-js';

// Stripe public key — swap for pk_live_... in production
export const stripePromise = loadStripe('pk_test_51T1E7DRzcIO6rKBYS182mq9MTVErggM56M3mps6ELP3vAJoM0PRqaNbA2Bg0AMhoxrmBKRiUzxdUpDvq1mJGxjCv00DRpGM0sL');

export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#111827',
      fontFamily: "'Inter', system-ui, sans-serif",
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#DC2626', iconColor: '#DC2626' },
  },
};

export const API_BASE = 'http://localhost:8000/api';

export const BELT_OPTIONS = [
  { value: 'white',      label: 'White Belt' },
  { value: 'yellow',     label: 'Yellow Belt' },
  { value: 'green',      label: 'Green Belt' },
  { value: 'blue',       label: 'Blue Belt' },
  { value: 'red',        label: 'Red Belt' },
  { value: 'black',      label: 'Black Belt' },
  { value: 'black-dan2', label: 'Black Belt — 2nd Dan' },
  { value: 'black-dan3', label: 'Black Belt — 3rd Dan' },
];

export const SCHOOL_OPTIONS = [
  'Dragon Martial Arts Academy',
  'Elite Taekwondo Center',
  'Phoenix Martial Arts',
  'Tiger Strike Dojo',
  'Warrior Spirit Academy',
  'Champions Taekwondo',
  'Black Belt Excellence',
  "Master Kim's Taekwondo",
];

export const INITIAL_FORM_DATA = {
  firstName: '', lastName: '', phone: '', email: '',
  dateOfBirth: '', gender: '', street: '', city: '',
  state: '', zipCode: '', beltRank: '', weight: '',
  schoolName: '', customSchoolName: '',
  poomsae: false, boardBreaking: false, sparring: false,
  agreedToWaiver: false,
};

export const calculateTotal = (eventsCount) =>
  eventsCount === 0 ? 0 : eventsCount <= 2 ? 100 : 125;
