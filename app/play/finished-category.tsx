type FinishedCategoryProps = {
  name: string;
  words: string[];
  color: string;
};

export function FinishedCategory({
  name,
  words,
  color,
}: FinishedCategoryProps) {
  return (
    <div
      className={`${color} flex flex-col justify-center rounded-full px-8 py-4 text-center uppercase leading-tight transition sm:px-10 sm:py-5`}
    >
      <p className="font-semibold">{name}</p>
      <p>{words.join(", ")}</p>
    </div>
  );
}
