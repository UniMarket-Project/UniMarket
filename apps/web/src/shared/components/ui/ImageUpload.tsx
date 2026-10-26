import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { api } from "../../api/api-client";
import { Input } from "./Input";
import { Upload, Link as LinkIcon, X, Loader2, CheckCircle2, FileText, Image as ImageIcon } from "lucide-react";
import { getErrorMessage } from "../../utils/errors";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  purpose: "listing_image" | "verification_document" | "avatar";
  accept?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  purpose,
  accept = "image/jpeg,image/png,image/webp",
  helperText,
  placeholder = "https://example.com/photo.jpg",
  className = "",
}: ImageUploadProps) {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  const uploadFile = async (file: File) => {
    setErrorMsg("");

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    // Validate type
    const acceptedList = accept.split(",").map((s) => s.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const isAccepted = acceptedList.some(
      (acc) => acc === fileType || (acc.endsWith("/*") && fileType.startsWith(acc.replace("/*", "/")))
    );

    if (!isAccepted) {
      setErrorMsg(`Unsupported format (${file.type || "unknown"}). Allowed formats: JPG, PNG, WebP${accept.includes("pdf") ? ", PDF" : ""}.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress("Uploading file to cloud storage...");

    try {
      // 1. Direct server-side upload to R2 (bypasses browser CORS preflight completely)
      let uploadedUrl = "";
      try {
        const directRes = await api.post(`/uploads/direct?purpose=${purpose}`, file, {
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        uploadedUrl = directRes.data?.data?.fileUrl;
      } catch (directErr: any) {
        // If direct upload endpoint is not 404 (e.g., auth error, validation error, server error), rethrow
        if (directErr?.response?.status && directErr.response.status !== 404) {
          throw directErr;
        }
        // Fallback to presigned upload if direct upload endpoint is unavailable
        console.warn("Direct upload unavailable (404), falling back to presigned upload:", directErr);
      }

      if (uploadedUrl) {
        onChange(uploadedUrl);
        setUploadProgress("");
        return;
      }

      // 2. Fallback: Request presigned upload URL from UniMarket API
      const presignRes = await api.post("/uploads/presign", {
        purpose,
        contentType: file.type,
        sizeBytes: file.size,
      });

      const { uploadUrl, fileUrl } = presignRes.data.data;

      // 3. Upload binary payload to S3/R2 presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload server responded with status ${uploadRes.status}`);
      }

      // 4. Set the public reference URL
      onChange(fileUrl);
      setUploadProgress("");
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err, "Failed to upload file. Please try again or provide an image URL."));
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChange("");
    setErrorMsg("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        {/* Mode Toggle Buttons */}
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              mode === "file"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3 w-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              mode === "url"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Preview Card if an image/document is uploaded */}
      {value && !isUploading && (
        <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-3 flex items-center gap-3">
          <div className="h-16 w-16 rounded-xl overflow-hidden border border-border bg-background shrink-0 flex items-center justify-center">
            {isPdf ? (
              <FileText className="h-8 w-8 text-rose-500" />
            ) : (
              <img
                src={value}
                alt="Upload preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isPdf ? "Document Ready" : "Photo Ready"}</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate font-mono">
              {value}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mode 1: Upload from Storage / Gallery */}
      {mode === "file" && (!value || isUploading) && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-border hover:border-emerald-500/50 hover:bg-muted/20"
            } ${isUploading ? "opacity-75 cursor-wait" : ""}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <p className="text-xs font-bold text-foreground">{uploadProgress}</p>
                <p className="text-[11px] text-muted-foreground">Uploading directly to cloud storage</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Choose photo from storage / gallery
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    or drag and drop file here (JPG, PNG, WebP{accept.includes("pdf") ? ", PDF" : ""} up to 5 MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Direct Image URL */}
      {mode === "url" && (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => {
              setErrorMsg("");
              onChange(e.target.value);
            }}
            placeholder={placeholder}
          />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <p className="text-xs text-red-500 font-medium">
          {errorMsg}
        </p>
      )}

      {/* Helper text */}
      {helperText && !errorMsg && (
        <p className="text-[11px] text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
