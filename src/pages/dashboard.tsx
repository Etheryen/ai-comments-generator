import { type Query } from "@prisma/client";
import { Loader2Icon, LogOutIcon, PlusIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type LayoutProps } from "~/components/layout";
import { Button, buttonVariants } from "~/components/ui/button";
import { api } from "~/utils/api";
import { useProtectedPage } from "~/utils/use-protected-page";
import { atom, useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";

const selectedQueryIdAtom = atom<string | null>(null);

export function getStaticProps() {
  return {
    props: {
      layout: {
        title: "Dashboard | Ai Comments Generator",
        description: "Dashboard of the Ai Comments Generator app",
      } as LayoutProps,
    },
  };
}

export default function Dashboard() {
  const selectedQueryId = useAtomValue(selectedQueryIdAtom);

  const { isUnauthed } = useProtectedPage();
  if (isUnauthed) return <Loader2Icon className="animate-spin" />;

  return (
    <div className="flex w-full flex-1">
      {/* TODO: zrobic zeby na mobile otwieralo sie przyciskiem a nie w-[25vw] */}
      {/* TODO: h-screen na mobile nie */}
      <div className="flex h-screen w-[25vw] flex-col bg-neutral-900 p-2 supports-[height:100dvh]:h-[100dvh] sm:w-56 md:w-64 lg:w-72 xl:w-96">
        <Link
          href={"/"}
          className={buttonVariants({
            variant: "ghost",
            className: "w-ful mx-2 mt-2 text-2xl font-extrabold tracking-tight",
          })}
        >
          <span className="truncate">
            <span className="text-fuchsia-500">Ai</span> Comments Generator
          </span>
        </Link>
        <div className="my-4 border-b border-b-neutral-500" />
        <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
          <QueryList />
        </div>
        <div className="my-4 border-b border-b-neutral-500" />
        <User />
      </div>
      <div className="flex w-full items-center justify-center p-12">
        {!!selectedQueryId ? (
          <div>{selectedQueryId}</div>
        ) : (
          <div>Add new query!!</div>
        )}
      </div>
    </div>
  );
}

function QueryList() {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);

  const { data, isLoading, error } = api.queries.getAllQueryNames.useQuery();

  if (isLoading) return <Loader2Icon className="mt-8 animate-spin" />;

  if (error) return <div>Error occured: {error.message}</div>;

  return (
    <>
      {data.map((query) => (
        <QueryElement key={query.id} {...query} />
      ))}
      <div className="w-full px-2">
        <Button
          className="w-full"
          // className="text-semibold flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-5 py-3 font-semibold text-white"
          onClick={() => setSelectedQueryId(null)}
        >
          <PlusIcon className="mr-2 text-fuchsia-500" /> Add new
        </Button>
      </div>
    </>
  );
}

function QueryElement({ id, input }: Pick<Query, "id" | "input">) {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);

  return (
    <div className="w-full px-2">
      <Button
        className="w-full"
        // className="text-semibold w-full rounded-lg bg-neutral-800 px-5 py-3 text-white"
        onClick={() => setSelectedQueryId(id)}
      >
        {input}
      </Button>
    </div>
  );
}

function User() {
  const router = useRouter();
  const { data } = useSession();

  if (!data) return null;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    await router.push("/");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-2 pb-2">
      <div className="flex items-center justify-between gap-4">
        {!!data.user.image && (
          <Image
            src={data.user.image}
            width={48}
            height={48}
            alt="Your profile image"
            className="h-12 w-12 rounded-full"
          />
        )}
        <div className="truncate">{data.user.name}</div>
      </div>
      <Button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleSignOut}
      >
        <LogOutIcon className="mr-2" /> Sign out
      </Button>
    </div>
  );
}
