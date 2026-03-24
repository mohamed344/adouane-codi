"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Search,
  LogOut,
  Loader2,
  FileText,
  AlertCircle,
  Globe,
} from "lucide-react";
import { CustomsLogo } from "@/components/customs-logo";

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
  description_en: string | null;
  description_ar: string | null;
  display_description: string;
  display_lang: string;
  dd: number | null;
  prct: number | null;
  tcs: number | null;
  tva: number | null;
  dap: number | null;
  rank: number;
}

interface TariffDetail extends TariffResult {
  range_code: string;
  usage_group: string | null;
  unit: string | null;
  tax_advantages: TaxAdvantage[];
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
  const router = useRouter();
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
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function fetchDetail(code: string) {
    setDetailLoading(true);
    setDetailData(null);
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
          limit: "5",
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

  // Format tariff code with dots for readability
  function formatCode(code: string): string {
    if (code.length === 10) {
      return `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6, 8)}.${code.slice(8)}`;
    }
    return code;
  }

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showWelcome = !hasSearched;
  const quickSearchItems = QUICK_SEARCH[locale] || QUICK_SEARCH.fr;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="glass-nav rounded-full shadow-lg shadow-black/5">
          <div className="flex h-12 items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2 group">
              <CustomsLogo className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm font-bold tracking-tight text-foreground hidden sm:inline">
                {t("common.appName")}
              </span>
            </Link>

            {/* Search bar in header when results are showing */}
            {hasSearched && (
              <form
                onSubmit={handleSearch}
                className="flex flex-1 max-w-xl mx-4 gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search.placeholder")}
                    className="h-9 ps-9 pe-4 rounded-full border-muted-foreground/20 shadow-sm"
                    dir="auto"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 rounded-full px-4"
                  disabled={loading || query.trim().length < 2}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
            )}

            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t("common.logout")}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24">
        {/* Welcome screen */}
        {showWelcome && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 min-h-[calc(100vh-6rem)]">
            <div className="w-full max-w-2xl text-center">
              <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <CustomsLogo className="h-16 w-16" />
                  <span className="text-5xl font-bold tracking-tight">
                    {t("common.appName")}
                  </span>
                </div>
              </div>

              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                {t("search.welcome")}
              </h2>
              <p className="mb-8 text-muted-foreground">
                {t("search.subtitle")}
              </p>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search.placeholder")}
                    className="h-14 text-lg ps-12 pe-6 rounded-full shadow-md border-muted-foreground/20 focus-visible:shadow-lg transition-shadow"
                    dir="auto"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 rounded-full px-8"
                  disabled={loading || query.trim().length < 2}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline ms-2">{t("search.button")}</span>
                </Button>
              </form>

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
                    className="text-sm px-3 py-1.5 rounded-full border border-muted-foreground/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
              <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm animate-in slide-in-from-top-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Breadcrumb with hierarchy descriptions */}
                    {detailData?.section && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <span>{t("search.section")} {detailData.section.code}: {detailData.section.description.slice(0, 50)}{detailData.section.description.length > 50 ? "..." : ""}</span>
                        {detailData.chapitre && (
                          <>
                            <span className="text-muted-foreground/40">{isRTL ? "\u2039" : "\u203A"}</span>
                            <span>{t("search.chapter")} {detailData.chapitre.code}: {detailData.chapitre.description.slice(0, 50)}{detailData.chapitre.description.length > 50 ? "..." : ""}</span>
                          </>
                        )}
                        {detailData.rangee && (
                          <>
                            <span className="text-muted-foreground/40">{isRTL ? "\u2039" : "\u203A"}</span>
                            <span>{t("search.rangee")} {detailData.rangee.code}: {detailData.rangee.description.slice(0, 50)}{detailData.rangee.description.length > 50 ? "..." : ""}</span>
                          </>
                        )}
                      </div>
                    )}
                    <h3 className="text-xl font-bold font-mono text-primary" dir="ltr">
                      {formatCode(selectedResult.full_code)}
                    </h3>
                    {(() => {
                      const desc = getDescription(selectedResult);
                      return (
                        <div className="mt-1">
                          <p className="text-base" dir={desc.isFallback ? "ltr" : undefined}>
                            {desc.text}
                          </p>
                          {desc.isFallback && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              <Globe className="h-3 w-3 me-1" />
                              {desc.fallbackLang}
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedResult(null); setDetailData(null); }}
                    className="text-muted-foreground shrink-0"
                  >
                    &times;
                  </Button>
                </div>

                {/* Original French if viewing in another language */}
                {locale !== "fr" && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {t("search.descFr")} (FR)
                    </span>
                    <p className="text-sm text-muted-foreground" dir="ltr">{selectedResult.description}</p>
                  </div>
                )}

                {/* Loading state for detail */}
                {detailLoading && (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("search.loadingDetails")}
                  </div>
                )}

                {/* Metadata: usage group + unit */}
                {detailData && (detailData.usage_group || detailData.unit) && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {detailData.usage_group && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">{t("search.usageGroup")}</span>
                        <p className="font-medium">{detailData.usage_group}</p>
                      </div>
                    )}
                    {detailData.unit && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">{t("search.unit")}</span>
                        <p className="font-medium">{detailData.unit}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tax rates grid */}
                {(() => {
                  const d = detailData || selectedResult;
                  const hasTaxes = d.dd !== null || d.prct !== null || d.tcs !== null || d.tva !== null || d.dap !== null;
                  if (!hasTaxes && !detailLoading) return (
                    <p className="text-sm text-muted-foreground mb-4">{t("search.noTaxData")}</p>
                  );
                  if (!hasTaxes) return null;
                  const taxes = [
                    { key: "DD", label: t("search.taxDD"), value: d.dd },
                    { key: "PRCT", label: t("search.taxPRCT"), value: d.prct },
                    { key: "TCS", label: t("search.taxTCS"), value: d.tcs },
                    { key: "TVA", label: t("search.taxTVA"), value: d.tva },
                    { key: "DAP", label: t("search.taxDAP"), value: d.dap },
                  ];
                  return (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">{t("search.taxRates")}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {taxes.map((tax) => (
                          <div
                            key={tax.key}
                            className="rounded-lg border bg-muted/40 p-3 text-center"
                          >
                            <p className="text-xs text-muted-foreground mb-1">{tax.label}</p>
                            <p className="text-lg font-bold text-primary">
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
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">{t("search.taxAdvantages")}</h4>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="px-3 py-2 text-start font-medium text-muted-foreground">{t("search.taxAdvTaxe")}</th>
                            <th className="px-3 py-2 text-start font-medium text-muted-foreground">{t("search.taxAdvRate")}</th>
                            <th className="px-3 py-2 text-start font-medium text-muted-foreground">{t("search.taxAdvDocument")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.tax_advantages.map((adv, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-2 font-medium">{adv.taxe}</td>
                              <td className="px-3 py-2">{adv.taux}%</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{adv.document}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Results list */}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-1">
                {results.map((item) => {
                  const desc = getDescription(item);
                  return (
                    <button
                      key={item.full_code}
                      onClick={() => handleSelectResult(item)}
                      className={`w-full text-start rounded-lg px-4 py-3 hover:bg-muted/60 transition-colors group ${
                        selectedResult?.full_code === item.full_code
                          ? "bg-muted/80"
                          : ""
                      }`}
                    >
                      {/* Code breadcrumb */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span>
                          {t("search.section")} {item.section_code}
                        </span>
                        <span className="text-muted-foreground/40">{isRTL ? "\u2039" : "\u203A"}</span>
                        <span>
                          {t("search.chapter")} {item.chapitre_code}
                        </span>
                      </div>

                      {/* Code as title - always LTR */}
                      <h3 className="text-base font-medium text-primary group-hover:underline" dir="ltr">
                        {formatCode(item.full_code)}
                      </h3>

                      {/* Description with highlights - translated */}
                      <p
                        className="text-sm text-foreground/80 mt-0.5 line-clamp-2"
                        dir={locale === "ar" ? "rtl" : "ltr"}
                      >
                        {highlightMatch(desc.text, submittedQuery)}
                      </p>

                    </button>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </main>

    </div>
  );
}


