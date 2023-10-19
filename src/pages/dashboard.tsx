import { type Query } from "@prisma/client";
import { Loader2Icon, LogOutIcon, PlusIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type LayoutProps } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { useProtectedPage } from "~/utils/use-protected-page";
import { atom, useAtomValue, useSetAtom } from "jotai";

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
      <div className="flex w-[25vw] flex-col bg-neutral-900 p-4 sm:w-56 md:w-64 lg:w-72 xl:w-96">
        <div className=" flex flex-1 flex-col items-center gap-2">
          <QueryList />
        </div>
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
      <button
        className="text-semibold flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-5 py-3 font-semibold text-white"
        onClick={() => setSelectedQueryId(null)}
      >
        <PlusIcon /> Add new
      </button>
    </>
  );
}

function QueryElement({ id, input }: Pick<Query, "id" | "input">) {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);

  return (
    <button
      className="text-semibold w-full rounded-lg bg-neutral-800 px-5 py-3 text-white"
      onClick={() => setSelectedQueryId(id)}
    >
      {input}
    </button>
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-t-neutral-500 pt-4">
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
        variant={"semiTransparent"}
        roundness={"round"}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleSignOut}
      >
        <LogOutIcon className="mr-2" /> Sign out
      </Button>
    </div>
  );
}
