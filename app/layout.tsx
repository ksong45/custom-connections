import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Custom Connections",
  description: "Create your own custom game of connections.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto flex max-w-fit flex-col gap-4 p-8">
        <header className="flex w-screen max-w-[688px] items-center gap-4">
          <Link href="/">
            <img
              src="/logo-1024.png"
              alt="Custom Connections Logo"
              className="h-12 w-12"
            />
          </Link>

          <div>
            <Link href="/">
              <h1 className="text-2xl font-bold">Custom Connections</h1>
            </Link>
            <p>Group words that share a common thread.</p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
