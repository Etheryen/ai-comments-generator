import Head from "next/head";
import { type PropsWithChildren } from "react";

export interface LayoutProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function Layout({ title, description, children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-800 supports-[height:100dvh]:min-h-[100dvh]">
        {children}
      </main>
    </>
  );
}
