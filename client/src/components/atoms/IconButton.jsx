/**
 * IconButton — atom. Props: icon (rendered children, e.g. an SVG or glyph),
 * onClick, ariaLabel. Real semantic <button>, always with an accessible label.
 */
export default function IconButton({ icon, onClick, ariaLabel, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/20 hover:border-ink transition-colors ${className}`}
    >
      {icon}
    </button>
  );
}
