"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import { UploadCloud, X, File as FileIcon } from "lucide-react";
import { Button } from "./ui/button";
interface FileUploadButtonProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  accept?: Accept; // Allow custom file types
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  value = [],
  onChange,
  maxFiles = 3,
  maxSizeMB = 4,
  disabled = false,
  // Default accepted file types
  accept = {
    "image/jpeg": [],
    "image/png": [],
    "image/gif": [],
    "application/pdf": [],
  },
}) => {
  const [error, setError] = useState<string | null>(null);
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  // Callback function for handling file drops and validation
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Clear previous errors
      setError(null);

      // Handle file rejections
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        let errorMessage = "An unknown error occurred.";

        if (firstError.code === "file-too-large") {
          errorMessage = `File is too large. Max size is ${maxSizeMB}MB.`;
        } else if (firstError.code === "file-invalid-type") {
          errorMessage = "Invalid file type."; // More generic error message
        } else if (firstError.code === "too-many-files") {
          errorMessage = `You can only upload a maximum of ${maxFiles} files.`;
        }

        setError(errorMessage);
        return;
      }

      // Combine newly accepted files with existing ones, respecting the maxFiles limit
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    [value, onChange, maxFiles, maxSizeMB, maxSize]
  );

  // Configure the dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept, // Use the custom accept prop
    maxSize,
    maxFiles,
    disabled: disabled || value.length >= maxFiles,
  });

  // Function to remove a file from the list
  const removeFile = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.stopPropagation(); // Prevent the dropzone from opening
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    // Clear error if user makes space for a new file
    if (error && newFiles.length < maxFiles) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* --- Dropzone Button --- */}
      <div {...getRootProps()} className="outline-none">
        <input {...getInputProps()} />
        <Button
          type="button" // Important to prevent form submission
          disabled={disabled || value.length >= maxFiles}
          className={`w-full`}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          {isDragActive ? "Drop files here..." : "Upload Files"}
        </Button>
      </div>

      {/* --- Error Message Display --- */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* --- File Previews --- */}
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-semibold text-sm text-slate-700">
            Uploaded Files ({value.length}/{maxFiles}):
          </p>
          <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
            {value.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-800 truncate max-w-xs">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, i)}
                  className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
