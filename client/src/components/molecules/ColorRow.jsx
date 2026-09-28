import ColorPicker from '../organisms/ColorPicker.jsx'

/**
 * ColorRow — molecule. Props: hex, name, onNameChange, onHexChange, onRemove,
 * onAddHarmonyColor. Repeats inside ColorPaletteSection on the Brand kit
 * builder screen. The swatch opens a ColorPicker popover (wheel + lightness
 * slider + hex/rgb/hsl/oklch fields + color-harmony suggestions).
 */
export default function ColorRow({ hex, name, onNameChange, onHexChange, onRemove, onAddHarmonyColor }) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2">
      <ColorPicker hex={hex} onChange={onHexChange} onAddHarmonyColor={onAddHarmonyColor} />
      <span className="font-mono text-small text-ink/70 shrink-0">{hex}</span>
      <label className="sr-only" htmlFor={`color-name-${hex}`}>
        Color name
      </label>
      <input
        id={`color-name-${hex}`}
        type="text"
        value={name}
        onChange={(e) => onNameChange?.(e.target.value)}
        className="flex-1 bg-transparent text-body outline-none min-w-0"
        placeholder="name this color"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name || hex}`}
        className="text-ink/50 hover:text-ink shrink-0"
      >
        ×
      </button>
    </div>
  );
}
