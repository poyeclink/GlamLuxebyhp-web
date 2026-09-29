import { cn } from "@/lib/utils";
import { type Locale } from "@/lib/i18n";
import { setLocaleAction } from "@/server/actions/locale-actions";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher({ locale, inverse }: { locale: Locale; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.2em]">
      {LOCALE_OPTIONS.map((option, index) => (
        <div key={option.value} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className={inverse ? "text-inverse-border" : "text-border"}>
              |
            </span>
          )}
          <form action={setLocaleAction.bind(null, option.value)}>
            <button
              type="submit"
              aria-current={option.value === locale}
              disabled={option.value === locale}
              className={cn(
                "relative py-1 transition-colors duration-300 disabled:cursor-default",
                "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:scale-x-0 after:transition-[scale] after:duration-300 aria-[current=true]:after:scale-x-100",
                inverse
                  ? "text-inverse-muted hover:text-inverse-foreground aria-[current=true]:text-inverse-foreground after:bg-inverse-accent"
                  : "text-muted-foreground hover:text-foreground aria-[current=true]:text-foreground after:bg-accent",
              )}
            >
              {option.label}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
