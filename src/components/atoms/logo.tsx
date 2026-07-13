import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  showText?: boolean;
  imageClassName?: string;
  className?: string;
};

const LOGO_SRC = "/logo_mi_conduccion_sin_fondo.png";

export function Logo({
  href = "/dashboard",
  showText = true,
  imageClassName,
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Mi Conducción"
        className={cn("h-7 w-7 object-contain", imageClassName)}
      />
      {showText && <span>Mi Conducción</span>}
    </Link>
  );
}
