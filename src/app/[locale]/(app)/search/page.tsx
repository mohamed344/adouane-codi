"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Loader2,
  FileText,
  AlertCircle,
  Globe,
  ChevronRight,
  Paperclip,
  Sparkles,
  X,
  Clock,
  Bookmark,
  Filter,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { InfoBanner } from "@/components/info-banner";
import { CustomsLogo } from "@/components/customs-logo";
import type { AnalysisResult } from "@/components/file-upload-zone";
import { cn } from "@/lib/utils";

interface TaxAdvantage {
  taxe: string;
  taux: number;
  document: string;
}

interface TariffResult {
  full_code: string;
  section_code: string;
  chapitre_code: string;
  description: string;
  display_description: string;
  designation: string | null;
  rangee_description: string | null;
  chapitre_description: string | null;
  display_lang: string;
  dd: number | null;
  prct: number | null;
  tcs: number | null;
  tva: number | null;
  dap: number | null;
  usage_group: string | null;
  unit: string | null;
  rank: number;
}

interface TariffDetail extends TariffResult {
  range_code: string;
  usage_group: string | null;
  unit: string | null;
  tax_advantages: TaxAdvantage[];
  designation: string | null;
  cle: string | null;
  section: { code: string; description: string } | null;
  chapitre: { code: string; description: string } | null;
  rangee: { code: string; description: string } | null;
}

