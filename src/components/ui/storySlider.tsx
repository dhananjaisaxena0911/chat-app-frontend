"use client"

import { ImagesSlider } from "./images-slider"
import {motion} from "framer-motion";
import { useEffect,useState } from "react";
import axios from "axios";

export default function StorySlider({userId,onClose,}:{userId:string,onClose: () => void;}){
    const [images,setImages]=useState<string[]>([]);

    useEffect(() => {
  if (!userId) return;

  async function fetchStories() {
    try {
      const res = await axios.get(`http://localhost:3001/story/active/${userId}`);
      const urls = res.data.map((story: any) => story.imageUrl);
      setImages(urls);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    }
  }

  fetchStories();
}, [userId]);


    if(images.length===0) return null;

    return (
    <ImagesSlider className="h-[40rem]" images={images} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-50 flex flex-col justify-center items-center"
      >
        <motion.p className="font-bold text-xl md:text-5xl text-center text-white">
          Story View
        </motion.p>
      </motion.div>
    </ImagesSlider>
  );
}