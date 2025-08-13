"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
};

let userIdCounter = 4;

export default function MainComponent() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?img=1",
      bio: "Frontend Developer at ABC Corp",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      bio: "Backend Engineer at XYZ Inc",
    },
    {
      id: "3",
      name: "Charlie",
      avatar: "https://i.pravatar.cc/150?img=3",
      bio: "DevOps Specialist at 123 Ltd",
    },
  ]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    bio: "",
  });

  const handleUserClick = (id: string) => {
    setSelectedUserId(id);
  };

  const handleBack = () => {
    setSelectedUserId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.avatar || !formData.bio) {
      alert("All fields are required");
      return;
    }

    const newUser: User = {
      id: String(userIdCounter++),
      ...formData,
    };

    setUsers((prev) => [...prev, newUser]);
    setFormData({ name: "", avatar: "", bio: "" });
    setShowForm(false);
  };

  const filteredUser = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.div
            key={selectedUser.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name}
              className="w-32 h-32 rounded-full object-cover hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-semibold mt-4">{selectedUser.name}</h2>
            <p className="text-gray-600 mt-2">{selectedUser.bio}</p>
            <button
              onClick={handleBack}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Back
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="user-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border rounded-md w-70"
              />
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {showForm ? "Cancel" : "Add User"}
              </button>
            </div>
            {showForm && (
              <form
                onSubmit={handleAddUser}
                className="mb-6 p-4 border rounded-md max-w-md mx-auto"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full mb-3 px-4 py-2 border rounded"
                />
                <input
                  name="avatar"
                  type="text"
                  placeholder="Avatar URL"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="block w-full mb-3 px-4 py-2 border rounded"
                />
                <input
                name="bio"
                placeholder="Bio"
                type="text"
                value={formData.bio}
                onChange={handleInputChange}
                className="block w-full mb-3 px-4 py-2 border rounded"
                />
                <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-full"
                >
                  Submit
                </button>
              </form>
            )}

            <div className="flex justify-center gap-6 flex-wrap mt-4">
              {filteredUser.length >0 ?(
                filteredUser.map((user)=>(
                  <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover mb-2"
                    />
                    <span className="mt-2 text-sm ">{user.name}</span>
                  </div>
                ))
              ):(
                <p className="text-gray-500">No User Found</p>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
