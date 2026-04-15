"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

/**
 * FileUploadZone — drag-and-drop / click upload that POSTs to /api/tariff/analyze.
 * Backend integration is unchanged; only the visual layer was redesigned.
 */
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
      if (!ACCEPTED_TYPES[file.type]) {
        onError(t("uploadInvalidType"));
        return;
      }
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
          if (data.error === "INVALID_FILE_TYPE") onError(t("uploadInvalidType"));
          else if (data.error === "FILE_TOO_LARGE") onError(t("uploadFileTooLarge"));
          else if (data.error === "EMPTY_DOCUMENT") onError(t("uploadEmptyDoc"));
          else onError(t("uploadError"));
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
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isAnalyzing) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      aria-label={t("uploadTitle")}
      aria-busy={isAnalyzing}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        isDragging
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-soft))]"
          : "border-[hsl(var(--border-2))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--surface))]",
        isAnalyzing && "pointer-events-none opacity-75"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            isDragging || isAnalyzing
              ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
              : "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted-fg))]"
          )}
        >
          {isAnalyzing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>

        {isAnalyzing ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t("uploadAnalyzing")}
            </p>
            {fileName ? (
              <p className="font-mono text-xs text-[hsl(var(--muted-fg))]">{fileName}</p>
            ) : null}
          </div>
        ) : isDragging ? (
          <p className="text-sm font-medium text-[hsl(var(--primary))]">
            {t("uploadDragActive")}
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {t("uploadTitle")}
            </p>
            <p className="text-xs text-[hsl(var(--muted-fg))]">
              {t("uploadSubtitle")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
