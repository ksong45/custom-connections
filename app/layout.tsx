import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Connections",
  description: "Create your own custom game of connections.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto flex max-w-fit flex-col gap-4 p-8">
        <header>
          <Link href="/">
            <h1 className="text-2xl font-bold">Custom Connections</h1>
          </Link>
          <p className="pb-2">Group words that share a common thread.</p>
          <Link href="/new">+ Create new game</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
