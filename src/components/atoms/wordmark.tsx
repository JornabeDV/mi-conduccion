import Link from "next/link";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  href?: string;
  className?: string;
};

const TEXT_LOGO_LIGHT = "/sin_logo_mi_conduccion_sin_fondo.png";
const TEXT_LOGO_DARK = "/sin_logo_mi_conduccion_negro_sin_fondo.png";

export function Wordmark({ href = "/dashboard", className }: WordmarkProps) {
  return (
    <Link href={href} className={cn("inline-flex", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TEXT_LOGO_LIGHT}
        alt="Mi Conducción"
        className="h-7 w-auto object-contain dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TEXT_LOGO_DARK}
        alt="Mi Conducción"
        className="hidden h-7 w-auto object-contain dark:block"
      />
    </Link>
  );
}
