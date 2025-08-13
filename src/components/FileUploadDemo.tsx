"use client";

import React from "react";
import { FileUpload } from "./ui/file-upload";

interface Props {
  onChange: (file: File) => void;
}

export function FileUploadDemo({ onChange }: Props) {
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      onChange(files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
}
