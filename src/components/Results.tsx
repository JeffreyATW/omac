import { FormEvent, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import Arrow from "./Arrow";
import { useAtom, useAtomValue } from "jotai";
import { exportingAtom, nameAtom, yearAtom } from "../state";
// @ts-expect-error no declaration file
import html2canvas from "../vendor/html2canvas";

import copy from "../assets/copy.svg";
import download from "../assets/download.svg";
import currentYear from "../services/currentYear";

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
  total,
}: {
  exportRef: React.RefObject<HTMLDivElement | null>;
  total: number;
}) {
  const [copied, setCopied] = useState(false);

  const [name, setName] = useAtom(nameAtom);
  const year = useAtomValue(yearAtom);
  const [exporting, setExporting] = useAtom(exportingAtom);

  const totalString = total.toLocaleString();

  const handleFocus = (event: React.FocusEvent) => {
    const { target } = event;
    if (target != null) {
      window.setTimeout(() => {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        if (sel != null) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    }
  };

  const handleBlur = (event: FormEvent<HTMLSpanElement>) => {
    const newName = event.currentTarget.textContent;
    if (newName != null && newName !== "" && newName !== "I") {
      setName(newName);
      localStorage.setItem("name", newName);
    }
  };

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
    if (date === currentYear) {
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
      <div className="arrowContainer">
        {Array(Math.min(Math.round(total / 1000), 1000))
          .fill(0)
          .map((_, i) => (
            <Arrow key={i} exporting={exporting} i={i} />
          ))}
        <div className="arrowCover" />
        <div className="count">
          <span
            className="name"
            contentEditable
            onBlur={handleBlur}
            onFocus={handleFocus}
          >
            {name ?? "I"}
          </span>{" "}
          hit
          <div className="totalContainer">
            <div className="shadow" style={{ textShadow: shadow }}>
              {totalString}
            </div>
            <div className="total">{totalString}</div>
            arrow{total === 1 ? "" : "s"} in {year}!
          </div>
        </div>
      </div>
      <div className="url">jatw.us/omac</div>
      <div className="share">
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
