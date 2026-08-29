'use client';

// Design tokens — same white/peach minimalist system as the product page.
const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';

export default function ColorSizeSelector({ variants, activeVariant, onColorChange, activeSize, onSizeChange, categoryType }) {
  const isJewellery = categoryType === 'jewellery';
  const sizeStock = (size) => activeVariant?.sizes?.find((s) => s.size === size)?.stock ?? 0;

  const hasColors = variants?.some((v) => v.color && v.color.trim());

  return (
    <div className="space-y-6">

      {/* Color selector */}
      {hasColors && (
        <div>
          <p className="text-sm mb-2.5" style={{ color: INK_SOFT }}>
            {isJewellery ? 'Material/Colour' : 'Color'}
            {' '}
            <span className="font-medium" style={{ color: INK }}>{activeVariant?.color}</span>
          </p>

          <div className="flex gap-2.5 flex-wrap">
            {variants.map((v) => {
              const isActive = activeVariant?._id === v._id;
              return (
                <button
                  key={v._id}
                  onClick={() => onColorChange(v)}
                  title={v.color}
                  className="relative w-8 h-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: v.colorHex || '#ccc',
                    boxShadow: isActive ? `0 0 0 2px ${PAPER}, 0 0 0 3.5px ${PEACH}` : `0 0 0 1px ${LINE}`,
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Jewellery attributes — plain labels separated by a dot, no chips */}
      {isJewellery && (activeVariant?.material || activeVariant?.purity || activeVariant?.weight > 0) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" style={{ color: INK_SOFT }}>
          {[activeVariant?.material, activeVariant?.purity, activeVariant?.weight > 0 ? `${activeVariant.weight}g` : null]
            .filter(Boolean)
            .map((label, i, arr) => (
              <span key={label} className="flex items-center gap-2">
                <span style={{ color: INK }}>{label}</span>
                {i < arr.length - 1 && <span style={{ color: LINE }}>·</span>}
              </span>
            ))}
        </div>
      )}

      {/* Size selector */}
      <div>
        <p className="text-sm mb-2.5" style={{ color: INK_SOFT }}>
          {isJewellery ? 'Ring/Bangle Size' : 'Size'}
        </p>

        <div className="flex gap-2 flex-wrap">
          {activeVariant?.sizes?.map((s) => {
            const outOfStock = s.stock <= 0;
            const active = activeSize === s.size;
            return (
              <button
                key={s.size}
                disabled={outOfStock}
                onClick={() => onSizeChange(s.size)}
                className="min-w-[40px] h-[36px] px-2.5 text-sm font-medium transition-colors"
                style={{
                  borderRadius: '4px',
                  border: `1px solid ${outOfStock ? LINE : active ? INK : LINE}`,
                  background: active ? INK : PAPER,
                  color: outOfStock ? '#D6C9BE' : active ? PAPER : INK,
                  textDecoration: outOfStock ? 'line-through' : 'none',
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {s.size}
              </button>
            );
          })}
        </div>

        {activeSize && sizeStock(activeSize) <= 5 && sizeStock(activeSize) > 0 && (
          <p className="mt-2.5 text-xs font-medium" style={{ color: PEACH }}>
            Only {sizeStock(activeSize)} left in stock
          </p>
        )}
      </div>
    </div>
  );
}