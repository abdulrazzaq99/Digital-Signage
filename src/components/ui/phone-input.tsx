"use client";
/**
 * Phone field: a searchable country picker (flag, name, dialling code) joined to a number input that
 * formats as you type for that country. The value is the number in E.164 form (+923001234567) or "".
 * Works with <Field> (id/aria props go to the number input) and react-hook-form's <Controller>.
 */
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { COUNTRIES, countryByCode, defaultCountry, formatNational, splitPhone, toE164, type CountryCode } from "@/lib/phone";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
  value: string | null | undefined;
  onChange: (e164: string) => void;
  onBlur?: () => void;
  /** Country used for an empty field; defaults to the browser's region. */
  defaultCountry?: CountryCode;
  id?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function PhoneInput({ value, onChange, onBlur, defaultCountry: fallback, id, name, disabled, placeholder, autoComplete = "tel-national", className, ref, ...aria }: PhoneInputProps) {
  const initialCountry = useMemo(() => fallback ?? defaultCountry(), [fallback]);
  const [country, setCountry] = useState<CountryCode>(() => splitPhone(value, initialCountry).country);
  const [digits, setDigits] = useState(() => splitPhone(value, initialCountry).national);
  const [seenValue, setSeenValue] = useState(value ?? "");

  // A value set from outside (form reset, record loaded) replaces what's being edited; our own
  // edits come back as the same number, so they're left alone.
  if ((value ?? "") !== seenValue) {
    setSeenValue(value ?? "");
    if ((value ?? "") !== toE164(country, digits)) {
      const next = splitPhone(value, country);
      setCountry(next.country);
      setDigits(next.national);
    }
  }

  const emit = (c: CountryCode, d: string) => onChange(toE164(c, d));

  const selected = countryByCode(country);
  const invalid = aria["aria-invalid"];

  return (
    <div
      className={cn(
        "flex h-11 w-full items-stretch rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 sm:h-10",
        invalid && "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20",
        disabled && "bg-slate-50",
        className,
      )}
    >
      <CountryPicker
        value={country}
        disabled={disabled}
        onChange={(c) => {
          setCountry(c);
          emit(c, digits);
        }}
      />
      <input
        ref={ref}
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder={placeholder ?? (selected ? `Number in ${selected.name}` : "Phone number")}
        value={formatNational(country, digits)}
        onChange={(e) => {
          // Typing or pasting a full international number (+44…) switches the country too.
          const raw = e.target.value;
          if (raw.trim().startsWith("+")) {
            const parsed = splitPhone(raw.replace(/[^\d+]/g, ""), country);
            setCountry(parsed.country);
            setDigits(parsed.national.slice(0, 17));
            emit(parsed.country, parsed.national);
            return;
          }
          const d = raw.replace(/\D/g, "").slice(0, 17);
          setDigits(d);
          emit(country, d);
        }}
        onBlur={onBlur}
        className="min-w-0 flex-1 rounded-r-lg bg-transparent px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 disabled:text-slate-500 sm:text-sm"
        {...aria}
      />
    </div>
  );
}

/** Flag + dialling code button that opens a searchable list of every country. */
function CountryPicker({ value, onChange, disabled }: { value: CountryCode; onChange: (c: CountryCode) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = countryByCode(value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.slice(1).startsWith(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (c: CountryCode) => {
    onChange(c);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(matches.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const c = matches[active]; if (c) choose(c.code); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  return (
    <div ref={root} className="relative flex">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // Open with the search cleared and the current country highlighted.
          if (!open) {
            setQuery("");
            setActive(Math.max(0, COUNTRIES.findIndex((c) => c.code === value)));
          }
          setOpen(!open);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country: ${selected?.name ?? value} ${selected?.dial ?? ""}`}
        className="flex items-center gap-1.5 rounded-l-lg border-r border-slate-200 px-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:pointer-events-none"
      >
        <span className="text-lg leading-none" aria-hidden>{selected?.flag}</span>
        <span className="tabular-nums">{selected?.dial}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg animate-pop-in">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value.slice(0, 40)); setActive(0); }}
              onKeyDown={onKey}
              placeholder="Search country or code"
              aria-label="Search countries"
              aria-controls={listId}
              aria-activedescendant={matches[active] ? `${listId}-${matches[active].code}` : undefined}
              className="h-9 w-full rounded-md border border-slate-200 pl-7 pr-2 text-base outline-none focus:border-blue-500 sm:text-sm"
            />
          </div>
          <ul ref={list} id={listId} role="listbox" aria-label="Countries" className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {matches.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No countries match &ldquo;{query}&rdquo;</li>}
            {matches.map((c, i) => (
              <li
                key={c.code}
                id={`${listId}-${c.code}`}
                data-index={i}
                role="option"
                aria-selected={c.code === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c.code)}
                className={cn("flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm sm:py-1.5", i === active ? "bg-blue-50" : "hover:bg-slate-50")}
              >
                <span className="text-lg leading-none" aria-hidden>{c.flag}</span>
                <span className="min-w-0 flex-1 truncate text-slate-800">{c.name}</span>
                <span className="tabular-nums text-xs text-slate-400">{c.dial}</span>
                {c.code === value && <Check className="h-3.5 w-3.5 text-blue-600" aria-hidden />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
