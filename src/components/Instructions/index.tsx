import NameField from "../NameField";
import YearSelect from "../YearSelect";

import "./index.css";

export default function Instructions({ open }: { open: () => void }) {
  return (
    <div className="instructions">
      <h2 className="instructions__subtitle">
        How many arrows did{" "}
        <NameField className="instructions__name" defaultValue="you" /> hit in{" "}
        <YearSelect className="instructions__year" />?
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
