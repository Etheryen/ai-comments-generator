import { signIn, signOut, useSession } from "next-auth/react";
import { type LayoutProps } from "~/components/layout";
import { api } from "~/utils/api";

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
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        <span className="text-fuchsia-600">Ai</span> Comments Generator
      </h1>
      <div className="flex flex-col gap-4 text-center text-3xl text-white">
        <p>
          A colleague on LinkedIn posted something and don&apos;t know what to
          comment?
        </p>
        <p>No need to worry anymore, we got you covered 😎</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />
        <p className="text-2xl text-white">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
      </div>
    </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
      onClick={sessionData ? () => void signOut() : () => void signIn("github")}
    >
      {sessionData ? "Sign out" : "Sign in"}
    </button>
  );
}
