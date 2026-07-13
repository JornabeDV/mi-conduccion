import { Logo } from "@/components/atoms/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
      <div className="mb-6">
        <Logo href="/" showText={false} imageClassName="h-36 w-36" />
      </div>
      <div className="w-full max-w-sm space-y-6">{children}</div>
    </div>
  );
}
