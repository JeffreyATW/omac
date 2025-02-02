import { useRef, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";
import Instructions from "./components/Instructions";
import Results from "./components/Results";
import { useAtomValue } from "jotai";
import { exportingAtom, yearAtom } from "./state";
import { Delta, DeltaType, Totals } from "./types";
import isEqual from "lodash.isequal";

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

const showDeltaItem = localStorage.getItem("showDelta");

function App() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [delta, setDelta] = useState<Delta | null>(null);
  const year = useAtomValue(yearAtom);
  const [andreMode, setAndreMode] = useState(false);
  const [showDelta, setShowDelta] = useState(
    showDeltaItem === "true" ? true : false
  );
  const [deltaType, setDeltaType] = useState<DeltaType>("set");

  const handleShowDeltaChange = () => {
    setShowDelta(!showDelta);
    localStorage.setItem("showDelta", String(!showDelta));
  };

  const exporting = useAtomValue(exportingAtom);

  const overOneMillion = totals && totals[year] >= 1_000_000;

  const shouldShowAndre = andreMode && overOneMillion;

  const [isPending, startTransition] = useTransition();

  const handleDrop = (acceptedFiles: File[]) =>
    startTransition(async () => {
      const countsByYear: Record<string, number[]> = {};
      const totals: Totals = {};

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

      const parsedFiles: ParsedFile[] = [];

      files.forEach((file) => {
        try {
          parsedFiles.push(JSON.parse(file));
        } catch (_) {
          return;
        }
      });

      let latestYear: string | undefined;
      parsedFiles.forEach((parsed, i) => {
        const { DateTime, Score, Steps } = parsed;
        let sessionTotal = 0;
        if (DateTime != null) {
          latestYear = unwrapValue<string>(DateTime).substring(0, 4);
          sessionTotal = unwrapValue(Steps);
        } else {
          latestYear = Score.DateTime.substring(0, 4);
          Object.entries(Score.TapNoteScores ?? {}).forEach(
            ([label, value]) => {
              if (label.match(/^W[0-9]+$/)) {
                sessionTotal += value;
              }
            }
          );
        }
        if (i !== 0 && i === parsedFiles.length - 1) {
          setDelta([latestYear, sessionTotal]);
          setDeltaType("set");
        }
        if (countsByYear[latestYear] == null) {
          countsByYear[latestYear] = [sessionTotal];
        } else {
          countsByYear[latestYear].push(sessionTotal);
        }
      });

      Object.entries(countsByYear).forEach(([year, counts]) => {
        counts.forEach((count) => {
          totals[year] = (totals[year] ?? 0) + count;
        });
      });

      let prevTotals: Totals | undefined;
      if (latestYear != null) {
        const totalsItem = localStorage.getItem("totals");
        if (totalsItem != null) {
          try {
            prevTotals = JSON.parse(totalsItem);
            // eslint-disable-next-line no-empty
          } catch (_) {}
          if (prevTotals != null) {
            const prevYears = Object.keys(prevTotals);

            const latestPrevYear = prevYears[prevYears.length - 1];
            if (latestPrevYear === latestYear) {
              const prevTotal = prevTotals[latestYear];
              if (prevTotal !== totals[latestYear]) {
                setDelta([latestYear, totals[latestYear] - prevTotal]);
                setDeltaType("upload");
              }
            }
          }
        }
      }
      if (prevTotals == null || !isEqual(prevTotals, totals)) {
        localStorage.setItem("totals", JSON.stringify(totals));
      }
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
              delta={showDelta && delta != null ? delta : undefined}
              totals={totals}
            />
          )}
          <div className="settings">
            {delta != null && (
              <label>
                <input
                  checked={showDelta}
                  onChange={handleShowDeltaChange}
                  type="checkbox"
                />{" "}
                Show delta since last {deltaType}
              </label>
            )}
            {overOneMillion && (
              <label>
                <input
                  checked={andreMode}
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
