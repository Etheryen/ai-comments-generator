import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  getAllByQueryId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.db.comment.findMany({
        select: {
          id: true,
          text: true,
        },
        where: {
          queryId: input.id,
          query: {
            userId: ctx.session.user.id,
          },
        },
        take: 100,
      });
    }),
});
