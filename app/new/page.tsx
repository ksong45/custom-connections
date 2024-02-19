"use client";

import { IconTextSize, IconUser } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { CircularButton } from "~/components/circular-button";
import { colors } from "~/lib/colors";
import { GameOptions, gameOptionsSchema } from "~/lib/game-options";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  const [yellowWords, setYellowWords] = useState(["", "", "", ""]);
  const [greenWords, setGreenWords] = useState(["", "", "", ""]);
  const [blueWords, setBlueWords] = useState(["", "", "", ""]);
  const [purpleWords, setPurpleWords] = useState(["", "", "", ""]);

  const [yellowName, setYellowName] = useState("");
  const [greenName, setGreenName] = useState("");
  const [blueName, setBlueName] = useState("");
  const [purpleName, setPurpleName] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.has("options")) return;

    try {
      const decoded = JSON.parse(atob(params.get("options")!));
      const options = gameOptionsSchema.parse(decoded);
      console.log("setting game options from URL", options);

      setYellowName(options.names[0]);
      setGreenName(options.names[1]);
      setBlueName(options.names[2]);
      setPurpleName(options.names[3]);

      setYellowWords(options.words[0]);
      setGreenWords(options.words[1]);
      setBlueWords(options.words[2]);
      setPurpleWords(options.words[3]);

      setTitle(options.title);
      setAuthor(options.author);
    } catch {
      console.error("could not parse game options from URL");
    }
  }, [params]);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <TextInput
          name="title (optional)"
          icon={<IconTextSize />}
          text={title}
          setText={setTitle}
        />

        <TextInput
          name="author (optional)"
          icon={<IconUser />}
          text={author}
          setText={setAuthor}
        />
      </div>

      <CategoryInput
        color={colors[0]}
        name={yellowName}
        setName={setYellowName}
        words={yellowWords}
        setWords={setYellowWords}
      />

      <CategoryInput
        color={colors[1]}
        name={greenName}
        setName={setGreenName}
        words={greenWords}
        setWords={setGreenWords}
      />

      <CategoryInput
        color={colors[2]}
        name={blueName}
        setName={setBlueName}
        words={blueWords}
        setWords={setBlueWords}
      />

      <CategoryInput
        color={colors[3]}
        name={purpleName}
        setName={setPurpleName}
        words={purpleWords}
        setWords={setPurpleWords}
      />

      <div className="flex flex-wrap items-center gap-4">
        <CircularButton
          onClick={() => {
            setYellowName("");
            setGreenName("");
            setBlueName("");
            setPurpleName("");

            setYellowWords(["", "", "", ""]);
            setGreenWords(["", "", "", ""]);
            setBlueWords(["", "", "", ""]);
            setPurpleWords(["", "", "", ""]);

            setTitle("");
            setAuthor("");
          }}
        >
          Clear all
        </CircularButton>

        <CircularButton
          variant="filled"
          onClick={() => {
            const obj: GameOptions = {
              names: [yellowName, greenName, blueName, purpleName],
              words: [yellowWords, greenWords, blueWords, purpleWords],
              author,
              title,
            };

            if (!obj.words.flat().every((s) => s.trim().length > 0)) {
              setError("Please enter all words.");
              return;
            } else if (!obj.names.every((s) => s.trim().length > 0)) {
              setError("Please enter all category names.");
              return;
            }

            const encoded = btoa(JSON.stringify(obj));
            router.push(`/play?options=${encoded}`);
          }}
        >
          Submit
        </CircularButton>

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </main>
  );
}

type WordInputProps = {
  color: string;
  i: number;
  words: string[];
  setWords: Dispatch<SetStateAction<string[]>>;
};

function WordInput({ color, i, words, setWords }: WordInputProps) {
  return (
    <input
      type="text"
      name={color + "-" + i}
      className={`${color} rounded-md py-5 text-center font-semibold uppercase placeholder:text-slate-600/50`}
      placeholder="WORD"
      value={words[i]}
      onChange={(e) =>
        setWords((arr) => {
          const newArr = [...arr];
          newArr[i] = e.target.value;
          return newArr;
        })
      }
    />
  );
}

type CategoryInputProps = {
  color: string;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  words: string[];
  setWords: Dispatch<SetStateAction<string[]>>;
};

function CategoryInput({
  color,
  name,
  setName,
  words,
  setWords,
}: CategoryInputProps) {
  return (
    <>
      <CategoryNameInput color={color} name={name} setName={setName} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }, (_, i) => i).map((i) => (
          <WordInput
            color={color}
            i={i}
            key={i}
            words={words}
            setWords={setWords}
          />
        ))}
      </div>
    </>
  );
}

type CategoryNameInputProps = {
  color: string;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
};

function CategoryNameInput({ color, name, setName }: CategoryNameInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${color} h-6 w-6 rounded-full`}></div>
      <input
        type="text"
        placeholder="CATEGORY NAME"
        className="min-w-[304px] border-b border-black bg-stone-50 px-1 font-semibold uppercase"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}

type TextInputProps = {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  name: string;
  icon: ReactNode;
};

function TextInput({ text, setText, name, icon }: TextInputProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <input
        type="text"
        placeholder={name}
        className="min-w-[304px] border-b border-stone-800 bg-stone-50 px-1 font-semibold uppercase"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
