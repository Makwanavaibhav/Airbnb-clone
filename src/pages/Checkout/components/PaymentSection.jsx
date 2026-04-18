import React from 'react';
import { Loader2 } from 'lucide-react';

const PaymentSection = ({ onPaymentClick, isLoading }) => {
  return (
    <div className="mt-8">
      <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white mb-2">Proceed to payment</h2>
      <p className="text-[16px] text-gray-600 dark:text-gray-400 mb-8 font-light">
        You'll be directed to Stripe to complete payment.
      </p>

      <div className="mb-6 leading-relaxed">
        <p className="text-[12px] font-semibold text-[#222222] dark:text-gray-300">
          By selecting the button, I agree to the <span className="underline cursor-pointer text-[#222222] dark:text-white">booking terms</span>.
        </p>
      </div>

      <button
        onClick={onPaymentClick}
        disabled={isLoading}
        className="bg-[#222222] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-lg flex items-center justify-center font-bold text-[18px] transition-colors gap-2"
        style={{ backgroundImage: isLoading ? 'none' : 'linear-gradient(to right, #000 0%, #111 100%)' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating session…</span>
          </>
        ) : (
          <>
            <span>Continue to</span>
            <span className="font-extrabold flex items-center">
              <span className="text-[#3395FF]">Stripe</span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentSection;
