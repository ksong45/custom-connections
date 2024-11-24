import { ComponentPropsWithoutRef } from "react";

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

export function WordTile({ selected, ...props }: WordTileProps) {
  return (
    <button
      className={`${selected ? "bg-stone-600 text-stone-50" : "bg-stone-200"} rounded-full px-6 py-3 text-center font-semibold uppercase leading-none transition active:scale-95 sm:px-8 sm:py-4 sm:text-base`}
      {...props}
    />
  );
}