"use client";

import React, { useState } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";
export default function LoginForm() {
  const router=useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials:"include",
        body: JSON.stringify({ email, password }),
      });
      if(!res.ok){
        const error= await res.json();
        console.log("Login Failed",error.message)
        return
      }


      const data = await res.json();
      console.log(data);
      localStorage.setItem('currentUserId',data.userId);
      console.log("useId stored");
      
      if(data.token){
        localStorage.setItem('token',data.token);
        console.log("Token stored, relying on ProtectedRoute for redirect");
        router.push("/");
      }

      console.log("Login Successfull",data.message);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="w-full h-full bg-white p-4 md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Login
      </h2>
      <p>Login to Chat</p>
      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                placeholder="exmaple@gmail.com"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                id="Password"
                placeholder="********"
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />{" "}
            </LabelInputContainer>
            </div>
            <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neytral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                type="submit"
            >
                Login 
                <BottomGradient/>
            </button>
        
      </form>
    </div>
  );
}
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};