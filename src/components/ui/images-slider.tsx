"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
  onClose,
}: {
  images: string[];
  children: React.ReactNode;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  className?: string;
  autoplay?: boolean;
  direction?: "up" | "down";
  onClose:()=>void,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
const [isSliderOpen, setIsSliderOpen] = useState(false);
  const router = useRouter();
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === images.length ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    if (!images || images.length === 0) {
      console.warn("No images provided to ImagesSlider");
      setLoading(false);
      setLoadedImages([]);
      return;
    }

    setLoading(true);
    const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    
    if (validImages.length === 0) {
      console.warn("No valid images found in the provided array");
      setLoading(false);
      setLoadedImages([]);
      return;
    }

    const loadPromises = validImages.map((image) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(image);
        img.onerror = () => {
          console.warn(`Failed to load image: ${image}`);
          resolve(null); // Resolve with null for failed images instead of rejecting
        };
        img.src = image;
      });
    });

    Promise.all(loadPromises)
      .then((loadedImages) => {
        const successfulImages = loadedImages.filter(img => img !== null) as string[];
        setLoadedImages(successfulImages);
        setLoading(false);
        
        if (successfulImages.length === 0) {
          console.error("All images failed to load");
        }
      })
      .catch((error) => {
        console.error("Failed to load images", error);
        setLoading(false);
        setLoadedImages([]);
      });
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // autoplay
    let interval: any;
    if (autoplay) {
      interval = setInterval(() => {
        handleNext();
      }, 5000);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  const slideVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotateX: 45,
    },
    visible: {
      scale: 1,
      rotateX: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1.0] as any,
      },
    },
    upExit: {
      opacity: 1,
      y: "-150%",
      transition: {
        duration: 1,
      },
    },
    downExit: {
      opacity: 1,
      y: "150%",
      transition: {
        duration: 1,
      },
    },
  };

  const areImagesLoaded = loadedImages.length > 0;

  return (
    
    <div
    
      className={cn(
        "overflow-hidden h-full w-full relative flex items-center justify-center",
        className
      )}
      style={{
        perspective: "1000px",
      }}
    >
      {/* Back Button */}
<button
  className="absolute top-4 left-4 z-50 bg-white text-black px-3 py-1 rounded shadow"
  onClick={onClose}
>
  ← Back
</button>


      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <div
          className={cn("absolute inset-0 bg-black/60 z-40", overlayClassName)}
        />
      )}

      {areImagesLoaded && (
        <AnimatePresence>
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit={direction === "up" ? "upExit" : "downExit"}
            variants={slideVariants}
            className="image h-full w-full absolute inset-0 object-cover object-center"
          />
        </AnimatePresence>
      )}
    </div>
  );
};
