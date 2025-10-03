import React, {useRef} from "react";
import {useDropzone} from "react-dropzone";
import {Upload, X, FileText} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
// No import needed for static asset

const CSVImportDialog = ({
                             isOpen,
                             onClose,
                             onFileUpload,
                             isUploading = false,
                         }: {
    isOpen: any,
    onClose: any,
    onFileUpload: any,
    isUploading?: boolean
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileUpload = async (files: any) => {
        const file = files[0];
        if (!file) return;

        try {
            await onFileUpload(file);
            onClose();
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const {getRootProps, getInputProps, isDragActive, isDragReject} =
        useDropzone({
            onDrop: handleFileUpload,
            accept: {
                "text/csv": [".csv"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                    ".xlsx",
                ],
                "application/vnd.ms-excel": [".xls"],
            },
            multiple: false,
            disabled: isUploading,
        });

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const handleManualFileUpload = async (e: any) => {
        const input = e.currentTarget;
        const file = input.files?.[0];
        if (!file) return;

        try {
            await onFileUpload(file);
            onClose();
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            input.value = "";
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch("/titem_new.csv");
            if (!response.ok) throw new Error("Failed to fetch template file");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "Template_Item.csv";
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Template download failed:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>CSV Import Data</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Dropzone Area */}
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                            isDragActive && !isDragReject
                                ? "border-orange-500 bg-orange-50"
                                : ""
                        }
              ${isDragReject ? "border-red-500 bg-red-50" : ""}
              ${!isDragActive ? "border-gray-300 hover:border-gray-400" : ""}
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        <input {...getInputProps()} disabled={isUploading}/>

                        <div className="flex flex-col items-center space-y-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Upload className="h-6 w-6 text-gray-600"/>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Masukkan file .CSV Anda ke sini
                                </p>
                                <p className="text-sm text-gray-500">
                                    atau klik untuk memilih file
                                </p>
                            </div>

                            {isDragActive && !isDragReject && (
                                <p className="text-sm text-orange-600">Drop file di sini...</p>
                            )}

                            {isDragReject && (
                                <p className="text-sm text-red-600">
                                    File harus berformat .csv, .xlsx, atau .xls
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Manual Upload Button */}
                    <div className="flex justify-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleManualFileUpload}
                            accept=".xlsx,.xls,.csv"
                            style={{display: "none"}}
                        />
                        <Button
                            onClick={triggerFileUpload}
                            variant="outline"
                            size="default"
                            disabled={isUploading}
                            className="w-32"
                        >
                            {isUploading ? (
                                <>
                                    <Spinner/>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2"/>
                                    Upload File
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Template Download Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Unduh template untuk format yang benar sebelum mengupload data
                            Anda.{" "}
                            <button
                                onClick={handleDownloadTemplate}
                                className="text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Unduh template
                            </button>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                        Batal
                    </Button>
                    <Button
                        onClick={onClose}
                        disabled={isUploading}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CSVImportDialog;
