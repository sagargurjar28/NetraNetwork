/** Gender-aware SVG silhouettes for person nodes. */
export function Avatar({ gender = 'neutral', className = 'h-9 w-9 shrink-0 text-text-secondary' }: { gender?: 'male' | 'female' | 'neutral'; className?: string }) {
  if (gender === 'male') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden>
        <path d="M6 28c0-6 4-9 10-9s10 3 10 9v1H6v-1z" fill="currentColor" opacity="0.85" />
        <path d="M9 14c0-5 2-9 7-9s7 4 7 9c0 4-3 7-7 7s-7-3-7-7z" fill="currentColor" />
        <path d="M8 12c-1-6 3-10 8-10s9 4 8 10c-2-3-4-4-4-4s0 2-1 2-1-3-3-3-2 4-5 4-2 0-3 1z" fill="currentColor" opacity="0.55" />
      </svg>
    )
  }
  if (gender === 'female') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden>
        <path d="M22 8c3 1 5 4 5 8 0 4-2 7-4 8l1 4h-3l-1-5c-1 1-1 1-1-1V8h3z" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
        <circle cx="15" cy="12" r="7" fill="currentColor" />
        <path d="M7 28c0-6 3.5-9 8-9s8 3 8 9v1H7v-1z" fill="currentColor" opacity="0.85" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="11" r="6.5" fill="currentColor" />
      <path d="M7 28c0-6 4-9 9-9s9 3 9 9v1H7v-1z" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

export function BuildingGlyph({ className = 'h-9 w-9 shrink-0 text-text-secondary' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M6 28V10l10-6 10 6v18h-6v-7h-8v7H6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 14h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2z" fill="currentColor" />
    </svg>
  )
}

export function PhoneGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M11 4h10a2 2 0 012 2v20a2 2 0 01-2 2H11a2 2 0 01-2-2V6a2 2 0 012-2zm3 21h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function PinGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M16 3c6 0 10 4 10 9 0 7-10 17-10 17S6 19 6 12c0-5 4-9 10-9zm0 12.5A3.5 3.5 0 1016 8.5a3.5 3.5 0 000 7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function DocGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M8 3h11l7 7v19H8V3zm11 0v7h7M12 15h8m-8 5h8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function NoteGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M6 5h16l4 4v18H6V5zm4 8h12m-12 5h12m-12 5h7" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function CaseGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M4 9a2 2 0 012-2h7l3 3h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function FirGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M16 3c3 5 8 8 8 14a8 8 0 01-16 0c0-3 2-5 3-7 .5 2 1.5 3 3 3-.5-4 0-7 2-10z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function BankGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-text-secondary" aria-hidden>
      <path d="M4 12l12-7 12 7M6 12v12m5-12v12m5-12v12m5-12v12m5-12v12M4 26h24" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
