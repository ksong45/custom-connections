import { ComponentPropsWithoutRef } from "react";

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

export function WordTile({ selected, ...props }: WordTileProps) {
  return (
    <button
      className={`
        ${selected ? "bg-stone-600 text-stone-50" : "bg-stone-200"}
        rounded-full
        px-4 py-2 sm:px-8 sm:py-4
        text-center font-semibold uppercase
        leading-tight
        break-words whitespace-normal
        overflow-hidden
        text-[clamp(12px,3.5vw,16px)]
        transition active:scale-95
      `}
      {...props}
    />
  );
}