import { type Query } from "@prisma/client";
import { Loader2Icon, LogOutIcon, MenuIcon, PlusIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type LayoutProps } from "~/components/layout";
import { Button, buttonVariants } from "~/components/ui/button";
import { api } from "~/utils/api";
import { useProtectedPage } from "~/utils/use-protected-page";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ErrorAlert } from "~/components/error-alert";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { newQuerySchema } from "~/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "~/utils/classnames";
import ReactTextareaAutosize from "react-textarea-autosize";
import { type inferProcedureOutput } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import toast from "react-hot-toast";

const selectedQueryIdAtom = atom<string | null>(null);
const isNavOpenAtom = atom(false);

export function getStaticProps() {
  return {
    props: {
      layout: {
        title: "Dashboard | CommentGPT",
        description: "Dashboard of the CommentGPT app",
      } as LayoutProps,
    },
  };
}

export default function Dashboard() {
  useResetIsNavOpenAtom();
  useResetSelectedQueryIdAtom();

  const [isNavOpen, setIsNavOpen] = useAtom(isNavOpenAtom);

  const { isUnauthed } = useProtectedPage();
  if (isUnauthed) return <Loader2Icon className="animate-spin" />;

  return (
    <div className="flex w-full flex-1">
      {/* TODO: zrobic zeby na mobile otwieralo sie przyciskiem a nie w-[25vw] */}
      {/* TODO: h-screen na mobile nie */}
      {!isNavOpen && (
        <Button
          onClick={() => setIsNavOpen(true)}
          variant={"ghost"}
          className="absolute left-4 top-4 p-4 sm:hidden"
        >
          <MenuIcon />
        </Button>
      )}
      <SideSection />
      <div
        className={cn(
          "flex w-full items-center justify-center p-12 sm:blur-none sm:brightness-100",
          { "blur-sm": isNavOpen },
        )}
        onClick={isNavOpen ? () => setIsNavOpen(false) : () => undefined}
      >
        <MainPanel />
      </div>
    </div>
  );
}

function SideSection() {
  const [isNavOpen, setIsNavOpen] = useAtom(isNavOpenAtom);

  return (
    <div
      className={cn(
        "absolute z-50 flex h-screen w-[80vw] flex-col bg-neutral-900 p-2 transition-transform supports-[height:100dvh]:h-[100dvh] sm:sticky sm:left-0 sm:top-0 sm:w-56 sm:-translate-x-0 md:w-64 lg:w-72 xl:w-96",
        {
          "-translate-x-[100%]": !isNavOpen,
        },
      )}
    >
      <div className="mx-2 mt-2 flex justify-between gap-2">
        <Button
          onClick={() => setIsNavOpen(false)}
          variant={"ghost"}
          className="left-4 top-4 p-4 sm:hidden"
        >
          <MenuIcon />
        </Button>
        <Link
          href={"/"}
          className={buttonVariants({
            variant: "ghost",
            className: "flex-1 text-2xl font-extrabold tracking-tight",
          })}
        >
          <span className="text-center">
            Comment<span className="text-fuchsia-500">GPT</span>
          </span>
        </Link>
      </div>
      <div className="my-4 border-b border-b-neutral-500" />
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        <SidePanel />
      </div>
      <div className="my-4 border-b border-b-neutral-500" />
      <User />
    </div>
  );
}

function MainPanel() {
  const selectedQueryId = useAtomValue(selectedQueryIdAtom);

  const { data, isLoading, error, refetch, isRefetching } =
    api.comments.getAllByQueryId.useQuery(
      { id: selectedQueryId! },
      { enabled: !!selectedQueryId },
    );

  const [lastErrorMessage, setLastErrorMessage] = useState("");

  if (selectedQueryId) {
    // Display the name, and then this error in another component where comments would be
    if (!data && (error ?? lastErrorMessage)) {
      if (error?.message && error.message !== lastErrorMessage)
        setLastErrorMessage(error.message);
      return (
        <ErrorAlert
          message={error?.message ?? lastErrorMessage}
          isRefetching={isRefetching || isLoading}
          refetch={refetch as unknown as () => Promise<void>}
        />
      );
    }

    if (isLoading) return <Loader2Icon className="animate-spin" />;

    return <QueryWithResults queryId={selectedQueryId} data={data} />;
  }

  return <QueryForm />;
}

interface QueryWithResultsProps {
  queryId: string;
  data: inferProcedureOutput<AppRouter["comments"]["getAllByQueryId"]>;
}

