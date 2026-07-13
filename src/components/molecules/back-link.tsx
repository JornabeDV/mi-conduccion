"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Volver" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-fit -ml-2 text-muted-foreground hover:text-foreground")}
    >
      <ChevronLeft className="mr-1 size-4" />
      {label}
    </Link>
  );
}
