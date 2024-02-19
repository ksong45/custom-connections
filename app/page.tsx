import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { examples } from "~/lib/examples";

export default function Page() {
  return (
    <main className="flex flex-col gap-4 sm:flex-row">
      <Link
        href="/new"
        className="flex basis-1/2 flex-col items-center justify-center gap-2 rounded-md border border-stone-300 p-4 transition-colors hover:bg-stone-100"
      >
        <IconPlus className="h-8 w-8 sm:h-12 sm:w-12" />
        <span className="font-semibold">Create New Game</span>
      </Link>

      <div className="flex basis-1/2 flex-col gap-4">
        {examples.map((example, i) => (
          <Link
            href={`/play?options=${btoa(JSON.stringify(example))}`}
            className="rounded-md border border-stone-300 p-4 text-center transition-colors hover:bg-stone-100"
            key={i}
          >
            <span className="font-semibold">{example.title.toUpperCase()}</span>{" "}
            by {example.author.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* <ul className="list-inside list-disc">
        
      </ul> */}
    </main>
  );
}
