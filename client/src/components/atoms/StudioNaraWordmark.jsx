/**
 * StudioNaraWordmark — atom. Live-text recreation of the Figma "STUDIO NARA
 * TEXT LOGO" component (hand-placed, individually rotated Geist Pixel
 * letters). Each letter's x/y center, rotation and font-size below were
 * measured directly from that Figma node so the layout matches exactly.
 * Rendered as SVG (viewBox-scaled) instead of a raster PNG so it stays crisp
 * at any size/pixel-density and scales consistently from phone to desktop.
 */
const LETTERS = [
  { char: "S", x: 54.84, y: 106.45, rotate: -9.26, size: 155.93 },
  { char: "t", x: 120.61, y: 108.0, rotate: 6.54, size: 95.274 },
  { char: "u", x: 181.38, y: 106.5, rotate: 0, size: 135.583 },
  { char: "d", x: 245.3, y: 107.14, rotate: -9.08, size: 95.274 },
  { char: "i", x: 300.89, y: 106.42, rotate: 0, size: 120.346 },
  { char: "o", x: 345.09, y: 106.3, rotate: 0, size: 95.274 },
  { char: "N", x: 450.94, y: 95.18, rotate: -5.46, size: 139.509 },
  { char: "a", x: 523.69, y: 110.29, rotate: 0, size: 95.274 },
  { char: "r", x: 586.28, y: 105.63, rotate: 10.62, size: 116.522 },
  { char: "a", x: 652.56, y: 101.38, rotate: -5.99, size: 122.495 },
];

export default function StudioNaraWordmark({ className = "w-full h-auto" }) {
  return (
    <svg
      viewBox="0 0 695.573 212.905"
      role="img"
      aria-label="Studio Nara"
      className={`${className} text-primary font-pixel`}
    >
      {LETTERS.map((letter, i) => (
        <text
          key={i}
          x={letter.x}
          y={letter.y}
          fontSize={letter.size}
          transform={`rotate(${letter.rotate} ${letter.x} ${letter.y})`}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current"
        >
          {letter.char}
        </text>
      ))}
    </svg>
  );
}
