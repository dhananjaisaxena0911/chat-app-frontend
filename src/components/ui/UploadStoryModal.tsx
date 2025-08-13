"use client";

import React from "react";
import { Dialog } from "@headlessui/react";
import {UploadStoryPage} from "./upload-storyPage";
interface UploadStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadStoryModal({ isOpen, onClose }: UploadStoryModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded bg-black p-6 text-white overflow-y-auto max-h-[90vh]">
          <UploadStoryPage onClose={onClose}/>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
