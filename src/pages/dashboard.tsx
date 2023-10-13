import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { type LayoutProps } from "~/components/layout";
import { useProtectedPage } from "~/utils/useProtectedPage";

export function getStaticProps() {
  return {
    props: {
      layout: {
        title: "Dashboard",
        description: "Dashboard of the Ai Comments Generator app",
      } as LayoutProps,
    },
  };
}

export default function Dashboard() {
  const { isUnauthed } = useProtectedPage();
  if (isUnauthed) return null;

  return (
    <div className="flex w-full flex-1">
      {/* TODO: zrobic zeby na mobile otwieralo sie przyciskiem a nie w-[25vw] */}
      <div className="flex w-[25vw] flex-col bg-neutral-900 p-4 sm:w-56 md:w-64 lg:w-72 xl:w-96">
        <div className="flex-1">wdadwa</div>
        <User />
      </div>
      <div className="p-12">dwadwa</div>
    </div>
  );
}

function User() {
  const { data } = useSession();

  if (!data) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-t-neutral-500 pt-4">
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
      <button
        className="whitespace-nowrap rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
    </div>
  );
}
