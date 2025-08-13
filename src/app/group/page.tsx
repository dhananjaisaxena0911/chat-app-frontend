// app/group/page.tsx
"use client";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useEffect, useState } from "react";
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
type Group = {
  id: string;
  name: string;
};

export default function GroupListPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberIds, setmemberIds] = useState<String[] | null>([]);
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/group");
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, []);

  const handlejoin = async (groupId: string) => {
    try {
      const userId = localStorage.getItem("currentUserId");
      if (!userId) return alert("You must be logged in");

      const res = await fetch("http://localhost:3001/group/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, userId }),
      });

      if (res.ok) {
        alert("Joined Group successfully");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to join group");
      }
    } catch (error) {
      console.error("Error during joining group", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Available
        <PointerHighlight>
          <span>Groups</span>
        </PointerHighlight>
      </h1>
      <div className="mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-neutral-600 text-white px-4 py-2 rounded"
        >
          Create Group
        </button>
      </div>
      {loading ? (
        <p className=" text-white">Loading...</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {groups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handlejoin}
              index={index}
            />
          ))}
        </ul>
      )}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <h2 className="text-lg font-bold mb-4 text-black dark:text-white">
            Create new Group
          </h2>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-black"
          />
          <label className="text-black dark:text-white">Member IDs</label>
          <input
            type="text"
            placeholder="user1,user2"
            onChange={(e) => {
              const ids = e.target.value.split(",").map((id) => id.trim());
              setmemberIds(ids);
            }}
            className="w-full p-2 mb-4 border rounded text-black"
          />
          <div className="flex justify-between">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={async () => {
                const adminId = localStorage.getItem("currentUserId");
                if (!adminId) return alert("Login required");

                const res = await fetch("http://localhost:3001/group", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: groupName,
                    adminId,
                    memberIds,
                  }),
                });

                if (res.ok) {
                  const newGroup = await res.json();
                  setGroups((prev) => [...prev, newGroup]);
                  setIsCreateModalOpen(false);
                  setGroupName("");
                  setmemberIds([]);
                  alert("Group created!");
                } else {
                  const error = await res.json();
                  alert(error.message || "Failed to create group.");
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function GroupCard({
  group,
  index,
  onJoin,
}: {
  group: Group;
  index: number;
  onJoin: (groupId: string) => void;
}) {
  return (
    <li className="list-none">
      <CardContainer className="inter-var">
        <CardBody
          className="z-0 bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emeral-500/[0.1]
        dark:bg-black dark:border-white/[0.2] border-black[0.1]
        w-full h-full rounded-xl p-6 border"
        >
          {/* Dropdown Menu */}
          <div className="absolute top-4 right-4 z-[100]">
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-2 py-1 text-sm font-semibold text-white shadow-inner shadow-white/10">
                <ChevronDownIcon className="size-4 fill-white/60" />
              </MenuButton>

              <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-white/10 bg-gray-900 p-1 text-sm text-white shadow-lg backdrop-blur-md z-50 focus:outline-none">
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
                    <PencilIcon className="size-4 fill-white/30" />
                    Edit
                  </button>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
                    <Square2StackIcon className="size-4 fill-white/30" />
                    Duplicate
                  </button>
                </MenuItem>
                <div className="my-1 h-px bg-white/10" />
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
                    <ArchiveBoxXMarkIcon className="size-4 fill-white/30" />
                    Archive
                  </button>
                </MenuItem>
                <MenuItem>
                  <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
                    <TrashIcon className="size-4 fill-white/30" />
                    Delete
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>


          {/* Group Info */}
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-neutral-600 dark:text-white"
          >
            {group.name}
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-neutral-500 text-sm mt-2 dark:text-neutral-300"
          >
            Join and start chatting with your group
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <Image
              src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2560"
              alt="Group thumbnail"
              width={1000}
              height={600}
              className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl z-10 relative" />
          </CardItem>
          <div className="flex justify-between items-center mt-8">
            <CardItem
              translateZ={20}
              as={Link}
              href={`/group/${group.id}`}
              className="px-4 py-2 rounded-xl text-xs font-medium
              text-purple-600 hover:underline dark:text-white"
            >
              Enter Group
            </CardItem>
            <CardItem
              translateZ={20}
              as="button"
              onClick={() => onJoin(group.id)}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
            >
              Join
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </li>
  );
}
