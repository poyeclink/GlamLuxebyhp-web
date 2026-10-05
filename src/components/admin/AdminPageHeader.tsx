import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  back,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:gap-5 sm:pb-8">
      {back && (
        <Link
          href={back.href}
          className="group -my-1.5 -ml-2 flex min-h-10 w-fit items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {eyebrow && <span className="eyebrow text-accent">{eyebrow}</span>}
          <h1 className="font-display text-[1.75rem] leading-tight text-foreground sm:text-4xl">{title}</h1>
          {description && (
            <div className="max-w-2xl text-sm text-muted-foreground">{description}</div>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:[&>a]:flex-1 max-sm:[&>a>button]:w-full">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
