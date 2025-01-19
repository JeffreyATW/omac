import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import Arrow from "../Arrow";
import { useAtom, useAtomValue } from "jotai";
import { exportingAtom, yearAtom } from "../../state";
// @ts-expect-error no declaration file
import html2canvas from "../../vendor/html2canvas";

import copy from "../../assets/copy.svg";
import download from "../../assets/download.svg";
import { CURRENT_YEAR } from "../../services/constants";
import { Totals } from "../../types";
import NameField from "../NameField";
import YearSelect from "../YearSelect";

import "./index.css";

function formatDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

let shadow = "";
for (let i = 0; i < 10; i++) {
  shadow += `${(shadow ? "," : "") + -i * 1}px ${i * 1}px 0 #000`;
}

export default function Results({
  exportRef,
  totals,
}: {
  exportRef: React.RefObject<HTMLDivElement | null>;
  totals: Totals;
}) {
  const wobble = useRef<number>(null);
  const [copied, setCopied] = useState(false);
  const year = useAtomValue(yearAtom);
  const [exporting, setExporting] = useAtom(exportingAtom);

  if (wobble.current == null) {
    wobble.current = Math.random() * 10;
  }

  const totalString = (totals[year] ?? 0).toLocaleString();

  const doExport = (cb: (blob: Blob) => void) => {
    if (exportRef.current) {
      setExporting(true);

      setTimeout(async () => {
        const canvas = await html2canvas(exportRef.current);

        const onBlob = (blob: Blob | null) => {
          if (blob != null) {
            cb(blob);
          }
        };

        canvas.toBlob(onBlob, "image/png", 1);

        setExporting(false);
      });
    }
  };

  const handleDownload = () => {
    let date = year;
    if (date === CURRENT_YEAR) {
      date = formatDate();
    }
    doExport((blob) => saveAs(blob, `omac-${date}.png`));
  };

  const handleCopy = () => {
    doExport(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
      } catch (_) {
        alert("Can't copy. Try another browser.");
      }
    });
  };

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
  }, [copied]);

  return (
    <div className="results">
      <div className="results__arrow-container">
        {Array(Math.min(Math.round((totals[year] ?? 0) / 1000), 1000))
          .fill(0)
          .map((_, i) => (
            <Arrow key={i} exporting={exporting} i={i} />
          ))}
        <div className="results__arrow-cover" />
        <div
          className="results__count"
          style={{ animationDelay: `-${wobble.current}s` }}
        >
          <NameField className="results__name" defaultValue="I" /> hit
          <div className="results__total-container">
            <div className="results__shadow" style={{ textShadow: shadow }}>
              {totalString}
            </div>
            <div className="results__total">{totalString}</div>
            arrow{totals[year] === 1 ? "" : "s"} in{" "}
            {exporting ? year : <YearSelect className="results__year" />}!
          </div>
        </div>
      </div>
      <div className="results__url">jatw.us/omac</div>
      <div className="results__share">
        <button onClick={handleCopy}>
          <img alt="" src={copy} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={handleDownload}>
          <img alt="" src={download} />
          Download
        </button>
      </div>
    </div>
  );
}
