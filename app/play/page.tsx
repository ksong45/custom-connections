"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { GameOptions, gameOptionsSchema } from "~/lib/game-options";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CircularButton } from "~/components/circular-button";

/* eslint-disable react-hooks/exhaustive-deps */

const colors = [
  "bg-nyt-yellow",
  "bg-nyt-green",
  "bg-nyt-blue",
  "bg-nyt-purple",
];

export default function Page() {
  const router = useRouter();
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
      setGameOptions(options);
      setWordPool(regenerateWordPool(options, guesses));
    } catch {
      console.error("could not parse game options from URL");
    }
  }, []);

  // ensure that gameOptions won't be undefined
  if (gameOptions === undefined) {
    return (
      <main className="flex flex-col gap-4">
        <p>loading...</p>
      </main>
    );
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
      <p>
        <span className="font-semibold">{gameOptions.title.toUpperCase()}</span>{" "}
        by {gameOptions.author.toUpperCase()}
      </p>

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
          <span className="bg-nyt-dark h-4 w-4 rounded-full" key={i}></span>
        ))}
      </div>

      {/* buttons and whatnot */}
      <div className="flex flex-wrap gap-4">
        <CircularButton
          onClick={() => router.push(`/new?options=${params.get("options")}`)}
        >
          Remix
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
              // swap guesses into the beginning of the pool
              for (let a = 0; a < 4; a++) {
                setWordPool((pool) => {
                  const b = pool.indexOf(selectedWords[a]);
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
    </main>
  );
}

type WordTileProps = ComponentPropsWithoutRef<"button"> & { selected: boolean };

function WordTile({ selected, ...props }: WordTileProps) {
  return (
    <button
      className={`${selected ? "bg-nyt-dark text-white" : "bg-nyt-light"} w-40 rounded-md py-5 text-center font-semibold uppercase transition-colors`}
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

  for (let i = 1; i < 3; i++) {
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
