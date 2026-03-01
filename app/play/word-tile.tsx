import { ComponentPropsWithoutRef, useLayoutEffect, useMemo, useRef, useState } from "react";

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

const MAX_FONT = 16;
const MIN_FONT = 10; // tweak to taste

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

      let lo = MIN_FONT;
      let hi = MAX_FONT;
      let best = MIN_FONT;

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        span.style.fontSize = `${mid}px`;

        if (span.scrollWidth <= available - 2) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      span.style.fontSize = `${best}px`;

      if (best > MIN_FONT || span.scrollWidth <= available) {
        setFontPx(best);
        setWrap(false);
      } else {
        setFontPx(MIN_FONT);
        setWrap(true);
      }
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