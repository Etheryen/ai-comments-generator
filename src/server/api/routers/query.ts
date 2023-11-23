import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { newQuerySchema } from "~/utils/schemas";

const queryResponseSchema = z.object({
  comments: z.array(
    z.object({
      text: z.string(),
    }),
  ),
});

export const queryRouter = createTRPCRouter({
  addNew: protectedProcedure
    .input(newQuerySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await fetch(
          "https://railway.io/project/2489ysd7f78tn8fsdfsdf/api/query",
          {
            method: "POST",
            body: JSON.stringify({ ...input }),
            headers: {
              "Content-Type": "application/json",
              PasswordHash: "daw78dhaw78dhaw78da", // TODO: use actual process.env.AI_API_SECRET
            },
          },
        );
        const parsedQueryResponse = queryResponseSchema.parse(
          await response.json(),
        );

        const { id } = await ctx.db.query.create({
          data: {
            input: input.query,
            type: input.type,
            register: input.register,
            userId: ctx.session.user.id,
          },
        });

        await ctx.db.comment.createMany({
          data: parsedQueryResponse.comments.map((comment) => ({
            queryId: id,
            text: comment.text,
          })),
        });

        return { status: "ok" } as const;
      } catch (error) {
        console.log({ error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong communicating with AI API, try again",
        });
      }
    }),
  getAllQueryNames: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.findMany({
      select: {
        id: true,
        input: true,
      },
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }),
});
