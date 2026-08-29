'use client';

export default function PrintButton({ label = 'Print / Save as PDF' }) {
  return (
    <div className="text-center mt-6 print:hidden">
      <button
        onClick={() => window.print()}
        className="bg-pink-600 text-white rounded-full px-7 py-2.5 text-sm font-medium tracking-wide transition-colors hover:bg-pink-700"
      >
        {label}
      </button>
    </div>
  );
}