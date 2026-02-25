"use client";

import confetti from "canvas-confetti";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CircularButton } from "~/components/circular-button";
import {
  colors,
  getColor,
  getCommonColors,
  getTotalMistakes,
  regenerateWordPool,
  validateGuess,
} from "~/lib/game";
import { GameOptions, gameOptionsSchema } from "~/lib/game-options";
import { alphabetical, hasSameElements, range, toSwapped } from "~/lib/utils";
import { FinishedCategory } from "./finished-category";
import { WordTile } from "./word-tile";

function buildShareText(
  gameOptions: GameOptions,
  guesses: string[][],
  totalMistakes: number,
) {
  const colorEmojis = ["🟨", "⬜️", "🟧", "🟦"];

  const lines = guesses.map((g) => {
    // Map each word in the guess to its color index (0..3)
    const colors = g.map((word) => getColor(gameOptions, word));

    // Sort so similar colors group together (NYT style)
    colors.sort((a, b) => a - b);

    // Convert to emoji row
    return colors.map((c) => colorEmojis[c]).join("");
  });

  return [
    gameOptions.title,
    "",
    ...lines,
    "",
    `Mistakes: ${totalMistakes}/4`,
  ].join("\n");
}

/* eslint-disable react-hooks/exhaustive-deps */

export default function Page() {
  const params = useSearchParams();
  const [mistakesAnimateRef] = useAutoAnimate();
  const [poolAnimateRef, setPoolAnimated] = useAutoAnimate();

  const [gameResult, setGameResult] = useState<"playing" | "won" | "lost">("playing");
  const [gameOptions, setGameOptions] = useState<GameOptions | undefined>();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!params.has("options")) return;

    try {
      const decoded = JSON.parse(atob(params.get("options")!));
      const options = gameOptionsSchema.parse(decoded);

      for (let i = 0; i < 4; i++) {
        options.words[i].sort(alphabetical);
      }

      setGameOptions(options);
      setWordPool(regenerateWordPool(options, guesses));
    } catch {
      console.error("could not parse game options from URL");
    }
  }, []);

  // derived state (SAFE even when gameOptions is undefined)
  const totalMistakes = gameOptions ? getTotalMistakes(gameOptions, guesses) : 0;
  const remainingMistakes = 4 - totalMistakes;

  const solvedCount = gameOptions
    ? guesses.filter((g) => validateGuess(gameOptions, g)).length
    : 0;

  const wonGame = gameResult === "won";
  const lostGame = gameResult === "lost";

  const submitDisabled =
    selectedWords.length !== 4 ||
    guesses.some((guess) => hasSameElements(guess, selectedWords));

  useEffect(() => {
    if (!lostGame || !gameOptions) return;

    setPoolAnimated(true);
    setTimeout(() => {
      setGuesses([...gameOptions.words]);
      setWordPool([]);
      setSelectedWords([]);
      setPoolAnimated(false);
    }, 300);
  }, [lostGame, gameOptions]);

  useEffect(() => {
    if (gameResult !== "playing" || !gameOptions) return;
    if (solvedCount === 4) setGameResult("won");
  }, [solvedCount, gameResult, gameOptions]);

  useEffect(() => {
    if (gameResult !== "playing" || !gameOptions) return;
    if (remainingMistakes === 0) setGameResult("lost");
  }, [remainingMistakes, gameResult, gameOptions]);

  useEffect(() => {
    if (!wonGame) return;

    // Blue & Orange confetti burst
    const duration = 1000;
    const end = Date.now() + duration;

    const colors = ["#1d4ed8", "#f97316"]; // blue, orange (Tailwind-ish)

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [wonGame]);

  if (gameOptions === undefined) {
    return <main className="flex flex-col gap-4"></main>;
  }

  return (
    <main className="flex flex-col gap-4">
      {/* Top bar with help button */}
      <div className="flex items-start justify-between">
        <div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              className:
                "!shrink-0 !rounded-md !bg-stone-900 !p-2 !text-stone-50 !shadow-md",
            }}
          />

          <h2>
            <span className="text-2xl font-semibold">
              {gameOptions.title.toUpperCase()}
            </span>{" "}
            by {gameOptions.author.toUpperCase()}
          </h2>

          <p className="text-stone-500">
            <Link
              href={`/new?options=${params.get("options")}`}
              className="underline"
            >
              {/* remix this game */}
            </Link>{" "}
            <Link href="/new" className="underline">
              {/* create your own */}
            </Link>
          </p>
        </div>

        {/* ? Help button */}
        <button
          onClick={() => setShowHelp(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-400 text-xl font-bold hover:bg-stone-100"
          aria-label="How to play"
        >
          ?
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:gap-4">
        {/* print out finished categories */}
        {guesses.map((guess) =>
          validateGuess(gameOptions, guess) ? (
            <FinishedCategory
              name={gameOptions.names[getColor(gameOptions, guess[0])]}
              words={gameOptions.words[getColor(gameOptions, guess[0])]}
              color={colors[getColor(gameOptions, guess[0])]}
              key={getColor(gameOptions, guess[0])}
            />
          ) : undefined,
        )}

        {/* grid from the word pool */}
        {wordPool.length > 0 && !lostGame && !wonGame && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4" ref={poolAnimateRef}>
            {wordPool.map((word) => (
              <WordTile
                key={word}
                selected={selectedWords.includes(word)}
                onClick={() => {
                  if (selectedWords.includes(word)) {
                    setSelectedWords(selectedWords.filter((w) => w !== word));
                  } else if (selectedWords.length < 4) {
                    setSelectedWords([...selectedWords, word]);
                  }
                }}
              >
                {word}
              </WordTile>
            ))}
          </div>
        )}
      </div>

      {/* display the mistakes that the user has left */}
      <div
        className="flex items-center gap-2 place-self-center sm:place-self-auto"
        ref={mistakesAnimateRef}
      >
        <p>Remaining mistakes:</p>
        {range(Math.max(0, remainingMistakes)).map((_, i) => (
          <span className="h-4 w-4 rounded-full bg-stone-600" key={i}></span>
        ))}
      </div>

      {!wonGame && !lostGame ? (
        <div className="flex flex-wrap gap-4 place-self-center sm:place-self-auto">
          <CircularButton
            onClick={() =>
              setWordPool(regenerateWordPool(gameOptions, guesses))
            }
          >
            Shuffle
          </CircularButton>

          <CircularButton
            disabled={selectedWords.length === 0}
            onClick={() => setSelectedWords([])}
          >
            Deselect all
          </CircularButton>

          <CircularButton
            variant={submitDisabled ? undefined : "filled"}
            disabled={submitDisabled}
            onClick={async () => {
              const result = validateGuess(gameOptions, selectedWords);

              if (result === true) {
                const sortedSelected = selectedWords.toSorted(alphabetical);

                for (let a = 0; a < 4; a++) {
                  setWordPool((pool) => {
                    const b = pool.indexOf(sortedSelected[a]);
                    return toSwapped(pool, a, b);
                  });
                }

                setPoolAnimated(true);

                await new Promise((res) => setTimeout(res, 500));
                setGuesses([...guesses, selectedWords]);
                setSelectedWords([]);
                setWordPool((pool) =>
                  pool.filter((word) => !selectedWords.includes(word)),
                );

                setPoolAnimated(false);
              } else {
                if (getCommonColors(gameOptions, selectedWords) === 3) {
                  toast("One away...");
                }

                setGuesses([...guesses, selectedWords]);
                setSelectedWords([]);
              }
            }}
          >
            Submit
          </CircularButton>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-4">
          {wonGame ? (
            <p className="text-3xl sm:text-4xl font-bold text-center">
              You won, congrats!
            </p>
          ) : (
            <p className="text-base text-center text-stone-700">
              Not quite, better luck next time!
            </p>
          )}

          <CircularButton
            variant="filled"
            onClick={async () => {
              const text = buildShareText(gameOptions, guesses, totalMistakes);

              // Try native share first (mobile, some desktops)
              if (navigator.share) {
                try {
                  await navigator.share({ text });
                  return;
                } catch {
                  // fall through to clipboard
                }
              }

              // Fallback: copy to clipboard
              await navigator.clipboard.writeText(text);
              toast("Results copied to clipboard!");
            }}
          >
            Share
          </CircularButton>
        </div>
      )}

      <div>
        <p style={{ textAlign: "center" }}>
          Credits: Original by Zachary Robinson. Improved and extended by Kyle Song.
        </p>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative max-h-[90vh] w-[90vw] max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute right-4 top-4 text-2xl font-bold text-stone-600 hover:text-black"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="mb-2 text-2xl font-bold">How to Play</h2>
            <p className="mb-4 text-stone-700">
              Sort the 16 tiles into four clusters of four tiles.
            </p>

            <ul className="mb-4 list-disc pl-5 text-stone-700">
              <li>
                Select four tiles and tap <strong>Submit</strong> to check if your
                guess is correct.
              </li>
              <li>Find the groups without making 4 mistakes!</li>
            </ul>

            <h3 className="mb-2 text-lg font-semibold">Cluster Examples</h3>
            <ul className="mb-4 list-disc pl-5 text-stone-700">
              <li>
                <strong>UVA DORMS</strong>: Page, Shannon, Gooch, Gibbons
              </li>
              <li>
                <strong>CAVALIER ___</strong>: Daily, Advantage, Marching Band, Computers
              </li>
            </ul>

            <p className="mb-4 text-stone-700">
              Clusters will always be more specific than &quot;5-LETTER-WORDS&quot;, &quot;NAMES&quot; or &quot;VERBS&quot;.
            </p>

            <p className="mb-4 text-stone-700">
              Each puzzle has exactly one solution.
            </p>
            <div className="mt-6">
              <p className="mb-3 text-center text-stone-700">
                Each group is assigned a color based on difficulty:
              </p>

              <div className="flex justify-center gap-6">
                {[
                  { label: "Straightforward", colorClass: colors[0] },
                  { label: "Moderate", colorClass: colors[1] },
                  { label: "Challenging", colorClass: colors[2] },
                  { label: "Tricky", colorClass: colors[3] },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-md border border-stone-300 ${item.colorClass}`}
                    />
                    <span className="text-xs text-stone-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}