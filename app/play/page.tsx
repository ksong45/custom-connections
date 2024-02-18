"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { CircularButton } from "~/components/circular-button";
import { colors } from "~/lib/colors";
import { GameOptions, gameOptionsSchema } from "~/lib/game-options";
import { alphabetical } from "~/lib/utils";

/* eslint-disable react-hooks/exhaustive-deps */

export default function Page() {
  const params = useSearchParams();
  const [mistakesAnimateRef] = useAutoAnimate();
  const [poolAnimateRef, setPoolAnimated] = useAutoAnimate();

  const [gameOptions, setGameOptions] = useState<GameOptions | undefined>();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);

  useEffect(() => {
    if (!params.has("options")) return;

    try {
      const decoded = JSON.parse(atob(params.get("options")!));
      const options = gameOptionsSchema.parse(decoded);
      console.info("setting game options from URL", options);

      for (let i = 0; i < 4; i++) {
        options.words[i].sort(alphabetical);
      }

      console.info("setting game options from URL", options);

      setGameOptions(options);
      setWordPool(regenerateWordPool(options, guesses));
    } catch {
      console.error("could not parse game options from URL");
    }
  }, []);

  // ensure that gameOptions won't be undefined
  if (gameOptions === undefined) {
    return <main></main>;
  }

  // derived state
  const totalMistakes = getTotalMistakes(gameOptions, guesses);
  const remainingMistakes = 4 - totalMistakes;
  const wonGame = wordPool.length === 0;
  const lostGame = remainingMistakes === 0;
  const submitDisabled =
    selectedWords.length !== 4 ||
    guesses.some((guess) => hasSameElements(guess, selectedWords));

  return (
    <main className="flex flex-col gap-4">
      <div>
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
            remix this game
          </Link>{" "}
          or{" "}
          <Link href="/new" className="underline">
            create your own
          </Link>
        </p>
      </div>

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
      <div className="grid grid-cols-4 gap-4" ref={poolAnimateRef}>
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
      <div className="flex items-center gap-2" ref={mistakesAnimateRef}>
        <p>Remaining mistakes:</p>
        {Array.from({ length: remainingMistakes }, (_, i) => i).map((_, i) => (
          <span className="h-4 w-4 rounded-full bg-stone-600" key={i}></span>
        ))}
      </div>
      {!wonGame && !lostGame ? (
        <div className="flex flex-wrap gap-4">
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
                // sort so the words swap to the right order
                const sortedSelected = selectedWords.toSorted(alphabetical);

                // swap guesses into the beginning of the pool
                for (let a = 0; a < 4; a++) {
                  setWordPool((pool) => {
                    const b = pool.indexOf(sortedSelected[a]);
                    return toSwapped(pool, a, b);
                  });
                }

                setPoolAnimated(true);
                await new Promise((res) => setTimeout(res, 500));

                setGuesses([...guesses, selectedWords]);
                setWordPool((pool) =>
                  pool.filter((word) => !selectedWords.includes(word)),
                );
                setSelectedWords([]);
                setPoolAnimated(false);
              } else {
                setGuesses([...guesses, selectedWords]);
                setSelectedWords([]);
              }
            }}
          >
            Submit
          </CircularButton>
        </div>
      ) : wonGame ? (
        <p>You won, congrats!</p>
      ) : lostGame ? (
        <p>You lost, refresh to try again!</p>
      ) : null}
    </main>
  );
}

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

function WordTile({ selected, ...props }: WordTileProps) {
  return (
    <button
      className={`${selected ? "bg-stone-600 text-stone-50" : "bg-stone-200"} w-40 rounded-md py-5 text-center font-semibold uppercase transition-colors`}
      {...props}
    />
  );
}

type FinishedCategoryProps = {
  name: string;
  words: string[];
  color: string;
};

function FinishedCategory({ name, words, color }: FinishedCategoryProps) {
  return (
    <div
      className={`${color} w-[688px] rounded-md py-3 text-center uppercase leading-tight`}
    >
      <p className="font-semibold">{name}</p>
      <p>{words.join(", ")}</p>
    </div>
  );
}

function getColor(options: GameOptions, word: string) {
  for (let i = 0; i < 4; i++) {
    if (options.words[i].includes(word)) {
      return i;
    }
  }

  return -1; // not found
}

function validateGuess(options: GameOptions, guess: string[]) {
  const first = getColor(options, guess[0]);

  for (let i = 1; i < 4; i++) {
    if (getColor(options, guess[i]) !== first) {
      return false;
    }
  }

  return true;
}

function getTotalMistakes(options: GameOptions, guesses: string[][]) {
  let total = 0;

  for (let i = 0; i < guesses.length; i++) {
    if (validateGuess(options, guesses[i]) === false) {
      total++;
    }
  }

  return total;
}

function getRevealedColors(options: GameOptions, guesses: string[][]) {
  const revealed = [false, false, false, false];

  for (let i = 0; i < guesses.length; i++) {
    if (validateGuess(options, guesses[i])) {
      revealed[getColor(options, guesses[i][0])] = true;
    }
  }

  return revealed;
}

function regenerateWordPool(options: GameOptions, guesses: string[][]) {
  const revealedColors = getRevealedColors(options, guesses);
  const wordPool: string[] = [];

  for (let i = 0; i < 4; i++) {
    if (revealedColors[i] === false) {
      options.words[i].forEach((word) => wordPool.push(word));
    }
  }

  wordPool.sort(() => Math.random() - 0.5);
  return wordPool;
}

function toSwapped<T>(arr: T[], a: number, b: number) {
  const newArr: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === a) {
      newArr[i] = arr[b];
    } else if (i === b) {
      newArr[i] = arr[a];
    } else {
      newArr[i] = arr[i];
    }
  }

  return newArr;
}

function hasSameElements<T>(a: T[], b: T[]) {
  return a.sort().join(",") === b.sort().join(",");
}
