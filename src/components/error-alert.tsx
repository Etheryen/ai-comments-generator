import { Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "~/utils/classnames";
import { type PropsWithChildren } from "react";

interface ErrorAlertProps {
  message: string;
  isRefetching: boolean;
  isSidePanel?: boolean;
  refetch: () => Promise<void>;
}

export function ErrorAlert({
  isSidePanel = false,
  message,
  isRefetching,
  refetch,
}: ErrorAlertProps) {
  return (
    <Wrapper isDiv={isSidePanel}>
      <div
        className={cn("flex flex-col gap-4 rounded-md p-6", {
          "bg-neutral-800/80": isSidePanel,
          "bg-neutral-900/80": !isSidePanel,
        })}
      >
        <div className="overflow-hidden text-ellipsis text-xl font-semibold text-red-600">
          Error occured: {message}
        </div>
        <Button
          className={cn({
            "bg-neutral-700 hover:bg-neutral-600/70": isSidePanel,
          })}
          disabled={isRefetching}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={refetch}
        >
          {isRefetching && (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Retry{isRefetching && "ing"}
        </Button>
      </div>
    </Wrapper>
  );
}

interface WrapperProps extends PropsWithChildren {
  isDiv: boolean;
}

function Wrapper({ isDiv, children }: WrapperProps) {
  return isDiv ? <div className="w-full px-2">{children}</div> : children;
}