interface SearchResponse {
  data: TariffResult[];
  query: string;
  lang: string;
  /** Set only when a fallback was used — the shorter / translated query that actually matched. */
  used_query?: string;
  /** Which fallback path ran. content_only = filler words stripped, word_drop = prefix
   *  shortened, best_word = single content word picked by match count, ai_translation =
   *  Gemini-translated fallback. */
  fallback_reason?: "content_only" | "word_drop" | "best_word" | "ai_translation";
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const QUICK_SEARCH: Record<string, { label: string; query: string }[]> = {
  fr: [
    { label: "lait", query: "lait" },
    { label: "0401", query: "0401" },
    { label: "voiture", query: "voiture" },
  ],
  en: [
    { label: "milk", query: "milk" },
    { label: "0401", query: "0401" },
    { label: "sugar", query: "sugar" },
  ],
  ar: [
    { label: "حليب", query: "حليب" },
    { label: "0401", query: "0401" },
    { label: "سكر", query: "سكر" },
  ],
};

const RECENT_KEY = "codi:recent-searches";
const SAVED_KEY = "codi:saved-tariffs";

export default function SearchPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState<TariffResult[]>([]);
  const [pagination, setPagination] = useState<SearchResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [usedQuery, setUsedQuery] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TariffResult | null>(null);
  const [detailData, setDetailData] = useState<TariffDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [extractedDescription, setExtractedDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedTariffs, setSavedTariffs] = useState<{ code: string; desc: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ───── Persisted state (localStorage) ─────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      if (Array.isArray(recent)) setRecentSearches(recent);
      if (Array.isArray(saved)) setSavedTariffs(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function pushRecent(q: string) {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function clearRecent() {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }

  function toggleSave(item: TariffResult) {
    setSavedTariffs((prev) => {
      const exists = prev.some((s) => s.code === item.full_code);
      const next = exists
        ? prev.filter((s) => s.code !== item.full_code)
        : [
            { code: item.full_code, desc: item.display_description || item.description },
            ...prev,
          ].slice(0, 10);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // ───── Detail fetch (preserved) ─────
  async function fetchDetail(code: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tariff/${code}`);
      if (res.ok) {
        const json = await res.json();
        setDetailData(json.data);
      }
    } catch {
      /* detail fetch failed */
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSelectResult(item: TariffResult) {
    setSelectedResult(item);
    fetchDetail(item.full_code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ───── Search (preserved) ─────
  const performSearch = useCallback(
    async (searchQuery: string, page: number = 1) => {
      if (!searchQuery || searchQuery.trim().length < 2) return;

      setLoading(true);
      setError("");
      setHasSearched(true);
      setSubmittedQuery(searchQuery.trim());
      setUsedQuery(null);

      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          lang: locale,
          page: page.toString(),
          limit: "20",
        });

        const res = await fetch(`/api/tariff/search?${params}`);
        const data: SearchResponse = await res.json();

        if (!res.ok) {
          setError((data as unknown as { error: string }).error || t("search.errorGeneric"));
          setResults([]);
          setPagination(null);
          return;
        }

        setResults(data.data);
        setPagination(data.pagination);
        setUsedQuery(data.used_query ?? null);
        if (page === 1) pushRecent(searchQuery.trim());
        if (page > 1) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        setError(t("search.errorGeneric"));
        setResults([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [locale, t]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSelectedResult(null);
    setDetailData(null);
    if (pendingFile) {
      analyzeAndSearch(pendingFile, query);
    } else {
      performSearch(query);
    }
  }

  function handleUploadError(message: string) {
    setUploadError(message);
    setExtractedKeywords([]);
    setExtractedDescription("");
  }

  function clearExtraction() {
    setExtractedKeywords([]);
    setExtractedDescription("");
    setUploadError("");
  }

  function clearPendingFile() {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setPendingFile(null);
    setFilePreviewUrl(null);
    setUploadError("");
  }

  const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const ACCEPTED = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]);
      if (!ACCEPTED.has(file.type)) {
        handleUploadError(t("search.uploadInvalidType"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        handleUploadError(t("search.uploadFileTooLarge"));
        return;
      }
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setUploadError("");
      setPendingFile(file);
      setFilePreviewUrl(IMAGE_MIME.has(file.type) ? URL.createObjectURL(file) : null);
    },
    [t, filePreviewUrl]
  );

  // ───── Upload + analyze + search (preserved) ─────
  const analyzeAndSearch = useCallback(
    async (file: File, userText: string) => {
      setIsAnalyzing(true);
      setUploadError("");
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lang", locale);
        if (userText.trim()) {
          formData.append("context", userText.trim());
        }
        const res = await fetch("/api/tariff/analyze", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          if (data.error === "INVALID_FILE_TYPE") handleUploadError(t("search.uploadInvalidType"));
          else if (data.error === "FILE_TOO_LARGE") handleUploadError(t("search.uploadFileTooLarge"));
          else if (data.error === "EMPTY_DOCUMENT") handleUploadError(t("search.uploadEmptyDoc"));
          else handleUploadError(t("search.uploadError"));
          return;
        }
        const result: AnalysisResult = await res.json();

        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setPendingFile(null);
        setFilePreviewUrl(null);

        setExtractedKeywords(result.keywords);
        setExtractedDescription(result.description);
        setUploadError("");
        setSelectedResult(null);
        setDetailData(null);

        // Try keywords progressively
        const keywords = [...result.keywords];
        const extra = userText.trim();
        let bestQuery = "";

        for (let count = keywords.length; count >= 1; count--) {
          const attempt = keywords.slice(0, count).join(" ");
          const tryQuery = extra ? `${attempt} ${extra}` : attempt;
          const params = new URLSearchParams({ q: tryQuery, lang: locale, limit: "1" });
          const check = await fetch(`/api/tariff/search?${params}`);
          if (check.ok) {
            const checkData = await check.json();
            if (checkData.pagination?.total > 0) {
              bestQuery = tryQuery;
              break;
            }
          }
          if (extra && count <= keywords.length) {
            const params2 = new URLSearchParams({ q: attempt, lang: locale, limit: "1" });
            const check2 = await fetch(`/api/tariff/search?${params2}`);
            if (check2.ok) {
              const checkData2 = await check2.json();
              if (checkData2.pagination?.total > 0) {
                bestQuery = attempt;
                break;
              }
            }
          }
        }

        if (!bestQuery) {
          bestQuery = keywords[0] || result.suggestedQuery;
        }

        setQuery(bestQuery);
        performSearch(bestQuery);
      } catch {
        handleUploadError(t("search.uploadError"));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [locale, t, filePreviewUrl, performSearch]
  );

  function removeKeyword(index: number) {
    const newKeywords = extractedKeywords.filter((_, i) => i !== index);
    setExtractedKeywords(newKeywords);
    if (newKeywords.length > 0) {
      const newQuery = newKeywords.slice(0, 3).join(" ");
      setQuery(newQuery);
      performSearch(newQuery);
    }
  }

  // Highlight matching text
  function highlightMatch(text: string, searchQuery: string) {
    if (!searchQuery || !text) return text;
    const words = searchQuery.trim().split(/\s+/).filter(Boolean);
    const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="rounded-sm bg-[hsl(var(--primary)/0.18)] px-0.5 text-[hsl(var(--primary-2))]"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  function getDescription(item: TariffResult) {
    return {
      text: item.display_description || item.description,
      isFallback: false,
      fallbackLang: "",
    };
  }

  function formatCode(code: string): string {
    return code.replace(/\./g, "");
  }

  // Focus + ⌘K shortcut
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showWelcome = !hasSearched;
  const quickSearchItems = QUICK_SEARCH[locale] || QUICK_SEARCH.fr;

  return (
    <div className="container-app flex flex-col gap-6 py-8 lg:flex-row lg:gap-8 lg:py-10">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      {/* ─── SIDE RAIL ─────────────────────────── */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 space-y-6">
          {/* Quick filters */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
              <Filter className="size-3" />
              {t("search.trySearching")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickSearchItems.map((item) => (
                <button
                  key={item.query}
                  onClick={() => {
                    setQuery(item.query);
                    performSearch(item.query);
                  }}
                  className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground-2))] transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-soft))] hover:text-[hsl(var(--primary-2))]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                  <Clock className="size-3" />
                  {t("search.welcome")}
                </p>
                <button
                  type="button"
                  onClick={clearRecent}
                  aria-label="Clear recent"
                  className="rounded p-1 text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
              <ul className="space-y-1">
                {recentSearches.map((q) => (
                  <li key={q}>
                    <button
                      onClick={() => {
                        setQuery(q);
                        performSearch(q);
                      }}
                      className="line-clamp-1 w-full rounded-md px-2 py-1.5 text-start text-sm text-[hsl(var(--foreground-2))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                      title={q}
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Saved tariffs */}
          {savedTariffs.length > 0 ? (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                <Bookmark className="size-3" />
                {t("common.billing")}
              </p>
              <ul className="space-y-1">
                {savedTariffs.map((s) => (
                  <li key={s.code}>
                    <button
                      onClick={() => {
                        setQuery(s.code);
                        performSearch(s.code);
                      }}
                      className="block w-full rounded-md px-2 py-1.5 text-start transition-colors hover:bg-[hsl(var(--surface-2))]"
                      title={s.desc}
                    >
                      <div className="font-mono text-xs font-semibold text-[hsl(var(--foreground))]" dir="ltr">
                        {formatCode(s.code)}
                      </div>
                      <div className="line-clamp-1 text-[11px] text-[hsl(var(--muted-fg))]">
                        {s.desc}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ─── MAIN COLUMN ───────────────────────── */}
      <main className="min-w-0 flex-1">
        {showWelcome ? (
          /* ─── Welcome screen ─── */
          <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
            <div className="w-full max-w-2xl text-center">
              <CustomsLogo className="mx-auto mb-6 h-12 w-12" />
              <h1 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-[hsl(var(--foreground))] sm:text-4xl">
                {t("search.welcome")}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-[hsl(var(--muted-fg))]">
                {t("search.subtitle")}
              </p>

              <form onSubmit={handleSearch} className="mt-10 space-y-3">
                {/* Pending file preview */}
                {pendingFile ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--primary)/0.30)] bg-[hsl(var(--primary-soft))] px-4 py-3 text-start">
                    {filePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreviewUrl}
                        alt={pendingFile.name}
                        className="h-12 w-12 shrink-0 rounded-lg border border-[hsl(var(--border))] object-cover"
                      />
                    ) : (
                      <FileText className="size-5 shrink-0 text-[hsl(var(--primary))]" />
                    )}
                    <span className="flex-1 truncate font-mono text-sm text-[hsl(var(--foreground))]">
                      {pendingFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={clearPendingFile}
                      aria-label="Remove file"
                      className="rounded-md p-1.5 text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : null}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    aria-label={t("search.uploadButton")}
                    className="absolute start-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="size-5 animate-spin text-[hsl(var(--primary))]" />
                    ) : (
                      <Paperclip className="size-5" />
                    )}
                  </button>
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      pendingFile
                        ? t("search.uploadContextPlaceholder")
                        : t("search.placeholder")
                    }
                    className="h-14 ps-12 pe-32 text-base shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]"
                    dir="auto"
                  />
                  <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    <Kbd>⌘K</Kbd>
                    <Button
                      type="submit"
                      size="sm"
                      loading={loading || isAnalyzing}
                      disabled={
                        loading || isAnalyzing || (!pendingFile && query.trim().length < 2)
                      }
                    >
                      <Search className="size-4" />
                      <span className="hidden sm:inline">{t("search.button")}</span>
                    </Button>
                  </div>
                </div>
              </form>

              {uploadError ? (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-[hsl(var(--destructive))]">
                  <AlertCircle className="size-4" />
                  {uploadError}
                </div>
              ) : null}

              {isAnalyzing ? (
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))]">
                  <Loader2 className="size-4 animate-spin" />
                  {t("search.uploadAnalyzing")}
                </div>
              ) : null}

              {/* Quick search pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-[hsl(var(--muted-fg))]">
                  {t("search.trySearching")}
                </span>
                {quickSearchItems.map((item) => (
                  <button
                    key={item.query}
                    onClick={() => {
                      setQuery(item.query);
                      performSearch(item.query);
                    }}
                    className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1 text-xs font-medium text-[hsl(var(--foreground-2))] transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-soft))] hover:text-[hsl(var(--primary-2))]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-fg-2))]">
                <Globe className="size-3" />
                {t("search.multilingualHint")}
              </div>

              <div className="mt-8 text-start">
                <InfoBanner variant="disclaimer" dismissible storageKey="search-disclaimer">
                  {t("disclaimer.searchBanner")}
                </InfoBanner>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Results screen ─── */
          <div>
            {/* Sticky search bar */}
            <form
              onSubmit={handleSearch}
              className="sticky top-20 z-10 -mx-2 mb-6 space-y-2 bg-[hsl(var(--background)/0.92)] px-2 py-3 backdrop-blur"
            >
              {pendingFile ? (
                <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/0.30)] bg-[hsl(var(--primary-soft))] px-3 py-2">
                  <FileText className="size-4 shrink-0 text-[hsl(var(--primary))]" />
                  <span className="flex-1 truncate font-mono text-xs text-[hsl(var(--foreground))]">
                    {pendingFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearPendingFile}
                    aria-label="Remove file"
                    className="rounded p-1 text-[hsl(var(--muted-fg))] hover:bg-[hsl(var(--surface-2))]"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}

              {isAnalyzing ? (
                <div className="flex items-center gap-2 px-1 text-sm text-[hsl(var(--primary))]">
                  <Loader2 className="size-4 animate-spin" />
                  {t("search.uploadAnalyzing")}
                </div>
              ) : null}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  aria-label={t("search.uploadButton")}
                  className="absolute start-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[hsl(var(--muted-fg))] transition-colors hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))]"
                >
                  {isAnalyzing ? (
                    <Loader2 className="size-4 animate-spin text-[hsl(var(--primary))]" />
                  ) : (
                    <Paperclip className="size-4" />
                  )}
                </button>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    pendingFile
                      ? t("search.uploadContextPlaceholder")
                      : t("search.placeholder")
                  }
                  className="h-11 ps-10 pe-28"
                  dir="auto"
                />
                <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                  <Kbd>⌘K</Kbd>
                  <Button
                    type="submit"
                    size="sm"
                    loading={loading || isAnalyzing}
                    disabled={
                      loading || isAnalyzing || (!pendingFile && query.trim().length < 2)
                    }
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Extracted keywords banner */}
            {extractedKeywords.length > 0 ? (
              <Card variant="default" className="mb-5 border-[hsl(var(--primary)/0.30)] bg-[hsl(var(--primary-soft))] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary-2))]">
                    <Sparkles className="size-4" />
                    {t("search.extractedKeywords")}
                  </div>
                  <button
                    type="button"
                    onClick={clearExtraction}
                    className="text-xs text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  >
                    {t("search.clearExtraction")}
                  </button>
                </div>
                {extractedDescription ? (
                  <p className="mb-3 text-sm text-[hsl(var(--foreground-2))]">
                    {extractedDescription}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {extractedKeywords.map((keyword, i) => (
                    <Badge key={i} variant="indigo" className="gap-1 pe-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(i)}
                        aria-label="Remove keyword"
                        className="ms-0.5 rounded-full p-0.5 transition-colors hover:bg-[hsl(var(--primary)/0.20)]"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </Card>
            ) : null}

            {/* Fallback banner — shown when the API swapped the query (word-drop or AI translation) */}
            {!loading && !error && usedQuery && usedQuery !== submittedQuery ? (
              <InfoBanner variant="info" className="mb-4">
                {t("search.fallbackBanner", { original: submittedQuery, used: usedQuery })}
              </InfoBanner>
            ) : null}

            {/* Results info bar */}
            {!loading && !error && pagination ? (
              <p className="mb-4 text-sm text-[hsl(var(--muted-fg))]">
                {t("search.resultsFound", {
                  total: pagination.total,
                  query: usedQuery ?? submittedQuery,
                  time:
                    "0." +
                    Math.floor(Math.random() * 9 + 1) +
                    Math.floor(Math.random() * 9),
                })}
              </p>
            ) : null}

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary-soft))]">
                  <Loader2 className="size-6 animate-spin text-[hsl(var(--primary))]" />
                </div>
                <p className="text-sm text-[hsl(var(--muted-fg))]">{t("common.loading")}</p>
              </div>
            ) : null}

            {/* Error */}
            {error && !loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--destructive-soft))]">
                  <AlertCircle className="size-6 text-[hsl(var(--destructive))]" />
                </div>
                <p className="text-base font-semibold text-[hsl(var(--destructive))]">{error}</p>
              </div>
            ) : null}

            {/* No results */}
            {!loading && !error && hasSearched && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--surface-2))]">
                  <Search className="size-6 text-[hsl(var(--muted-fg))]" />
                </div>
                <p className="mb-1 text-base font-semibold text-[hsl(var(--foreground))]">
                  {t("search.noResults")}
                </p>
                <p className="max-w-md text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
                  {t("search.noResultsHint")}
                </p>
              </div>
            ) : null}

            {/* Detail panel */}
            {selectedResult ? (
              <Card variant="elevated" className="mb-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-2))] text-white shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.45)]">
                      <FileText className="size-4" />
                    </div>
                    <h3 className="font-mono text-lg font-semibold text-[hsl(var(--foreground))]" dir="ltr">
                      {formatCode(selectedResult.full_code)}
                    </h3>
                    {detailData?.cle ? (
                      <Badge variant="outline" className="font-mono">
                        {t("search.cle")} {detailData.cle}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSave(selectedResult)}
                      aria-label="Save"
                    >
                      <Bookmark
                        className={cn(
                          "size-4",
                          savedTariffs.some((s) => s.code === selectedResult.full_code) &&
                            "fill-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                        )}
                      />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedResult(null);
                        setDetailData(null);
                      }}
                      aria-label="Close"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  {/* Breadcrumbs */}
                  {detailData?.section ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="indigo">
                        {t("search.section")} {detailData.section.code}
                      </Badge>
                      {detailData.chapitre ? (
                        <>
                          <ChevronRight className="size-3.5 text-[hsl(var(--muted-fg-2))] rtl:rotate-180" />
                          <Badge variant="indigo">
                            {t("search.chapter")} {detailData.chapitre.code}
                          </Badge>
                        </>
                      ) : null}
                      {detailData.rangee ? (
                        <>
                          <ChevronRight className="size-3.5 text-[hsl(var(--muted-fg-2))] rtl:rotate-180" />
                          <Badge variant="indigo">
                            {t("search.range")} {detailData.rangee.code}
                          </Badge>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-[hsl(var(--foreground-2))]">
                    {getDescription(selectedResult).text}
                  </p>

                  {/* Hierarchy text */}
                  {detailData?.section ? (
                    <div className="space-y-1.5 text-xs text-[hsl(var(--muted-fg))]">
                      <p dir="ltr">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          {t("search.section")} {detailData.section.code}:
                        </span>{" "}
                        {detailData.section.description}
                      </p>
                      {detailData.chapitre ? (
                        <p dir="ltr" className="ps-3">
                          <span className="font-medium text-[hsl(var(--foreground))]">
                            {t("search.chapter")} {detailData.chapitre.code}:
                          </span>{" "}
                          {detailData.chapitre.description}
                        </p>
                      ) : null}
                      {detailData.rangee ? (
                        <p dir="ltr" className="ps-6">
                          <span className="font-medium text-[hsl(var(--foreground))]">
                            {t("search.range")} {detailData.rangee.code}:
                          </span>{" "}
                          {detailData.rangee.description}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Designation tree */}
                  {detailData?.designation
                    ? (() => {
                        const lines = detailData
                          .designation!.split("\n")
                          .filter((l) => l.trim());
                        const parsed = lines.map((line: string) => {
                          const match = line.match(/^([-\s]*)/);
                          const prefix = match ? match[1] : "";
                          const dashes = (prefix.match(/-/g) || []).length;
                          const text = line
                            .replace(/^[-\s]+/, "")
                            .replace(/:?\s*$/, "")
                            .trim();
                          return { depth: dashes, text };
                        });
                        return (
                          <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                            <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                                {t("search.designation")}
                              </span>
                            </div>
                            <div className="space-y-0.5 p-4" dir="ltr">
                              {parsed.map((item, i) => {
                                const isLast = i === parsed.length - 1;
                                const indent = item.depth > 0 ? (item.depth - 1) * 24 : 0;
                                return (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 py-0.5"
                                    style={{ paddingInlineStart: `${indent}px` }}
                                  >
                                    <span
                                      className={cn(
                                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                                        isLast
                                          ? "bg-[hsl(var(--primary))]"
                                          : "bg-[hsl(var(--muted-fg-2))]"
                                      )}
                                    />
                                    <span
                                      className={cn(
                                        "text-sm leading-relaxed",
                                        isLast
                                          ? "font-semibold text-[hsl(var(--primary-2))]"
                                          : "text-[hsl(var(--muted-fg))]"
                                      )}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    : null}

                  {detailLoading ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-[hsl(var(--muted-fg))]">
                      <Loader2 className="size-4 animate-spin" />
                      {t("search.loadingDetails")}
                    </div>
                  ) : null}

                  {/* Metadata */}
                  {detailData && (detailData.usage_group || detailData.unit) ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailData.usage_group ? (
                        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("search.usageGroup")}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--foreground))]">
                            {detailData.usage_group}
                          </p>
                        </div>
                      ) : null}
                      {detailData.unit ? (
                        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("search.unit")}
                          </p>
                          <p className="mt-0.5 font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                            {detailData.unit}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Tax rates */}
                  {(() => {
                    const d = detailData || selectedResult;
                    const hasTaxes =
                      d.dd !== null ||
                      d.prct !== null ||
                      d.tcs !== null ||
                      d.tva !== null ||
                      d.dap !== null;
                    if (!hasTaxes && !detailLoading)
                      return (
                        <p className="text-sm text-[hsl(var(--muted-fg))]">
                          {t("search.noTaxData")}
                        </p>
                      );
                    if (!hasTaxes) return null;
                    const taxes = [
                      { key: "D.D", label: t("search.taxDD"), value: d.dd },
                      { key: "PRCT", label: t("search.taxPRCT"), value: d.prct },
                      { key: "T.C.S", label: t("search.taxTCS"), value: d.tcs },
                      { key: "T.V.A", label: t("search.taxTVA"), value: d.tva },
                      { key: "DAP", label: t("search.taxDAP"), value: d.dap },
                    ];
                    return (
                      <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                            {t("search.taxesAdValorem")}
                          </p>
                        </div>
                        <div className="grid grid-cols-5 divide-x divide-[hsl(var(--border))]">
                          {taxes.map((tax) => (
                            <div key={tax.key} className="px-2 py-4 text-center">
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--muted-fg))]">
                                {tax.key}
                              </p>
                              <p
                                className={cn(
                                  "font-mono text-xl font-semibold",
                                  tax.value !== null && tax.value > 0
                                    ? "text-[hsl(var(--primary-2))]"
                                    : "text-[hsl(var(--muted-fg-2))]"
                                )}
                              >
                                {tax.value !== null ? `${tax.value}%` : "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tax advantages */}
                  {detailData &&
                  detailData.tax_advantages &&
                  detailData.tax_advantages.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-fg))]">
                          {t("search.taxAdvantages")}
                        </p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-[hsl(var(--muted-fg))]">
                              {t("search.taxAdvTaxe")}
                            </th>
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-[hsl(var(--muted-fg))]">
                              {t("search.taxAdvRate")}
                            </th>
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-[hsl(var(--muted-fg))]">
                              {t("search.taxAdvDocument")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                          {detailData.tax_advantages.map((adv, i) => (
                            <tr key={i} className="transition-colors hover:bg-[hsl(var(--surface))]">
                              <td className="px-4 py-2.5 font-semibold text-[hsl(var(--foreground))]">
                                {adv.taxe}
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge variant="emerald">{adv.taux}%</Badge>
                              </td>
                              <td className="max-w-xs break-words px-4 py-2.5 text-xs text-[hsl(var(--muted-fg))]">
                                {adv.document}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </Card>
            ) : null}

            {/* Result list */}
            {!loading && !error && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((item) => {
                  const desc = getDescription(item);
                  const isSelected = selectedResult?.full_code === item.full_code;
                  const taxes = [
                    { key: "DD", value: item.dd },
                    { key: "TVA", value: item.tva },
                    { key: "TCS", value: item.tcs },
                    { key: "PRCT", value: item.prct },
                    { key: "DAP", value: item.dap },
                  ].filter((tx) => tx.value !== null && tx.value !== undefined);
                  return (
                    <button
                      key={item.full_code}
                      onClick={() => handleSelectResult(item)}
                      className={cn(
                        "group w-full rounded-xl border bg-[hsl(var(--background))] px-5 py-4 text-start transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                        isSelected
                          ? "border-[hsl(var(--primary)/0.40)] bg-[hsl(var(--primary-soft))] ring-1 ring-[hsl(var(--primary)/0.15)]"
                          : "border-[hsl(var(--border))] hover:border-[hsl(var(--border-2))] hover:-translate-y-px hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-fg))]">
                            <span>
                              {t("search.section")} {item.section_code}
                            </span>
                            <ChevronRight className="size-3 shrink-0 text-[hsl(var(--muted-fg-2))] rtl:rotate-180" />
                            <span>
                              {t("search.chapter")} {item.chapitre_code}
                            </span>
                          </div>

                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center rounded-md bg-[hsl(var(--surface-2))] px-2.5 py-0.5 font-mono text-sm font-semibold text-[hsl(var(--foreground))]"
                              dir="ltr"
                            >
                              {formatCode(item.full_code)}
                            </span>
                            {item.usage_group ? (
                              <Badge variant="slate">{item.usage_group}</Badge>
                            ) : null}
                          </div>

                          <p
                            className="mt-2 line-clamp-2 text-sm leading-relaxed text-[hsl(var(--foreground-2))]"
                            dir={locale === "ar" ? "rtl" : "ltr"}
                          >
                            {highlightMatch(desc.text, submittedQuery)}
                          </p>

                          {taxes.length > 0 || item.unit ? (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              {taxes.map((tax) => (
                                <span
                                  key={tax.key}
                                  className="inline-flex items-center rounded-md bg-[hsl(var(--surface-2))] px-2 py-0.5 font-mono text-[10px] font-semibold text-[hsl(var(--muted-fg))]"
                                >
                                  {tax.key} {tax.value}%
                                </span>
                              ))}
                              {item.unit ? (
                                <span className="inline-flex items-center rounded-md bg-[hsl(var(--primary)/0.10)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[hsl(var(--primary-2))]">
                                  {item.unit}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <ChevronRight className="mt-3 size-5 shrink-0 text-[hsl(var(--muted-fg-2))] transition-colors group-hover:text-[hsl(var(--primary))] rtl:rotate-180" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Pagination */}
            {!loading && !error && pagination && pagination.totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[hsl(var(--border))] py-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => performSearch(submittedQuery, pagination.page - 1)}
                >
                  {t("search.prev")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 2
                    )
                    .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "ellipsis" ? (
                        <span
                          key={`e-${i}`}
                          className="px-1 text-[hsl(var(--muted-fg))]"
                        >
                          …
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={item === pagination.page ? "primary" : "ghost"}
                          size="sm"
                          className="size-8 p-0"
                          onClick={() => performSearch(submittedQuery, item as number)}
                        >
                          {item}
                        </Button>
                      )
                    )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => performSearch(submittedQuery, pagination.page + 1)}
                >
                  {t("search.next")}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
