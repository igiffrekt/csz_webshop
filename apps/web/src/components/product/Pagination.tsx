"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: false,
    })
  );

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 sm:py-8">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        {t("showing", { page: currentPage, total: totalPages })}
      </p>
      <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="default"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="flex-1 sm:flex-none h-11 sm:h-10 min-w-[44px] rounded-full"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previous")}
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="flex-1 sm:flex-none h-11 sm:h-10 min-w-[44px] rounded-full"
        >
          {t("next")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </nav>
  );
}
