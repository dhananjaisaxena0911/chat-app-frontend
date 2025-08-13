"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-lg shadow-md">
        <div className="flex justify-between mb-6">
          <button
            className={`w-1/2 py-2 rounded-l-md ${
              isLogin ? "bg-black text-white" : "bg-neutral-800"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 rounded-r-md ${
              !isLogin ? "bg-white text-black" : "bg-neutral-800"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Signup
          </button>
        </div>
        {isLogin ? (
          <LoginForm />
        ) : (
          <SignUpForm onSuccess={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
