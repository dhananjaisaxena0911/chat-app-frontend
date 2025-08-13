"use client";
import { CometCard } from "@/components/ui/comet-card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarDemo } from "../../components/sideBarDemo";
import UploadStoryModal from "@/components/ui/UploadStoryModal";
import StorySlider from "@/components/ui/storySlider";
import StoryCircleList from "@/components/ui/StoryCircleList";
import { AnimatedModalDemo } from "@/components/ui/animatedModelDemo";
export default function Page() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStoryUSerId, setSelectedStoryUserId] = useState<string | null>(
    null
  );
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const openSliderForUser = (userId: string) => {
    setSelectedStoryUserId(userId);
    setIsSliderOpen(true);
  };
  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");
    console.log("Current User ID:", currentUserId);

    if (currentUserId) {
      setUserId(currentUserId);
    } else {
      router.replace("/auth"); 
    }
  }, [router]);

  return (
    <SidebarDemo>
      <div className="flex items-center justify-center mt-3">
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <AnimatedModalDemo />
        </div>

        <UploadStoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      {isSliderOpen && selectedStoryUSerId ? (
        <StorySlider
          userId={selectedStoryUSerId}
          onClose={() => {
            setIsSliderOpen(false);
            setSelectedStoryUserId(null);
          }}
        />
      ) : (
        <StoryCircleList
          userId={userId}
          onStoryClick={(uid) => openSliderForUser(uid)}
        />
      )}

      <div className="flex min-h-screen items-center justify-center bg-neutral-800">
        <div className="flex items-center justify-center">
          <CometCard className="w-full max-w-md p-4">
            <button
              onClick={() => router.push("/FindFriends")}
              type="button"
              className="my-10 flex w-full cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-2 saturate-0 md:my-20 md:p-4"
              aria-label="View invite F7RA"
              style={{
                transformStyle: "preserve-3d",
                transform: "none",
                opacity: 1,
              }}
            >
              <div className="mx-2 flex-1">
                <div className="relative mt-2 aspect-[3/4] w-full">
                  <img
                    loading="lazy"
                    className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                    alt="Invite background"
                    src="https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                      opacity: 1,
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
                <div className="text-xs">Chat Invitation</div>
                <div className="text-xs text-gray-300 opacity-50">#F7RA</div>
              </div>
            </button>
          </CometCard>
        </div>
      </div>
    </SidebarDemo>
  );
}
