"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud } from "lucide-react";

// Defines the properties for the ImageUpload component
interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

// A reusable image upload component with drag-and-drop functionality
export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 3,
  maxSizeMB = 2,
  disabled = false,
}) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  // Callback function for handling file drops
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        // Handle file rejections (e.g., size, type)
        const firstError = rejectedFiles[0].errors[0];
        let errorMessage = "An unknown error occurred.";

        if (firstError.code === "file-too-large") {
          errorMessage = `File is too large. Max size is ${maxSizeMB}MB.`;
        } else if (firstError.code === "file-invalid-type") {
          errorMessage = "Invalid file type. Please upload images only.";
        } else if (firstError.code === "too-many-files") {
          errorMessage = `You can only upload a maximum of ${maxFiles} files.`;
        }

        alert(errorMessage); // In a real app, you would use a toast notification library
        return;
      }

      // Combine newly accepted files with existing ones, respecting the maxFiles limit
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    [value, onChange, maxFiles, maxSizeMB]
  );

  // Configure the dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
    },
    maxSize,
    maxFiles,
    disabled: disabled || value.length >= maxFiles,
  });

  // Function to remove an image from the list
  const removeImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.stopPropagation(); // Prevent the dropzone from opening when the remove button is clicked
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div>
      {/* --- Dropzone UI --- */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-orange-500 bg-orange-50"
            : "border-gray-300 hover:border-orange-400"
        }
        ${
          disabled || value.length >= maxFiles
            ? "cursor-not-allowed opacity-50"
            : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
          {isDragActive ? (
            <p className="font-semibold text-orange-600">
              Drop the files here...
            </p>
          ) : (
            <>
              <p className="font-semibold">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, WebP (Max {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* --- Image Previews --- */}
      {value.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold text-sm mb-2">
            Uploaded Files ({value.length}/{maxFiles}):
          </p>
          <div className="flex flex-wrap gap-4">
            {value.map((file, i) => (
              <div key={i} className="relative group">
                <div>{file.name}</div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center rounded-lg">
                  <button
                    type="button"
                    onClick={(e) => removeImage(e, i)}
                    className="absolute top-2 right-[-1.2rem] bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
