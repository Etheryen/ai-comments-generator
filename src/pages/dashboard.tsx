import { Loader2Icon, LogOutIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type LayoutProps } from "~/components/layout";
import { Button } from "~/components/ui/button";
import { useProtectedPage } from "~/utils/use-protected-page";

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
  const { isUnauthed } = useProtectedPage();
  if (isUnauthed) return <Loader2Icon className="animate-spin" />;

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
