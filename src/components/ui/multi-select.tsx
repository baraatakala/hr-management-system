import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MultiSelectOption {
  value: string;
  label: string;
  /** "missing" renders the option with distinct styling (dashed border,
   *  amber, italic) to visually separate it from real data values — used
   *  for a pinned "records with this field empty" choice. */
  variant?: "default" | "missing";
}

interface MultiSelectProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: MultiSelectOption[];
  searchPlaceholder?: string;
  emptyText?: string;
  /** Label used in the trigger button when every option is effectively selected (i.e. values is empty) */
  allLabel?: string;
  className?: string;
}

/**
 * A multi-select dropdown matching the visual language of SearchableSelect,
 * but allowing 0..N selections instead of exactly one.
 *
 * Convention: an empty `values` array means "no filter applied" (all items match),
 * mirroring the "all" sentinel used by the existing single-select filters.
 */
export function MultiSelect({
  values,
  onValuesChange,
  options,
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  allLabel = "All",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const toggleValue = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onValuesChange(values.filter((v) => v !== optionValue));
    } else {
      onValuesChange([...values, optionValue]);
    }
  };

  const selectAllFiltered = () => {
    const filteredValues = filteredOptions.map((o) => o.value);
    const merged = Array.from(new Set([...values, ...filteredValues]));
    onValuesChange(merged);
  };

  const clearAll = () => {
    onValuesChange([]);
  };

  // Touch-friendly scroll handling (mirrors SearchableSelect)
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !open) return;

    let isScrolling = false;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) return;
      const currentY = e.touches[0].clientY;
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const atTop = scrollTop === 0 && currentY > startY;
      const atBottom = scrollTop + clientHeight >= scrollHeight && currentY < startY;
      if (!atTop && !atBottom) e.stopPropagation();
    };

    const handleTouchEnd = () => {
      isScrolling = false;
    };

    scrollContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
    scrollContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
    scrollContainer.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", handleTouchMove);
      scrollContainer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selectedLabels = React.useMemo(
    () =>
      values
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter((l): l is string => Boolean(l)),
    [values, options]
  );

  const triggerText =
    values.length === 0
      ? allLabel
      : values.length === 1
      ? selectedLabels[0] ?? allLabel
      : `${values.length} selected`;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={cn("truncate", values.length > 0 && "font-medium")}>{triggerText}</span>
        <span className="flex items-center gap-1 shrink-0">
          {values.length > 0 && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5 opacity-60" />
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </span>
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="px-2 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 rtl:pl-3 rtl:pr-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-0.5">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="text-xs font-medium text-primary hover:underline"
            >
              Select all{searchQuery ? " (filtered)" : ""}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground hover:underline"
            >
              Clear
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="max-h-[280px] overflow-y-auto px-1 pb-1 border-t"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              overscrollBehavior: "contain",
              scrollbarWidth: "thin",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              <div className="space-y-0.5 py-1">
                {filteredOptions.map((option, idx) => {
                  const checked = values.includes(option.value);
                  const isMissing = option.variant === "missing";
                  // Divider after the pinned "missing" option so it reads as
                  // separate from the real values that follow it.
                  const nextIsRegular =
                    isMissing && filteredOptions[idx + 1]?.variant !== "missing";
                  return (
                    <React.Fragment key={option.value}>
                      <button
                        onClick={() => toggleValue(option.value)}
                        className={cn(
                          "relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground touch-manipulation",
                          checked && !isMissing && "bg-accent/60",
                          isMissing &&
                            "border border-dashed border-amber-400/60 dark:border-amber-500/40",
                          isMissing && checked && "bg-amber-100 dark:bg-amber-950/40"
                        )}
                        type="button"
                      >
                        <span
                          className={cn(
                            "mr-2 rtl:mr-0 rtl:ml-2 flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-colors",
                            checked
                              ? isMissing
                                ? "bg-amber-500 border-amber-500"
                                : "bg-primary border-primary"
                              : "border-input"
                          )}
                        >
                          {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            isMissing && "italic text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {option.label}
                        </span>
                      </button>
                      {nextIsRegular && (
                        <div className="my-1 border-t border-dashed" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
