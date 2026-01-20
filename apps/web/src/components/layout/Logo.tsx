import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
        CSZ
      </span>
      <span className="hidden sm:inline text-sm text-muted-foreground">
        Tűzvédelmi eszközök
      </span>
    </Link>
  );
}
