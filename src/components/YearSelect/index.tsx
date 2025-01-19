import { useAtom } from "jotai";
import { ChangeEvent } from "react";
import { yearAtom } from "../../state";
import { CURRENT_YEAR, YEARS_BACK } from "../../services/constants";

import "./index.css";

export default function YearSelect({ className }: { className?: string }) {
  const [year, setYear] = useAtom(yearAtom);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newYear = event.target.value;
    if (newYear != null) {
      setYear(newYear);
    }
  };

  return (
    <select
      className={`year-select ${className ?? ""}`}
      onChange={handleChange}
      value={year}
    >
      {Array(YEARS_BACK)
        .fill(0)
        .map((_, i) => {
          const yearStr = String(Number(CURRENT_YEAR) - i);
          return (
            <option key={yearStr} value={yearStr}>
              {yearStr}
            </option>
          );
        })}
    </select>
  );
}
