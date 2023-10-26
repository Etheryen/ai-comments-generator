import { Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorAlertProps {
  message: string;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

export function ErrorAlert({
  message,
  isRefetching,
  refetch,
}: ErrorAlertProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-neutral-900/80 p-6">
      <div className="text-xl font-semibold text-red-600">
        Error occured: {message}
      </div>
      <Button
        disabled={isRefetching}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => refetch()}
      >
        {isRefetching && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Retry{isRefetching && "ing"}
      </Button>
    </div>
  );
}
