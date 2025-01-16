import { useRef } from "react";

export default function Arrow({ i }: { i: number }) {
  const transform = useRef<number>(null);
  const scale = useRef<number>(null);
  const rotate = useRef<number>(null);
  const direction = useRef<string>(null);

  if (transform.current === null) {
    transform.current = Math.random() * (1 - 0.4) + 0.4;
  }

  if (scale.current === null) {
    scale.current = Math.random() * 0.4;
  }

  if (rotate.current === null) {
    rotate.current = Math.random() * 360;
  }

  if (direction.current === null) {
    direction.current = Math.random() < 0.5 ? "reverse" : "normal";
  }

  const translate = transform.current * 500;

  return (
    <img
      className="arrow"
      src={`arrow${(i % 6) + 1}.png`}
      style={{
        animationDelay: `-${rotate.current / 10}s`,
        animationDirection: direction.current,
        animationDuration: `${transform.current * 10}s`,
        scale: scale.current,
        translate: `0 ${translate}px`,
        transformOrigin: `center -${translate}px`,
      }}
    />
  );
}
