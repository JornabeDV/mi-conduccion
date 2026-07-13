import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">
        M
      </span>
      <span>Mi Conducción</span>
    </Link>
  );
}
