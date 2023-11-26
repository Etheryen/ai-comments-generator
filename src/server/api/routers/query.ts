import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
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
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const response = await fetch(`${env.API_BASE_URL}/api/comments`, {
          method: "POST",
          body: JSON.stringify({ ...input, commentsNumber: 5 }),
          headers: {
            "Content-Type": "application/json",
            password: env.API_PASSWORD, // TODO: use actual process.env.AI_API_SECRET
          },
        });
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
