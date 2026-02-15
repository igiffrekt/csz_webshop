"use client";

import { useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, ArrowUpDown, Tags, Folder, ChevronDown, ChevronRight, Package, Check } from "lucide-react";

interface CategoryItem {
  name: string;
  slug: string;
  productCount?: number;
  children?: CategoryItem[];
}

interface CategoryFiltersProps {
  categories?: CategoryItem[];
  subcategories?: CategoryItem[];
  categorySlug: string;
  categoryName?: string;
  className?: string;
}

// Sort options grouped by type
const SORT_OPTIONS = {
  price: [
    { value: "basePrice:asc", label: "Ár: Alacsony → Magas" },
    { value: "basePrice:desc", label: "Ár: Magas → Alacsony" },
  ],
  name: [
    { value: "name:asc", label: "Név: A → Z" },
    { value: "name:desc", label: "Név: Z → A" },
  ],
  date: [
    { value: "createdAt:desc", label: "Legújabb elöl" },
    { value: "createdAt:asc", label: "Legrégebbi elöl" },
  ],
} as const;

// Category color palette for visual distinction
const CATEGORY_COLORS = [
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", icon: "text-rose-500" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", icon: "text-cyan-500" },
];

export function CategoryFilters({
  categories = [],
  subcategories = [],
  categorySlug,
  categoryName,
  className
}: CategoryFiltersProps) {
  const router = useRouter();
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Subcategory filter
  const [subcategory, setSubcategory] = useQueryState(
    "alkategoria",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  // Sort filter
  const [sort, setSort] = useQueryState(
    "rendezes",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  const hasCategories = categories.length > 0;
  const hasSubcategories = subcategories.length > 0;

  // Handle category change - navigate to the new category page
  const handleCategoryChange = (slug: string) => {
    setCategoryOpen(false);
    if (slug === "all") {
      router.push("/termekek");
    } else if (slug !== categorySlug) {
      router.push(`/kategoriak/${slug}`);
    }
  };

  // Find current category info
  const currentCategory = categories.find(cat =>
    cat.slug === categorySlug || cat.children?.some(child => child.slug === categorySlug)
  );
  const currentCategoryName = categoryName || currentCategory?.name || "Kategória";

  return (
    <div className={cn("flex flex-wrap gap-3 items-center", className)}>
      {/* Filter icon label */}
      <div className="flex items-center gap-2 text-gray-600 mr-2">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline">Szűrés:</span>
      </div>

      {/* Category picker with popover - 3 column grid on desktop */}
      {hasCategories && (
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white hover:bg-gray-50 transition-colors min-w-[200px]">
              <Folder className="h-4 w-4 text-gray-500" />
              <span className="flex-1 text-left text-sm truncate">{currentCategoryName}</span>
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-400 transition-transform",
                categoryOpen && "rotate-180"
              )} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[90vw] max-w-[700px] p-0"
            align="start"
            sideOffset={8}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gray-50/80">
              <h3 className="font-semibold text-gray-900">Kategóriák</h3>
              <p className="text-xs text-gray-500 mt-0.5">Válasszon kategóriát a termékek szűréséhez</p>
            </div>

            {/* All products option */}
            <button
              onClick={() => handleCategoryChange("all")}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">Összes termék</span>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
            </button>

            {/* Categories grid - 3 columns on desktop */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {categories.map((cat, index) => {
                const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                const isCurrentParent = cat.slug === categorySlug || cat.children?.some(c => c.slug === categorySlug);

                return (
                  <div
                    key={cat.slug}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      colors.bg,
                      colors.border,
                      isCurrentParent && "ring-2 ring-offset-1 ring-amber-400"
                    )}
                  >
                    {/* Parent category */}
                    <button
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={cn(
                        "w-full flex items-center gap-2 group",
                        cat.slug === categorySlug && "font-semibold"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        cat.slug === categorySlug ? "bg-amber-400 text-white" : `bg-white/80 ${colors.icon}`
                      )}>
                        <Folder className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "text-sm font-medium group-hover:text-amber-600 transition-colors",
                          colors.text
                        )}>
                          {cat.name}
                        </div>
                        <div className="text-xs text-gray-500">
                            termék
                          </div>
                      </div>
                      {cat.slug === categorySlug && (
                        <Check className="h-4 w-4 text-amber-500" />
                      )}
                    </button>

                    {/* Children categories */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/50 space-y-1">
                        {cat.children.map((child) => (
                          <button
                            key={child.slug}
                            onClick={() => handleCategoryChange(child.slug)}
                            className={cn(
                              "w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left text-sm transition-colors",
                              "hover:bg-white/60",
                              child.slug === categorySlug
                                ? "bg-white/80 font-medium text-amber-700"
                                : "text-gray-600"
                            )}
                          >
                            <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="flex-1 truncate">{child.name}</span>
                            {child.slug === categorySlug && (
                              <Check className="h-3 w-3 text-amber-500 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Subcategory dropdown - only show if there are subcategories */}
      {hasSubcategories && (
        <Select
          value={subcategory ?? "all"}
          onValueChange={(v) => setSubcategory(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-auto min-w-[180px] border-gray-200 rounded-full bg-white">
            <Tags className="h-4 w-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Alkategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-xs text-gray-500 uppercase tracking-wider">
                Alkategóriák
              </SelectLabel>
              <SelectItem value="all">Összes alkategória</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub.slug} value={sub.slug}>
                  <span className="flex items-center justify-between gap-4">
                    {sub.name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Sort dropdown with grouped options */}
      <Select
        value={sort ?? "createdAt:desc"}
        onValueChange={(v) => setSort(v === "createdAt:desc" ? null : v)}
      >
        <SelectTrigger className="w-auto min-w-[200px] border-gray-200 rounded-full bg-white">
          <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
          <SelectValue placeholder="Rendezés" />
        </SelectTrigger>
        <SelectContent>
          {/* Price group */}
          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 uppercase tracking-wider">
              Ár szerint
            </SelectLabel>
            {SORT_OPTIONS.price.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>

          {/* Name group */}
          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 uppercase tracking-wider">
              Név szerint
            </SelectLabel>
            {SORT_OPTIONS.name.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>

          {/* Date group */}
          <SelectGroup>
            <SelectLabel className="text-xs text-gray-500 uppercase tracking-wider">
              Dátum szerint
            </SelectLabel>
            {SORT_OPTIONS.date.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
