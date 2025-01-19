import { useAtom } from "jotai";
import { FormEvent } from "react";
import { nameAtom } from "../../state";

export default function NameField({
  className,
  defaultValue,
}: {
  className?: string;
  defaultValue: string;
}) {
  const [name, setName] = useAtom(nameAtom);

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
    if (newName != null && newName !== "" && newName !== defaultValue) {
      setName(newName);
      localStorage.setItem("name", newName);
    }
  };

  return (
    <span
      className={`name-field ${className ?? ""}`}
      contentEditable
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      {name ?? defaultValue}
    </span>
  );
}
