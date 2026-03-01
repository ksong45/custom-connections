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

      // force single-line for fit test
      span.style.whiteSpace = "nowrap";
      span.style.wordBreak = "normal";
      span.style.overflowWrap = "normal";

      let lo = MIN_SINGLE_LINE
      let hi = MAX_FONT;
      let best = MIN_SINGLE_LINE;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        span.style.fontSize = `${mid}px`;

        if (span.scrollWidth <= available - 4 && span.scrollHeight <= btn.clientHeight - 4) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      span.style.fontSize = `${best}px`;

      // If it fits comfortably above readable threshold → single line
      if (best >= MIN_READABLE_SINGLE) {
        setFontPx(best);
        setWrap(false);
        return;
      }

      // If it fits but is too small → prefer wrapping at readable size
      if (best >= MIN_SINGLE_LINE) {
        setFontPx(WRAP_FONT);
        setWrap(true);
        return;
      }

      // If it doesn't even fit at MIN_SINGLE_LINE → must wrap
      setFontPx(WRAP_FONT);
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

        min-h-[3.5rem] sm:min-h-[4.5rem]

        font-semibold uppercase leading-tight
        transition active:scale-95

        flex items-center justify-center text-center
      `}
      {...props}
    >
      <span
        ref={spanRef}
        style={{ fontSize: `${fontPx}px` }}
        className={
          wrap
            ? "block whitespace-normal [overflow-wrap:anywhere]"
            : "block whitespace-nowrap"
        }
      >
        {children}
      </span>
    </button>
  );
}