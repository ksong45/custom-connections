import { ComponentPropsWithoutRef, useLayoutEffect, useMemo, useRef, useState } from "react";

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

const MAX_FONT = 16;
const MIN_SINGLE_LINE = 7;
const WRAP_FONT = 9; 
const MIN_READABLE_SINGLE = 10;

export function WordTile({ selected, children, ...props }: WordTileProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const [fontPx, setFontPx] = useState(MAX_FONT);
  const [wrap, setWrap] = useState(false);

  const text = useMemo(
    () => (typeof children === "string" ? children : ""),
    [children],
  );

  useLayoutEffect(() => {
    const btn = btnRef.current;
    const span = spanRef.current;
    if (!btn || !span) return;

    const measure = () => {
      const styles = getComputedStyle(btn);
      const paddingLeft = parseFloat(styles.paddingLeft || "0");
      const paddingRight = parseFloat(styles.paddingRight || "0");
      const available = btn.clientWidth - paddingLeft - paddingRight;

      // Measure single-line only to determine max font
      const prevWhiteSpace = span.style.whiteSpace;
      span.style.whiteSpace = "nowrap";

      let lo = MIN_SINGLE_LINE;
      let hi = MAX_FONT;
      let best = MIN_SINGLE_LINE;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        span.style.fontSize = `${mid}px`;

        if (span.scrollWidth <= available - 4) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      span.style.whiteSpace = prevWhiteSpace;

      // Apply final font
      setFontPx(best);

      // Always allow wrapping
      setWrap(true);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(btn);
    measure();
    requestAnimationFrame(measure);

    return () => ro.disconnect();
  }, [text]);

  return (
    <button
      ref={btnRef}
      className={`
        w-full
        ${selected ? "bg-stone-600 text-stone-50" : "bg-stone-200"}
        rounded-full
        px-4 py-2 sm:px-8 sm:py-4

        min-h-[3.5rem] sm:min-h-[4.5rem] h-auto

        font-semibold uppercase leading-tight
        transition active:scale-95

        flex items-center justify-center text-center
      `}
      {...props}
    >
      <span
        ref={spanRef}
        style={{ fontSize: `${fontPx}px` }}
        className="block whitespace-normal break-words"
      >
        {children}
      </span>
    </button>
  );
}