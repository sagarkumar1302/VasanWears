import React, { useEffect, useRef, useState } from "react";

// Simple custom select for font families that can open upward when needed
const FontSelect = ({ value, onChange, options = [], placeholder = "Select font" }) => {
  const ref = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const approxListH = Math.min(300, options.length * 42 + 8);
    // open upward if not enough space below or on small screens
    const shouldOpenUp = (rect.bottom + approxListH > viewportH - 10) || window.innerWidth < 640;
    setOpenUp(shouldOpenUp);
    // ensure list fits
    if (listRef.current) {
      listRef.current.style.maxHeight = `${Math.min(approxListH, viewportH - 40)}px`;
    }
  }, [open, options.length]);

  const handleToggle = () => setOpen((o) => !o);

  const handleSelect = (val) => {
    onChange && onChange({ target: { value: val } });
    setOpen(false);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-left text-gray-900 text-sm outline-none focus:border-gray-900 flex items-center justify-between"
        onClick={handleToggle}
      >
        <span style={{ fontFamily: selected ? selected.value : undefined }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          className={`absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded shadow overflow-auto ${openUp ? "bottom-full mb-2" : "top-full mt-2"}`}
          style={{ listStyle: "none" }}
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => handleSelect(o.value)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-3 ${o.value === value ? "bg-gray-100" : ""}`}
                style={{ fontFamily: o.value }}
              >
                <span className="truncate">{o.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FontSelect;
