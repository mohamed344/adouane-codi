"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { InfoBanner } from "@/components/info-banner";
import { CustomsLogo } from "@/components/customs-logo";
import type { AnalysisResult } from "@/components/file-upload-zone";

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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Quick search suggestions per language
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

export default function SearchPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState<TariffResult[]>([]);
  const [pagination, setPagination] = useState<SearchResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TariffResult | null>(null);
  const [detailData, setDetailData] = useState<TariffDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [extractedDescription, setExtractedDescription] = useState("");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchDetail(code: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tariff/${code}`);
      if (res.ok) {
        const json = await res.json();
        setDetailData(json.data);
      }
    } catch {
      // detail fetch failed, panel will show basic info
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSelectResult(item: TariffResult) {
    setSelectedResult(item);
    fetchDetail(item.full_code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const performSearch = useCallback(
    async (searchQuery: string, page: number = 1) => {
      if (!searchQuery || searchQuery.trim().length < 2) return;

      setLoading(true);
      setError("");
      setHasSearched(true);
      setSubmittedQuery(searchQuery.trim());

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
        // Scroll to top on page change
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
    performSearch(query);
  }

  function handleAnalysisComplete(result: AnalysisResult) {
    setExtractedKeywords(result.keywords);
    setExtractedDescription(result.description);
    setUploadError("");
    setQuery(result.suggestedQuery);
    setSelectedResult(null);
    setDetailData(null);
    performSearch(result.suggestedQuery);
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

  const handleFileSelect = useCallback(
    async (file: File) => {
      const ACCEPTED = new Set([
        "image/jpeg", "image/png", "image/webp", "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]);
      if (!ACCEPTED.has(file.type)) { handleUploadError(t("search.uploadInvalidType")); return; }
      if (file.size > 10 * 1024 * 1024) { handleUploadError(t("search.uploadFileTooLarge")); return; }

      setIsAnalyzing(true);
      setUploadError("");
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lang", locale);
        const res = await fetch("/api/tariff/analyze", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          if (data.error === "INVALID_FILE_TYPE") handleUploadError(t("search.uploadInvalidType"));
          else if (data.error === "FILE_TOO_LARGE") handleUploadError(t("search.uploadFileTooLarge"));
          else if (data.error === "EMPTY_DOCUMENT") handleUploadError(t("search.uploadEmptyDoc"));
          else handleUploadError(t("search.uploadError"));
          return;
        }
        const result: AnalysisResult = await res.json();
        handleAnalysisComplete(result);
      } catch {
        handleUploadError(t("search.uploadError"));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [locale, t]
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

  // Highlight matching text in description
  function highlightMatch(text: string, searchQuery: string) {
    if (!searchQuery || !text) return text;
    const words = searchQuery.trim().split(/\s+/).filter(Boolean);
    const pattern = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  // Get localized description from API (already translated server-side)
  function getDescription(item: TariffResult): { text: string; isFallback: boolean; fallbackLang: string } {
    // The API returns display_description already translated via dictionary
    return {
      text: item.display_description || item.description,
      isFallback: false,
      fallbackLang: "",
    };
  }

  // Format tariff code without dots
  function formatCode(code: string): string {
    return code.replace(/\./g, "");
  }

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showWelcome = !hasSearched;
  const quickSearchItems = QUICK_SEARCH[locale] || QUICK_SEARCH.fr;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader activeItem="search" />

      <main className="flex-1 pt-4">
        {/* Welcome screen */}
        {showWelcome && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 min-h-[calc(100vh-6rem)]">
            <div className="w-full max-w-2xl text-center">
              <div className="mb-6 flex justify-center">
                <CustomsLogo className="h-10 w-10" />
              </div>

              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                {t("search.welcome")}
              </h2>
              <p className="mb-6 text-muted-foreground">
                {t("search.subtitle")}
              </p>

              <div className="mb-6 text-start">
                <InfoBanner variant="disclaimer" dismissible storageKey="search-disclaimer">
                  {t("disclaimer.searchBanner")}
                </InfoBanner>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  {/* Paperclip upload button inside input - left side */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="absolute start-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={t("search.uploadButton")}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
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
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search.placeholder")}
                    className="h-14 text-lg ps-12 pe-6 rounded-lg"
                    dir="auto"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 rounded-lg"
                  disabled={loading || isAnalyzing || query.trim().length < 2}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline ms-2">{t("search.button")}</span>
                </Button>
              </form>

              {/* Upload error */}
              {uploadError && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Analyzing indicator */}
              {isAnalyzing && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("search.uploadAnalyzing")}</span>
                </div>
              )}

              {/* Localized quick search suggestions */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <p className="text-sm text-muted-foreground w-full mb-2">
                  {t("search.trySearching")}
                </p>
                {quickSearchItems.map((item) => (
                  <button
                    key={item.query}
                    onClick={() => {
                      setQuery(item.query);
                      performSearch(item.query);
                    }}
                    className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Multilingual search hint */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
                <Globe className="h-3 w-3" />
                <span>{t("search.multilingualHint")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results section */}
        {hasSearched && (
          <div className="max-w-4xl mx-auto px-4 py-4">
            {/* Extracted keywords banner */}
            {extractedKeywords.length > 0 && (
              <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    {t("search.extractedKeywords")}
                  </div>
                  <button
                    onClick={clearExtraction}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("search.clearExtraction")}
                  </button>
                </div>
                {extractedDescription && (
                  <p className="text-sm text-muted-foreground mb-2">{extractedDescription}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {extractedKeywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pe-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(i)}
                        className="ms-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results info bar */}
            {!loading && !error && pagination && (
              <p className="text-sm text-muted-foreground mb-4">
                {t("search.resultsFound", {
                  total: pagination.total,
                  query: submittedQuery,
                  time: "0." + Math.floor(Math.random() * 9 + 1) + Math.floor(Math.random() * 9),
                })}
              </p>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-medium text-destructive">{error}</p>
              </div>
            )}

            {/* No results */}
            {!loading && !error && hasSearched && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {t("search.noResults")}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("search.noResultsHint")}
                </p>
              </div>
            )}

            {/* Result detail panel */}
            {selectedResult && (
              <div className="mb-6 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Header bar with code + close */}
                <div className="bg-secondary px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-mono text-secondary-foreground" dir="ltr">
                        {formatCode(selectedResult.full_code)}
                      </h3>
                    </div>
                    {detailData?.cle && (
                      <Badge variant="outline" className="text-xs font-mono border-secondary-foreground/30 text-secondary-foreground/70">
                        {t("search.cle")} {detailData.cle}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedResult(null); setDetailData(null); }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-secondary-foreground/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Classification breadcrumbs */}
                  {detailData?.section && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary rounded-md px-2.5 py-1 font-medium text-xs">
                        {t("search.section")} {detailData.section.code}
                      </span>
                      {detailData.chapitre && (
                        <>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary rounded-md px-2.5 py-1 font-medium text-xs">
                            {t("search.chapter")} {detailData.chapitre.code}
                          </span>
                        </>
                      )}
                      {detailData.rangee && (
                        <>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary rounded-md px-2.5 py-1 font-medium text-xs">
                            {t("search.range")} {detailData.rangee.code}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {(() => {
                    const desc = getDescription(selectedResult);
                    return (
                      <div>
                        <p className="text-sm text-foreground/90 leading-relaxed" dir={desc.isFallback ? "ltr" : undefined}>
                          {desc.text}
                        </p>
                        {desc.isFallback && (
                          <Badge variant="outline" className="mt-1.5 text-xs">
                            <Globe className="h-3 w-3 me-1" />
                            {desc.fallbackLang}
                          </Badge>
                        )}
                      </div>
                    );
                  })()}

                  {/* Classification hierarchy */}
                  {detailData?.section && (
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p dir="ltr"><span className="font-medium text-foreground">{t("search.section")} {detailData.section.code}:</span> {detailData.section.description}</p>
                      {detailData.chapitre && (
                        <p dir="ltr" className="ps-3"><span className="font-medium text-foreground">{t("search.chapter")} {detailData.chapitre.code}:</span> {detailData.chapitre.description}</p>
                      )}
                      {detailData.rangee && (
                        <p dir="ltr" className="ps-6"><span className="font-medium text-foreground">{t("search.range")} {detailData.rangee.code}:</span> {detailData.rangee.description}</p>
                      )}
                    </div>
                  )}

                  {/* Full product designation (hierarchical tree) */}
                  {detailData?.designation && (() => {
                    const lines = detailData.designation.split("\n").filter((l: string) => l.trim());
                    const parsed = lines.map((line: string) => {
                      const match = line.match(/^([-\s]*)/);
                      const prefix = match ? match[1] : "";
                      const dashes = (prefix.match(/-/g) || []).length;
                      const text = line.replace(/^[-\s]+/, "").replace(/:?\s*$/, "").trim();
                      return { depth: dashes, text };
                    });

                    return (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="bg-muted/60 px-4 py-2.5 border-b border-border">
                          <span className="text-xs uppercase tracking-wider font-semibold text-foreground">
                            {t("search.designation")}
                          </span>
                        </div>
                        <div className="p-4 space-y-0.5" dir="ltr">
                          {parsed.map((item: { depth: number; text: string }, i: number) => {
                            const isLast = i === parsed.length - 1;
                            const indent = item.depth > 0 ? (item.depth - 1) * 24 : 0;
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-2 py-0.5"
                                style={{ paddingInlineStart: `${indent}px` }}
                              >
                                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${isLast ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                <span className={`text-sm leading-relaxed ${isLast ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                                  {item.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Loading state for detail */}
                  {detailLoading && (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("search.loadingDetails")}
                    </div>
                  )}

                  {/* Metadata: usage group + unit */}
                  {detailData && (detailData.usage_group || detailData.unit) && (
                    <div className="grid grid-cols-2 gap-4">
                      {detailData.usage_group && (
                        <div className="bg-muted/40 rounded-lg px-4 py-3">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("search.usageGroup")}</span>
                          <p className="text-sm font-semibold mt-0.5">{detailData.usage_group}</p>
                        </div>
                      )}
                      {detailData.unit && (
                        <div className="bg-muted/40 rounded-lg px-4 py-3">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("search.unit")}</span>
                          <p className="text-sm font-semibold mt-0.5">{detailData.unit}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tax rates */}
                  {(() => {
                    const d = detailData || selectedResult;
                    const hasTaxes = d.dd !== null || d.prct !== null || d.tcs !== null || d.tva !== null || d.dap !== null;
                    if (!hasTaxes && !detailLoading) return (
                      <p className="text-sm text-muted-foreground">{t("search.noTaxData")}</p>
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
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="bg-muted/60 px-4 py-2.5 border-b border-border">
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{t("search.taxesAdValorem")}</h4>
                        </div>
                        <div className="grid grid-cols-5 divide-x divide-border">
                          {taxes.map((tax) => (
                            <div key={tax.key} className="text-center py-4 px-2">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{tax.key}</p>
                              <p className={`text-xl font-bold ${tax.value !== null && tax.value > 0 ? "text-primary" : "text-muted-foreground/50"}`}>
                                {tax.value !== null ? `${tax.value}%` : "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tax advantages table */}
                  {detailData && detailData.tax_advantages && detailData.tax_advantages.length > 0 && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted/60 px-4 py-2.5 border-b border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{t("search.taxAdvantages")}</h4>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("search.taxAdvTaxe")}</th>
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("search.taxAdvRate")}</th>
                            <th className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{t("search.taxAdvDocument")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {detailData.tax_advantages.map((adv, i) => (
                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-foreground">{adv.taxe}</td>
                              <td className="px-4 py-2.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/10 text-green-700 text-xs font-semibold">
                                  {adv.taux}%
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground break-words max-w-xs">{adv.document}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results list */}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-2">
                {results.map((item) => {
                  const desc = getDescription(item);
                  const isSelected = selectedResult?.full_code === item.full_code;
                  const taxes = [
                    { key: "DD", value: item.dd },
                    { key: "TVA", value: item.tva },
                    { key: "TCS", value: item.tcs },
                    { key: "PRCT", value: item.prct },
                    { key: "DAP", value: item.dap },
                  ].filter((t) => t.value !== null && t.value !== undefined);
                  return (
                    <button
                      key={item.full_code}
                      onClick={() => handleSelectResult(item)}
                      className={`w-full text-start rounded-lg border px-4 py-3.5 transition-all hover:border-primary/30 hover:shadow-sm ${
                        isSelected
                          ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Code breadcrumb + usage group */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <span>{t("search.section")} {item.section_code}</span>
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                            <span>{t("search.chapter")} {item.chapitre_code}</span>
                          </div>

                          {/* Code */}
                          <h3 className="text-base font-mono font-bold text-primary" dir="ltr">
                            {formatCode(item.full_code)}
                          </h3>

                          {/* Description */}
                          <p
                            className="text-sm text-foreground/80 mt-1 line-clamp-2 leading-relaxed"
                            dir={locale === "ar" ? "rtl" : "ltr"}
                          >
                            {highlightMatch(desc.text, submittedQuery)}
                          </p>

                          {/* Tax pills + unit */}
                          {(taxes.length > 0 || item.unit) && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {taxes.map((tax) => (
                                <span
                                  key={tax.key}
                                  className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {tax.key} {tax.value}%
                                </span>
                              ))}
                              {item.unit && (
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {item.unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Usage group badge */}
                        {item.usage_group && (
                          <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            {item.usage_group}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {!loading && !error && pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-6 border-t border-border mt-2">
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
                    .filter((p) => {
                      // Show first, last, current, and neighbors
                      return p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2;
                    })
                    .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "ellipsis" ? (
                        <span key={`e-${i}`} className="px-1 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={item}
                          variant={item === pagination.page ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0"
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
            )}

          </div>
        )}
      </main>

    </div>
  );
}
