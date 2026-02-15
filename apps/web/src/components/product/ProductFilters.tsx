"use client";

import { useQueryState, parseAsString } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
  id?: number;
  parent?: { _id: string; name: string; slug: string } | null;
}

interface ProductFiltersProps {
  categories: Category[];
  className?: string;
}

// Sort options
const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Legújabb" },
  { value: "basePrice:asc", label: "Ár szerint növekvő" },
  { value: "basePrice:desc", label: "Ár szerint csökkenő" },
  { value: "name:asc", label: "Név szerint" },
] as const;

export function ProductFilters({ categories, className }: ProductFiltersProps) {
  const t = useTranslations("products");

  // Category filter
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  // Sort filter - use 'sort' to match page.tsx
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  return (
    <div className={cn("flex flex-wrap gap-3 items-center", className)}>
      {/* Category dropdown */}
      <Select
        value={category ?? "all"}
        onValueChange={(v) => setCategory(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-auto min-w-[180px] border-gray-200 rounded-full bg-white">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories
            .filter((cat) => !cat.parent)
            .map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Sort dropdown */}
      <Select
        value={sort ?? "createdAt:desc"}
        onValueChange={(v) => setSort(v === "createdAt:desc" ? null : v)}
      >
        <SelectTrigger className="w-auto min-w-[160px] border-gray-200 rounded-full bg-white">
          <SelectValue placeholder="Rendezés" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
