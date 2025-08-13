"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Logo } from "../../../components/sideBarDemo";
import { SidebarDemo } from "../../../components/sideBarDemo";
type userProfile = {
  id: string;
  email: string;
  username: string;
};

const logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium whitespace-pre text-black dark:text-white"
        >
          <div>Chat App</div>
        </motion.span>
      </div>
    </a>
  );
};

export default function ProfilePage() {
  const [user, setUser] = useState<userProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("http://localhost:3001/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json()
        console.log(data);
        setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <div className="p-8 text-white">Not Logged In</div>

  return (
    <SidebarDemo>
      <div className="min-h-screen bg-neutral-900 text-white p-6">
        {/**Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className=" text-2xl font-semibold">Welcome {user.username}</h2>
            <p className="text-sm text-neutral-400">{new Date().toDateString()}</p>
          </div>
          <Logo />
        </div>
        {/**Profile info card */}
        <div className="w-full max-w-4xl bg-neutral-800 rounded-2xl shadow-xl p-8 mx-auto mb-1">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center 
          justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">{user.username}</p>
              <p className="text-sm text-neutral-400">{user.email}</p>
            </div>
            <button className="ml-auto bg-neutral-900 text-white px-4 py-2 rounded-md hover:bg-black ">
              Edit
            </button>
          </div>
          {/**Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProdileField label="UserId" value={user.id} />
            <ProdileField label="Username" value={user.username} />
            <ProdileField label="Email" value={user.email} />
          </div>

        </div>
        <MacbookScroll src="https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=1616&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
      </div>
    </SidebarDemo>
  )
}

function ProdileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <label className=" text-sm mb-1 text-neutral-400">{label}</label>
      <input type="text" value={value} disabled className="bg-neutral-700 text-white rounded-md px-3 py-2 cursor-not-allowed" />
    </div>
  );
}

