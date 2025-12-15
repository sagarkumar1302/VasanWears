import { useEffect, useRef, useState } from "react";

export const useCountUpOnView = (end) => {
  const ref = useRef();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const interval = setInterval(() => {
            start += Math.ceil(end / 60);
            if (start >= end) {
              setCount(end);
              clearInterval(interval);
            } else {
              setCount(start);
            }
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return { ref, count };
};
