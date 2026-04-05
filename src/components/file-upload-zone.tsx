"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Upload, FileText, ImageIcon, Loader2, X, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

const ACCEPT_STRING = ".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx";

export interface AnalysisResult {
  keywords: string[];
  description: string;
  detectedCodes: string[];
  suggestedQuery: string;
}

interface FileUploadZoneProps {
  locale: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (message: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
}

export function FileUploadZone({
  locale,
  onAnalysisComplete,
  onError,
  isAnalyzing,
  setIsAnalyzing,
}: FileUploadZoneProps) {
  const t = useTranslations("search");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!ACCEPTED_TYPES[file.type]) {
        onError(t("uploadInvalidType"));
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        onError(t("uploadFileTooLarge"));
        return;
      }

      setFileName(file.name);
      setIsAnalyzing(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lang", locale);

        const response = await fetch("/api/tariff/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          if (data.error === "INVALID_FILE_TYPE") {
            onError(t("uploadInvalidType"));
          } else if (data.error === "FILE_TOO_LARGE") {
            onError(t("uploadFileTooLarge"));
          } else if (data.error === "EMPTY_DOCUMENT") {
            onError(t("uploadEmptyDoc"));
          } else {
            onError(t("uploadError"));
          }
          return;
        }

        const result: AnalysisResult = await response.json();
        onAnalysisComplete(result);
      } catch {
        onError(t("uploadError"));
      } finally {
        setIsAnalyzing(false);
        setFileName(null);
      }
    },
    [locale, onAnalysisComplete, onError, setIsAnalyzing, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const getFileIcon = () => {
    if (isAnalyzing) return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    if (isDragging) return <Upload className="h-8 w-8 text-primary" />;
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed p-6
        transition-all duration-200 text-center
        ${isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
        }
        ${isAnalyzing ? "pointer-events-none opacity-75" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {getFileIcon()}

        {isAnalyzing ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t("uploadAnalyzing")}</p>
            {fileName && (
              <p className="text-xs text-muted-foreground">{fileName}</p>
            )}
          </div>
        ) : isDragging ? (
          <p className="text-sm font-medium text-primary">{t("uploadDragActive")}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t("uploadTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("uploadSubtitle")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
