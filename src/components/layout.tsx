import Head from "next/head";
import { type PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import { cn } from "~/utils/classnames";
import { Toaster } from "react-hot-toast";

export interface LayoutProps extends PropsWithChildren {
  title: string;
  description: string;
}

const inter = Inter({ subsets: ["latin"] });

export function Layout({ title, description, children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <main
        className={cn(
          inter.className,
          "flex min-h-screen flex-col items-center justify-center bg-neutral-800 text-white supports-[height:100dvh]:min-h-[100dvh]",
        )}
      >
        {children}
      </main>
      <Toaster position="bottom-right" />
    </>
  );
}
