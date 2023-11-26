import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  getAllByQueryId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [comments, queryData] = await Promise.allSettled([
        ctx.db.comment.findMany({
          select: {
            id: true,
            username: true,
            message: true,
          },
          where: {
            queryId: input.id,
            query: {
              userId: ctx.session.user.id,
            },
          },
          take: 100,
        }),
        ctx.db.query.findUnique({
          where: {
            id: input.id,
          },
          select: {
            input: true,
            type: true,
            register: true,
          },
        }),
      ]);
      if (
        comments.status === "rejected" ||
        queryData.status === "rejected" ||
        !queryData.value
      )
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database error, please try again",
        });

      return { comments: comments.value, queryData: queryData.value };
    }),
});
