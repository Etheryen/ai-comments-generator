import { queryRouter } from "~/server/api/routers/query";
import { createTRPCRouter } from "~/server/api/trpc";
import { commentRouter } from "./routers/comment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  queries: queryRouter,
  comments: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
