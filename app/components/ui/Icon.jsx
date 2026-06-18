/**
 * Icon set — minimal line icons, 24px grid, stroke = currentColor.
 * Deliberately thin and quiet to match the editorial aesthetic. Sized via the
 * `.icon-btn svg` rule (or pass width/height). Every icon is aria-hidden; label
 * the interactive parent instead.
 */

/** @param {import('react').SVGProps<SVGSVGElement>} props */
function Svg(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function AccountIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </Svg>
  );
}

export function BagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 7h12l1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 7Z" />
      <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    </Svg>
  );
}

/** Minimal two-line "menu" — luxury restraint over the 3-line default. */
export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Svg {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}
