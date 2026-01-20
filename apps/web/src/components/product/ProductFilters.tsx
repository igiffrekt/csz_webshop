"use client";

import { useQueryState, parseAsString, parseAsArrayOf } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import type { Category } from "@csz/types";

interface ProductFiltersProps {
  categories: Category[];
}

// Fire class options for fire safety equipment
const FIRE_CLASSES = ["A", "B", "C"] as const;

// Common certifications for fire safety equipment
const CERTIFICATIONS = ["CE", "EN3"] as const;

export function ProductFilters({ categories }: ProductFiltersProps) {
  const t = useTranslations("products");

  // Category filter
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  // Fire class filter (single select dropdown)
  const [fireClass, setFireClass] = useQueryState(
    "fireClass",
    parseAsString.withOptions({
      shallow: false,
    })
  );

  // Certification filter (multi-select checkboxes)
  const [certifications, setCertifications] = useQueryState(
    "cert",
    parseAsArrayOf(parseAsString, ",").withOptions({
      shallow: false,
    })
  );

  const handleCertificationChange = (cert: string, checked: boolean) => {
    const current = certifications ?? [];
    if (checked) {
      setCertifications([...current, cert]);
    } else {
      const updated = current.filter((c) => c !== cert);
      setCertifications(updated.length > 0 ? updated : null);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      {/* Category dropdown */}
      <Select
        value={category ?? "all"}
        onValueChange={(v) => setCategory(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allCategories")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.documentId} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Fire class dropdown */}
      <Select
        value={fireClass ?? "all"}
        onValueChange={(v) => setFireClass(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("allFireClasses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allFireClasses")}</SelectItem>
          {FIRE_CLASSES.map((fc) => (
            <SelectItem key={fc} value={fc}>
              {t("fireClass")} {fc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Certification checkboxes */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t("certifications")}</span>
        <div className="flex gap-4">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={`cert-${cert}`}
                checked={(certifications ?? []).includes(cert)}
                onCheckedChange={(checked) =>
                  handleCertificationChange(cert, checked === true)
                }
              />
              <Label htmlFor={`cert-${cert}`} className="text-sm cursor-pointer">
                {cert}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
