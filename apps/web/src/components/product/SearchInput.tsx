"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  className?: string;
}

export function SearchInput({ className }: SearchInputProps) {
  const t = useTranslations("products");
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withOptions({
      throttleMs: 500,
      shallow: false, // Trigger server re-render
    })
  );

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t("search")}
        value={search ?? ""}
        onChange={(e) => setSearch(e.target.value || null)}
        className="pl-10 h-11 sm:h-10 rounded-full"
      />
    </div>
  );
}
