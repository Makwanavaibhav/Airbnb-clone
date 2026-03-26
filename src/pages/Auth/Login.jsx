import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login with:", email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block fill-none h-4 w-4 stroke-current stroke-[3] overflow-visible"><path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
          </Link>
          <h2 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 mx-auto">Log in or sign up</h2>
          <div className="w-8"></div> {/* Spacer to keep title centered */}
        </div>

        <div className="p-6">
          <h3 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100 mb-6">Welcome to Airbnb</h3>

          <form onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

            </div>

            <p className="text-[12px] text-gray-600 dark:text-gray-400 mt-3 font-light">
              We'll call or text you to confirm your number. Standard message and data rates apply. <span className="font-semibold underline cursor-pointer">Privacy Policy</span>
            </p>

            <button
              type="submit"
              className="mt-4 w-full flex justify-center py-3.5 border border-transparent rounded-lg text-[16px] font-semibold text-white bg-airbnb hover:bg-[#d90b63] transition duration-200"
              style={{ backgroundColor: '#FF385C' }}
            >
              Continue
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-[12px]">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-normal">or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="w-full cursor-pointer flex items-center justify-between px-4 py-3 border border-black dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-gray-100 font-semibold text-[14px]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block h-[20px] w-[20px]"><path fill="#4285f4" d="M24.12 25c2.82-2.63 4.07-7 3.32-11.19H16.25v4.63h6.37A5.26 5.26 0 0 1 20.25 22z"></path><path fill="#34a853" d="M5.62 21.31A12 12 0 0 0 24.12 25l-3.87-3.12a7.11 7.11 0 0 1-7.37 1.25z"></path><path fill="#fbbc02" d="M9.81 16c0-1.22.25-2.42.75-3.5L5.62 9.38a12 12 0 0 0 0 13.25z"></path><path fill="#ea4335" d="M16.25 10.75a7.15 7.15 0 0 1 5.06 1.94l3.62-3.62A12 12 0 0 0 5.62 9.38l4.94 3.12c1.12-2.63 3.56-4.38 6.44-4.38z"></path><path fill="none" d="M0 0h32v32H0z"></path></svg>
                 <span className="flex-1 text-center">Continue with Google</span>
              </div>
              <div className="w-full cursor-pointer flex items-center justify-between px-4 py-3 border border-black dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-gray-100 font-semibold text-[14px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block h-[20px] w-[20px]"><path d="M32 16c0-8.84-7.16-16-16-16S0 7.16 0 16c0 7.99 5.85 14.63 13.5 15.81V20.63H9.44v-4.63h4.06v-3.53c0-4 2.38-6.22 6.04-6.22 1.76 0 3.58.31 3.58.31v3.94h-2.02c-1.98 0-2.6.13-2.6 3v2.5h4.43l-.71 4.63h-3.72v11.18C26.15 30.63 32 23.99 32 16z" fill="#1877F2"></path><path d="M21.05 20.63l.71-4.63h-4.43V13.5c0-1.34.37-2.25 2.29-2.25h2.44v-4.14A33.02 33.02 0 0 0 18.5 6.8c-3.4 0-5.83 2.05-5.83 6.01v3.19H8.6v4.63h4.07v11.18c.82.13 1.66.2 2.5.2s1.68-.07 2.5-.2V20.63h4.38z" fill="#fff"></path></svg>
                <span className="flex-1 text-center">Continue with Facebook</span>
              </div>
              <div className="w-full cursor-pointer flex items-center justify-between px-4 py-3 border border-black dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-gray-100 font-semibold text-[14px]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block h-[20px] w-[20px]"><path d="M5.33 21.02c1.78.29 2.55-1.07 3.32-2.31 3.59-5.74 3.73-10.43 1.05-13.9-3.79-4.88-11.95-6.53-15.15 5.5-2.06 7.74 1.76 13.79 6.27 15.22 3.19 1.02 5.92-.09 7.42-.51 5.99-1.66 11.23.01 16.03 2.37 3.99 1.96 5.3 1.25 5.95-.53.59-1.61.32-3.08-.25-3.32-3.78-1.58-10.14-5.22-17.5-3.23.6-2.14 1.62-5.41 1.62-5.41a4.2 4.2 0 0 1-5.18-1.55c-1.35-1.92-1.25-4.18-1.25-4.18s3.4 1 6.36.93" fill="#222222" className="dark:fill-gray-200"></path><path d="M19.16 2.35c.16 2.4-1.24 3.65-2.82 5.6-2.28 2.8-5.35 3.1-6.72 1.44a5.2 5.2 0 0 1-1.35-4.5c.32-1.95 2.1-4.08 4-5.11 1.76-.92 3.82-1.31 3.82-1.31s-.07.45-.19 1.48C15.65 1.52 14.86 3.18 15.65 4.31c.78 1.14 2 1.06 2.58.58A6.45 6.45 0 0 0 19.46.21s-.34.33-.3 2.14" fill="#222222" className="dark:fill-gray-200"></path></svg>
                 <span className="flex-1 text-center">Continue with Apple</span>
              </div>
              <div className="w-full cursor-pointer flex items-center justify-between px-4 py-3 border border-black dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-gray-100 font-semibold text-[14px]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="block h-[20px] w-[20px]"><path d="M3 8c0-2.76 2.24-5 5-5h16c2.76 0 5 2.24 5 5v16c0 2.76-2.24 5-5 5H8c-2.76 0-5-2.24-5-5V8zm19.5 0c0-1.38-1.12-2.5-2.5-2.5h-8c-1.38 0-2.5 1.12-2.5 2.5v16c0 1.38 1.12 2.5 2.5 2.5h8c1.38 0 2.5-1.12 2.5-2.5V8zM19 12h-6v2h6v-2zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z" fill="#222222" className="dark:fill-gray-200"></path></svg>
                 <span className="flex-1 text-center">Continue with email</span>
              </div>
            </div>
            
            <div className="mt-8 text-center text-[14px] text-gray-900 dark:text-gray-100">
              Don't have an account? <Link to="/register" className="font-semibold underline">Sign up here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