function QueryWithResults({ queryId, data }: QueryWithResultsProps) {
  const utils = api.useContext();

  const [customIsLoading, setCustomIsLoading] = useState(false);

  const { mutate: addMoreComments } =
    api.queries.getMoreCommentsToQueryId.useMutation({
      onSuccess: async ({ commentsResponse, queryNamesResponse }) => {
        const currentComments = utils.comments.getAllByQueryId.getData({
          id: queryId,
        });
        utils.comments.getAllByQueryId.setData(
          { id: queryNamesResponse.id },
          {
            comments: [
              ...(currentComments?.comments ?? []),
              ...commentsResponse.comments,
            ],
            queryData: commentsResponse.queryData,
          },
        );
        setCustomIsLoading(false);
        await utils.comments.getAllByQueryId.invalidate({ id: queryId });
      },
      onError: () => {
        toast.error("Server error, please try again", {
          style: {
            backgroundColor: "#171717",
            color: "white",
            padding: "1rem 2rem",
          },
        });
        setCustomIsLoading(false);
      },
    });

  const handleAddMoreComments = () => {
    setCustomIsLoading(true);
    addMoreComments({ id: queryId });
  };

  return (
    <div className="w-full max-w-2xl space-y-4 pt-20 sm:pt-6 md:w-[80%]">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Enjoy your <span className="text-primary">comments</span>
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <label
            htmlFor="formality"
            className="label label-text flex cursor-pointer items-center gap-4"
          >
            Formal
            <input
              type="checkbox"
              id="formality"
              disabled
              className="toggle"
              checked={data.queryData.register === "formal"}
            />
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="positive"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Positive
              <input
                type="radio"
                className="radio"
                value="positive"
                id="positive"
                disabled
                checked={data.queryData.type === "positive"}
              />
            </label>
            <label
              htmlFor="neutral"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Neutral
              <input
                type="radio"
                className="radio"
                value="neutral"
                id="neutral"
                disabled
                checked={data.queryData.type === "neutral"}
              />
            </label>
            <label
              htmlFor="negative"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Negative
              <input
                type="radio"
                className="radio"
                value="negative"
                id="negative"
                disabled
                checked={data.queryData.type === "negative"}
              />
            </label>
          </div>
        </div>
        <div className="mt-2 flex flex-col">
          <ReactTextareaAutosize
            maxRows={8}
            maxLength={300}
            placeholder="Type your post content here..."
            id="firstName"
            value={data.queryData.input}
            disabled
            className={cn(
              "textarea textarea-bordered h-32 resize-none text-lg text-white",
            )}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {data.comments.map((comment) => (
          <div key={comment.id} className="card bg-neutral-900/60 text-lg">
            <div className="card-body">
              <h2 className="card-title w-fit bg-gradient-to-r from-fuchsia-400 to-fuchsia-700 bg-clip-text text-transparent">
                {comment.username}
              </h2>
              <p>{comment.message}</p>
            </div>
          </div>
        ))}
        <Button
          disabled={customIsLoading}
          onClick={handleAddMoreComments}
          className="mx-auto w-fit bg-primary px-6 hover:bg-primary/80"
        >
          {!customIsLoading && (
            <>
              <PlusIcon className="mr-2 h-6 w-6" />I need more!
            </>
          )}
          {customIsLoading && (
            <>
              <Loader2Icon className="mr-2 h-6 w-6 animate-spin" /> Loading more
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

const formSchema = newQuerySchema.omit({ register: true }).extend({
  isFormal: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

function QueryForm() {
  const [customIsLoading, setCustomIsLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (window.innerWidth > 640) textAreaRef.current?.focus();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const utils = api.useContext();
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);

  const { mutate: addNewQuery } = api.queries.addNew.useMutation({
    onSuccess: async ({ commentsResponse, queryNamesResponse }) => {
      setSelectedQueryId(queryNamesResponse.id);
      const currentQueries = utils.queries.getAllQueryNames.getData() ?? [];
      utils.queries.getAllQueryNames.setData(undefined, [
        queryNamesResponse,
        ...currentQueries,
      ]);
      utils.comments.getAllByQueryId.setData(
        { id: queryNamesResponse.id },
        commentsResponse,
      );
      await utils.queries.getAllQueryNames.invalidate();
    },
    onError: () => {
      toast.error("Server error, please try again", {
        style: {
          backgroundColor: "#171717",
          color: "white",
          padding: "1rem 2rem",
        },
      });
      setCustomIsLoading(false);
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    setCustomIsLoading(true);
    const finalData = {
      query: data.query,
      type: data.type,
      register: data.isFormal ? ("formal" as const) : ("informal" as const),
    };
    addNewQuery(finalData);
  };

  const { ref, ...rest } = register("query");

  return (
    <div className="w-full max-w-2xl space-y-4 md:w-[80%]">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Generate some <span className="text-primary">comments</span>
      </h1>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <label
            htmlFor="formality"
            className="label label-text flex cursor-pointer items-center gap-4"
          >
            Formal
            <input
              type="checkbox"
              defaultChecked
              {...register("isFormal")}
              id="formality"
              disabled={customIsLoading}
              className="toggle"
            />
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="positive"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Positive
              <input
                type="radio"
                className="radio"
                value="positive"
                {...register("type")}
                id="positive"
                disabled={customIsLoading}
                defaultChecked
              />
            </label>
            <label
              htmlFor="neutral"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Neutral
              <input
                type="radio"
                className="radio"
                value="neutral"
                {...register("type")}
                id="neutral"
                disabled={customIsLoading}
              />
            </label>
            <label
              htmlFor="negative"
              className="label label-text flex cursor-pointer items-center gap-4"
            >
              Negative
              <input
                type="radio"
                className="radio"
                value="negative"
                {...register("type")}
                id="negative"
                disabled={customIsLoading}
              />
            </label>
          </div>
        </div>
        <div className="label label-text-alt flex justify-end">
          <span>Max 300 characters</span>
        </div>
        <div className="flex flex-col">
          <ReactTextareaAutosize
            maxRows={8}
            maxLength={300}
            ref={(e) => {
              ref(e);
              textAreaRef.current = e;
            }}
            placeholder="Type your post content here..."
            id="firstName"
            {...rest}
            disabled={customIsLoading}
            className={cn(
              "textarea textarea-bordered h-32 resize-none text-lg text-white",
              {
                "textarea-error text-error": errors.query,
              },
            )}
          />
          {errors.query && (
            <div className="label label-text-alt mt-1 text-error">
              {errors.query.message}
            </div>
          )}
        </div>
        <Button
          disabled={customIsLoading}
          className="mt-2 bg-primary hover:bg-primary/80"
        >
          {customIsLoading && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit{customIsLoading && "ting"}
        </Button>
      </form>
    </div>
  );
}

function SidePanel() {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);
  const setIsNavOpen = useSetAtom(isNavOpenAtom);

  return (
    <>
      <div className="w-full px-2">
        <Button
          className="w-full"
          // className="text-semibold flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-5 py-3 font-semibold text-white"
          onClick={() => {
            setSelectedQueryId(null);
            setIsNavOpen(false);
          }}
        >
          <PlusIcon className="mr-2 text-fuchsia-500" /> Add new
        </Button>
      </div>
      <QueryList />
    </>
  );
}

function QueryList() {
  const { data, isLoading, error, isRefetching, refetch } =
    api.queries.getAllQueryNames.useQuery();

  const [lastErrorMessage, setLastErrorMessage] = useState("");

  if (!data && (error ?? lastErrorMessage)) {
    if (error?.message && error.message !== lastErrorMessage)
      setLastErrorMessage(error.message);
    return (
      <ErrorAlert
        isSidePanel
        message={error?.message ?? lastErrorMessage}
        isRefetching={isRefetching || isLoading}
        refetch={refetch as unknown as () => Promise<void>}
      />
    );
  }

  if (isLoading) return <Loader2Icon className="mt-4 animate-spin" />;

  return (
    <>
      {data.map((query) => (
        <QueryElement key={query.id} {...query} />
      ))}
    </>
  );
}

function QueryElement({ id, input }: Pick<Query, "id" | "input">) {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);
  const setIsNavOpen = useSetAtom(isNavOpenAtom);

  const utils = api.useContext();

  const onHover = () => {
    if (utils.comments.getAllByQueryId.getData({ id })) return;
    void utils.comments.getAllByQueryId.prefetch({ id });
  };

  return (
    <div onMouseOver={onHover} className="w-full px-2">
      <Button
        className="block w-full truncate"
        // className="text-semibold w-full rounded-lg bg-neutral-800 px-5 py-3 text-white"
        onClick={() => {
          setSelectedQueryId(id);
          setIsNavOpen(false);
        }}
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

const useResetSelectedQueryIdAtom = () => {
  const setSelectedQueryId = useSetAtom(selectedQueryIdAtom);
  useEffect(() => () => setSelectedQueryId(null), [setSelectedQueryId]);
};

const useResetIsNavOpenAtom = () => {
  const setIsNavOpenAtom = useSetAtom(isNavOpenAtom);
  useEffect(() => () => setIsNavOpenAtom(false), [setIsNavOpenAtom]);
};
