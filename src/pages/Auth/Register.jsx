import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.dateOfBirth) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      
      // Auto-login after registration so name is available right away
      login(data.token, data.user || { firstName: formData.firstName, lastName: formData.lastName, email: formData.email });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block fill-none h-4 w-4 stroke-current stroke-[3] overflow-visible"><path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
          </Link>
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 mx-auto">Finish signing up</h2>
          <div className="w-8"></div> {/* Spacer to keep title centered */}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Fields */}
            <div>
              <div className="border border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-gray-400 focus-within:border-black dark:focus-within:border-gray-400 transition-shadow">
                <div className="relative border-b border-gray-400 dark:border-gray-600 focus-within:border-transparent">
                  <label htmlFor="firstName" className="absolute top-2 left-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="block w-full px-3 pt-6 pb-2 text-[16px] text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:outline-none placeholder-transparent"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative focus-within:border-transparent">
                  <label htmlFor="lastName" className="absolute top-2 left-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="block w-full px-3 pt-6 pb-2 text-[16px] text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:outline-none placeholder-transparent"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 font-light">Make sure it matches the name on your government ID.</p>
            </div>

            {/* Date of Birth Field */}
            <div>
               <div className="border border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-gray-400 focus-within:border-black dark:focus-within:border-gray-400 transition-shadow">
                  <div className="relative focus-within:border-transparent">
                    <label htmlFor="dateOfBirth" className="absolute top-2 left-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">Date of birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className="block w-full px-3 pt-6 pb-2 text-[16px] text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:outline-none placeholder-transparent"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
               </div>
               <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 font-light">To sign up, you need to be at least 18. Your birthday won't be shared with other people who use Airbnb.</p>
            </div>

            {/* Email & Password Fields */}
            <div>
              <div className="border border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-gray-400 focus-within:border-black dark:focus-within:border-gray-400 transition-shadow">
                <div className="relative border-b border-gray-400 dark:border-gray-600 focus-within:border-transparent">
                  <label htmlFor="email" className="absolute top-2 left-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full px-3 pt-6 pb-2 text-[16px] text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:outline-none placeholder-transparent"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative focus-within:border-transparent">
                  <label htmlFor="password" className="absolute top-2 left-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full px-3 pt-6 pb-2 text-[16px] text-gray-900 dark:text-gray-100 bg-transparent outline-none focus:outline-none placeholder-transparent"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 font-light">We'll email you trip confirmations and receipts.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[#C13515] text-[12px]">
                 <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className="block h-4 w-4 fill-current"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1.2a6.8 6.8 0 1 0 0 13.6A6.8 6.8 0 0 0 8 1.2zM8.7 10v2.24H7.3V10h1.4zm0-6v4.6H7.3V4h1.4z"></path></svg>
                 <span>{error}</span>
              </div>
            )}

            <p className="text-[12px] text-gray-900 dark:text-gray-300 font-light">
              By selecting <strong>Agree and continue</strong>, I agree to Airbnb's <span className="font-semibold underline cursor-pointer text-[#0000EE]">Terms of Service</span>, <span className="font-semibold underline cursor-pointer text-[#0000EE]">Payments Terms of Service</span>, and <span className="font-semibold underline cursor-pointer text-[#0000EE]">Nondiscrimination Policy</span> and acknowledge the <span className="font-semibold underline cursor-pointer text-[#0000EE]">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              className="mt-4 w-full flex justify-center py-3.5 border border-transparent rounded-lg text-[16px] font-semibold text-white bg-airbnb hover:bg-[#d90b63] transition duration-200"
              style={{ backgroundColor: '#FF385C' }}
            >
              Agree and continue
            </button>
          </form>

          <div className="mt-8 text-center text-[14px] text-gray-900 dark:text-gray-100 border-t pt-6 border-gray-200 dark:border-gray-700">
            Already have an account? <Link to="/login" className="font-semibold underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
