import { useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

const unwrapValue = <T,>(value: T | T[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

let shadow = "";
for (let i = 0; i < 10; i++) {
  shadow += `${(shadow ? "," : "") + -i * 1}px ${i * 1}px 0 #99a`;
}

function App() {
  const [total, setTotal] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalString = total?.toLocaleString();

  const handleChange = (acceptedFiles: File[]) =>
    startTransition(async () => {
      const currentYear = String(new Date().getFullYear());
      setCurrentYear(currentYear);
      let total = 0;

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
          const parsed = JSON.parse(file);
          const { DateTime, Score, Steps } = parsed;
          if (Steps != null) {
            if (unwrapValue<string>(DateTime).startsWith(currentYear)) {
              total += unwrapValue(Steps);
            }
          } else if (Score.DateTime.startsWith(currentYear)) {
            Object.entries(Score.TapNoteScores ?? {}).forEach(
              ([label, value]) => {
                if (label.match(/^W[0-9]+$/)) {
                  total += value as number;
                }
              }
            );
          }
        } catch (_) {
          return;
        }
      });

      setTotal(total);
    });

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: handleChange,
  });

  return (
    <>
      <div
        {...getRootProps({
          className: "dropzone",
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
        <div className="contents">
          <h1>One Million Arrows Challenge</h1>
          {total == null ? (
            <div className="instructions">
              <ol>
                <li>
                  Enable custom scores or stepcounts:
                  <details>
                    <summary>Custom Scores</summary>
                    Turn on{" "}
                    <i>Options &gt; Simply Love &gt; Write Custom Scores</i>
                  </details>
                  <details>
                    <summary>Stepcounts</summary>
                    <ol>
                      <li>
                        Download the{" "}
                        <a href="https://github.com/kitsuneymg/simply-love-stepcount">
                          stepcount module
                        </a>
                      </li>
                      <li>
                        Place <code>stepcount.lua</code> in the Simply Love{" "}
                        <code>Modules</code> folder
                      </li>
                      <li>Restart ITGmania</li>
                    </ol>
                  </details>
                </li>
                <li>
                  If you just enabled custom scores or stepcounts, play a song
                  or two
                </li>
                <li>
                  Go to your ITGmania save folder
                  <ul>
                    <li>
                      Windows: <code>%APPDATA%/ITGmania/Save</code>
                    </li>
                    <li>
                      Linux: <code>~/.itgmania/Save</code>
                    </li>
                    <li>
                      macOS: <code>~/Library/Preferences/ITGmania</code>
                    </li>
                  </ul>
                </li>
                <li>
                  Go to <code>LocalProfiles/00000000</code> inside the save
                  folder, replacing the 0's with the correct number for your
                  profile
                </li>
                <li>
                  Drag either the <code>SL-Scores</code> <em>or</em>{" "}
                  <code>SL-Steps</code> folder onto this window, or{" "}
                  <button onClick={open} type="button">
                    click here
                  </button>{" "}
                  to navigate to it
                </li>
              </ol>
            </div>
          ) : (
            <div className="count">
              You hit
              <div className="total" style={{ textShadow: shadow }}>
                {totalString}
              </div>
              arrow{total === 1 ? "" : "s"} in {currentYear}!
            </div>
          )}
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
