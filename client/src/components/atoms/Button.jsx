const VARIANTS = {
  accent1: "bg-accent text-ink border-ink",
  accent2: "bg-primary text-ink border-ink",
  outline: "bg-canvas text-ink border-ink",
};

/**
 * Button — atom. Props: variant ('accent1' | 'accent2' | 'outline'), onClick, children.
 * Matches the Figma "BUTTON" component: black border, black text always,
 * Geist Mono label. Figma showed the label at 32px for visibility on the
 * design sheet — scaled down here to a usable real-world button size.
 */
export default function Button({ variant = "outline", onClick, children, type = "button", className = "", disabled = false }) {
  const styles = VARIANTS[variant] ?? VARIANTS.outline;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles} border font-mono uppercase tracking-wide text-sm px-6 py-3 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
