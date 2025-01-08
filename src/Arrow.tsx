import { useEffect, useRef, useState } from "react";

export default function Arrow({ i }: { i: number }) {
  const [counter, setCounter] = useState(0);
  const transform = useRef<number>(null);
  const scale = useRef<number>(null);
  const rotate = useRef<number>(null);
  const direction = useRef<number>(null);

  if (transform.current === null) {
    transform.current = Math.random();
  }

  if (scale.current === null) {
    scale.current = Math.random() * 0.4;
  }

  if (rotate.current === null) {
    rotate.current = Math.random() * 360;
  }

  if (direction.current === null) {
    direction.current = Math.random() < 0.5 ? -1 : 1;
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      if (transform.current != null && direction.current != null) {
        setCounter(counter + transform.current * direction.current);
      }
    })
  }, [counter])

  const translate = transform.current * 500;

  return <img className="arrow" src={`arrow${i % 6 + 1}.png`} style={{
    transform: `
      translate(
        0,
        ${translate}px
      )
      scale(
        ${scale.current}
      )
      rotate(
        ${rotate.current + counter}deg
      )
    `,
    transformOrigin: `center -${translate}px`,
  }}/>;
}