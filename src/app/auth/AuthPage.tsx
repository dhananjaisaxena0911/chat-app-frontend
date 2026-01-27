"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [animate, setAnimate] = useState(false);

  const handleToggle = (login: boolean) => {
    if (login === isLogin) return;
    setAnimate(true);
    setTimeout(() => {
      setIsLogin(login);
      setAnimate(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chat App
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Connect with friends instantly
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-2 mb-4">
          <div className="flex relative">
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-xl bg-blue-600 dark:bg-blue-500 transition-all duration-200 ease-out ${isLogin ? "left-1" : "left-1/2"
                }`}
            />
            <button
              onClick={() => handleToggle(true)}
              className={`relative z-10 flex-1 py-3 px-4 text-sm font-medium text-center transition-colors duration-200 ${isLogin
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              Sign in
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={`relative z-10 flex-1 py-3 px-4 text-sm font-medium text-center transition-colors duration-200 ${!isLogin
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 ${animate ? "opacity-50" : "opacity-100"
            }`}
        >
          {isLogin ? <LoginForm onSwitchToSignup={() => handleToggle(false)} /> : <SignUpForm onSuccess={() => handleToggle(true)} />}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

