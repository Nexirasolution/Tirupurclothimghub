'use client';

export default function ColorSizeSelector({ variants, activeVariant, onColorChange, activeSize, onSizeChange, categoryType }) {
  const isJewellery = categoryType === 'jewellery';
  const sizeStock = (size) => activeVariant?.sizes?.find((s) => s.size === size)?.stock ?? 0;

  const hasColors = variants?.some((v) => v.color && v.color.trim());

  return (
    <div className="space-y-5 p-4 rounded-xl bg-pink-50/50 border border-pink-100">

      {/* Color selector */}
      {hasColors && (
        <>
          <div>
            <p className="text-sm font-semibold mb-2.5 text-neutral-900">
              {isJewellery ? 'Material/Colour:' : 'Color:'}{' '}
              <span className="text-pink-600">{activeVariant?.color}</span>
            </p>

            <div className="flex gap-2 flex-wrap">
              {variants.map((v) => {
                const isActive = activeVariant?._id === v._id;
                return (
                  <button
                    key={v._id}
                    onClick={() => onColorChange(v)}
                    title={v.color}
                    className="relative w-9 h-9 rounded-full transition-transform"
                    style={{
                      backgroundColor: v.colorHex || '#ccc',
                      border: isActive ? '2px solid #DB2777' : '2px solid #fff',
                      boxShadow: isActive ? '0 0 0 2px #DB2777' : '0 0 0 1px #e5e5e5',
                      transform: isActive ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-pink-100" />
        </>
      )}

      {/* Jewellery attribute chips */}
      {isJewellery && (activeVariant?.material || activeVariant?.purity || activeVariant?.weight > 0) && (
        <>
          <div className="flex flex-wrap gap-2">
            {activeVariant?.material && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-600">
                {activeVariant.material}
              </span>
            )}
            {activeVariant?.purity && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-600">
                {activeVariant.purity}
              </span>
            )}
            {activeVariant?.weight > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-pink-200 text-pink-600">
                {activeVariant.weight}g
              </span>
            )}
          </div>
          <div className="h-px bg-pink-100" />
        </>
      )}

      {/* Size selector */}
      <div>
        <p className="text-sm font-semibold mb-2.5 text-neutral-900">
          {isJewellery ? 'Ring/Bangle Size:' : 'Size:'}
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
                className={`min-w-[42px] h-[38px] px-2.5 rounded-lg text-sm font-medium transition-all border ${
                  outOfStock
                    ? 'border-neutral-100 bg-neutral-50 text-neutral-300 line-through cursor-not-allowed'
                    : active
                    ? 'border-pink-600 bg-pink-600 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-pink-300'
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>

        {activeSize && sizeStock(activeSize) <= 5 && sizeStock(activeSize) > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-r-md py-1.5 px-2.5 text-pink-600 bg-pink-50 border-l-2 border-pink-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Only {sizeStock(activeSize)} left in stock!
          </div>
        )}
      </div>
    </div>
  );
}