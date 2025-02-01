import { useRef, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import Instructions from "./components/Instructions";
import Results from "./components/Results";
import { useAtomValue } from "jotai";
import { exportingAtom, yearAtom } from "./state";
import { Totals } from "./types";

const unwrapValue = <T,>(value: T | T[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

type ParsedFile =
  | {
      DateTime: string | string[];
      Score: never;
      Steps: number | number[];
    }
  | {
      DateTime: never;
      Score: {
        DateTime: string;
        TapNoteScores: Record<string, number>;
      };
      Steps: never;
    };

function App() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [deltas, setDeltas] = useState<Totals | null>(null);
  const year = useAtomValue(yearAtom);
  const [andreMode, setAndreMode] = useState(false);
  const [showDelta, setShowDelta] = useState(false);

  const exporting = useAtomValue(exportingAtom);

  const overOneMillion = totals && totals[year] >= 1_000_000;

  const shouldShowAndre = andreMode && overOneMillion;

  const [isPending, startTransition] = useTransition();

  const handleDrop = (acceptedFiles: File[]) =>
    startTransition(async () => {
      const countsByYear: Record<string, number[]> = {};
      const totals: Totals = {};
      const deltas: Totals = {};

      const files = await Promise.all(
        [...(acceptedFiles ?? [])]?.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = (ev) => {
                const { result } = ev.target ?? {};
                if (typeof result === "string") resolve(result);
              };
            })
        )
      );

      files.forEach((file) => {
        try {
          const parsed = JSON.parse(file) as ParsedFile;
          const { DateTime, Score, Steps } = parsed;
          if (DateTime != null) {
            const year = unwrapValue<string>(DateTime).substring(0, 4);
            if (countsByYear[year] == null) {
              countsByYear[year] = [unwrapValue(Steps)];
            } else {
              countsByYear[year].push(unwrapValue(Steps));
            }
          } else {
            const year = Score.DateTime.substring(0, 4);
            let sessionTotal = 0;
            Object.entries(Score.TapNoteScores ?? {}).forEach(
              ([label, value]) => {
                if (label.match(/^W[0-9]+$/)) {
                  sessionTotal += value;
                }
              }
            );
            if (countsByYear[year] == null) {
              countsByYear[year] = [sessionTotal];
            } else {
              countsByYear[year].push(sessionTotal);
            }
          }
        } catch (_) {
          return;
        }
      });

      Object.entries(countsByYear).forEach(([year, counts]) => {
        counts.forEach((count, i) => {
          if (i !== 0 && i === counts.length - 1) {
            deltas[year] = count;
          }
          totals[year] = (totals[year] ?? 0) + count;
        });
      });

      setDeltas(deltas);
      setTotals(totals);
    });

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: handleDrop,
  });

  return (
    <>
      <title>One Million Arrow Challenge</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Rammetto+One&display=swap"
        rel="stylesheet"
      />
      <div
        {...getRootProps({
          className: `dropzone ${shouldShowAndre ? "andre-mode" : ""}`,
        })}
      >
        <input
          {...getInputProps({
            accept: ".json,application/json",
            directory: "true",
            disabled: isPending,
            multiple: true,
            webkitdirectory: "true",
          })}
        />
        <div
          className={`contents ${exporting ? "exporting" : ""}`}
          ref={exportRef}
        >
          <h1 className="title">One Million Arrow Challenge</h1>
          {totals == null ? (
            <Instructions open={open} />
          ) : (
            <Results
              exportRef={exportRef}
              deltas={showDelta && deltas != null ? deltas : undefined}
              totals={totals}
            />
          )}
          <div className="settings">
            {deltas != null && (
              <label>
                <input
                  onChange={() => setShowDelta(!showDelta)}
                  type="checkbox"
                />{" "}
                Show delta since last set
              </label>
            )}
            {overOneMillion && (
              <label>
                <input
                  onChange={() => setAndreMode(!andreMode)}
                  type="checkbox"
                />{" "}
                Eric Andre mode
              </label>
            )}
          </div>
          <address className="copyright">
            © <a href="https://jeffreyatw.com">JeffreyATW</a>.{" "}
            <a href="https://github.com/JeffreyATW/omac">GitHub</a>
          </address>
        </div>
      </div>
    </>
  );
}

export default App;
