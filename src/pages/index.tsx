import {
  GithubIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { type LayoutProps } from "~/components/layout";

export function getStaticProps() {
  return {
    props: {
      layout: {
        title: "Ai Comments Generator",
        description:
          "Generate example comments fit for a social media post that you provide",
      } as LayoutProps,
    },
  };
}

export default function Home() {
  const { status: sessionStatus } = useSession();

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        <span className="text-fuchsia-600">Ai</span> Comments Generator
      </h1>
      <div className="flex flex-col gap-4 text-center text-3xl">
        <p>
          A colleague on LinkedIn posted something and don&apos;t know what to
          comment?
        </p>
        <p>No need to worry anymore, we got you covered 😎</p>
      </div>
      {sessionStatus === "loading" && (
        <button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
          <Loader2Icon className="animate-spin" />
        </button>
      )}
      {sessionStatus === "unauthenticated" && (
        <button
          className="flex items-center gap-3 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          onClick={() => void signIn("github", { callbackUrl: "/dashboard" })}
        >
          <GithubIcon />
          <span>Sign in with GitHub</span>
        </button>
      )}
      {sessionStatus === "authenticated" && (
        <div className="flex flex-col items-center gap-4">
          <Link
            href={"/dashboard"}
            className="flex items-center gap-3 whitespace-nowrap rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            <LayoutDashboardIcon />
            <span>Go to dashboard</span>
          </Link>
          <button
            className="flex items-center gap-3 whitespace-nowrap rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            onClick={() => void signOut()}
          >
            <LogOutIcon />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
