import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  showText?: boolean;
  imageClassName?: string;
  className?: string;
};

const LOGO_LIGHT = "/logo_mi_conduccion_completo_sin_fondo.png";
const LOGO_DARK = "/logo_mi_conduccion_completo_negro_sin_fondo.png";

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
        "flex items-center justify-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span
        className={cn(
          "relative block overflow-hidden dark:hidden",
          imageClassName
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_LIGHT}
          alt="Mi Conducción"
          className="h-full w-full object-contain"
        />
      </span>
      <span
        className={cn(
          "relative hidden overflow-hidden dark:block",
          imageClassName
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_DARK}
          alt="Mi Conducción"
          className="h-full w-full object-contain"
        />
      </span>
      {showText && <span>Mi Conducción</span>}
    </Link>
  );
}
