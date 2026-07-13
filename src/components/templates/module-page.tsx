type ModulePageProps = {
  title: string;
  description: string;
};

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
        Este módulo se implementará en la siguiente fase.
      </div>
    </div>
  );
}
