import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inner form component (must be inside <Elements>)
function CheckoutForm({ clientSecret, total, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (error) {
      setCardError(error.message);
      if (onError) onError(error.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Price summary */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-lg font-semibold dark:text-white">Total: ₹{total}</p>
        <p className="text-sm text-gray-500">Including service fee</p>
      </div>

      {/* Stripe Card Element */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-4 bg-white dark:bg-gray-900 overflow-hidden">
        <CardElement options={{
          style: {
            base: { 
              fontSize: '16px', 
              color: '#1a1a1a', 
              '::placeholder': { color: '#aab7c4' } 
            },
            invalid: { color: '#e53e3e' }
          }
        }} />
      </div>

      {/* Inline card error */}
      {cardError && (
        <p className="text-red-500 text-sm mb-3">{cardError}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#FF385C] hover:bg-[#D90B38] text-white font-semibold 
                   py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay ₹${total}`}
      </button>

      {/* Stripe branding */}
      <p className="text-center text-xs text-gray-400 mt-3">
        🔒 Secured by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  );
}

// Wrapper that provides Elements context
export default function StripeCheckout({ clientSecret, total, onSuccess, onError }) {
  if (!clientSecret) return null;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        total={total} 
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
