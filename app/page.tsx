import Link from "next/link";
import { examples } from "~/lib/examples";

export default function Page() {
  return (
    <main>
      <ul className="list-inside list-disc">
        {examples.map((example, i) => (
          <li key={i}>
            <Link href={`/play?options=${btoa(JSON.stringify(example))}`}>
              <span className="font-semibold">
                {example.title.toUpperCase()}
              </span>{" "}
              by {example.author.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
