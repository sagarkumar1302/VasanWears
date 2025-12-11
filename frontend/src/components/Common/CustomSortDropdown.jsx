import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { useState } from "react";

export default function CustomSortDropdown({ setSortType }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Sort (Default)"); // default option

  const options = [
    { label: "Sort (Default)", value: "default" },        // RESET OPTION
    { label: "Price: Low to High", value: "low-to-high" },
    { label: "Price: High to Low", value: "high-to-low" },
  ];

  const handleSelect = (option) => {
    setSelected(option.label);
    setSortType(option.value);
    setOpen(false);
  };

  return (
    <div className="relative w-55">
      {/* Selected Box */}
      <div
        className="border border-primary5 px-4 py-2 rounded-md cursor-pointer bg-white text-gray-800 flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span>{selected}</span>
        <span className="ml-2">{!open? <RiArrowDownSLine/>:<RiArrowUpSLine/>}</span>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-primary5 rounded-md shadow-md z-10">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className={`px-4 py-2 cursor-pointer hover:bg-primary5 hover:text-white ${
                selected === opt.label ? "bg-primary5 text-white" : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
