import { redirect } from "next/navigation";

export default function Page() {
  // in place of an actual home page
  return redirect("/new");
}
