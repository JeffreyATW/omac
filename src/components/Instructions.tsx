import { useAtom } from "jotai";
import { nameAtom, yearAtom } from "../state";
import { ChangeEvent } from "react";

export default function Instructions({ open }: { open: () => void }) {
  const [name, setName] = useAtom(nameAtom);
  const [year, setYear] = useAtom(yearAtom);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    if (newName != null) {
      setName(newName);
      if (newName !== "you" && newName !== "") {
        localStorage.setItem("name", newName);
      }
    }
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newYear = event.target.value;
    if (newYear != null) {
      setYear(newYear);
    }
  };

  return (
    <div className="instructions">
      <h2 className="subtitle">
        How many arrows did{" "}
        <input onChange={handleNameChange} value={name ?? "you"} /> hit in{" "}
        <select onChange={handleYearChange} value={year}>
          {Array(5)
            .fill(0)
            .map((_, i) => {
              const yearStr = String(Number(year) - i);
              return <option value={yearStr}>{yearStr}</option>;
            })}
        </select>
        ?
      </h2>
      <h3>Instructions</h3>
      <ol>
        <li>
          Enable custom scores or stepcounts:
          <details>
            <summary>Custom Scores</summary>
            Turn on <i>Options &gt; Simply Love &gt; Write Custom Scores</i>
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
          If you just enabled custom scores or stepcounts, play a song or two
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
          Go to <code>LocalProfiles/00000000</code> inside the save folder,
          replacing the 0's with the correct number for your profile
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
  );
}
