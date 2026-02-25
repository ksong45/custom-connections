import { ComponentPropsWithoutRef } from "react";

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

export function WordTile({ selected, ...props }: WordTileProps) {
  return (
    <button
      className={`
        ${selected ? "bg-stone-600 text-stone-50" : "bg-stone-200"}
        rounded-full
        px-4 py-2 sm:px-8 sm:py-4

        min-h-[3.5rem] sm:min-h-[4.5rem]   

        text-center font-semibold uppercase
        leading-tight

        whitespace-normal
        break-words
        [overflow-wrap:anywhere]           

        text-[clamp(11px,3vw,16px)]

        transition active:scale-95
      `}
      {...props}
    />
  );
}