import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { newQuerySchema } from "~/utils/schemas";

const COMMENTS_NUMBER = 3;

const queryResponseSchema = z.array(
  z.object({
    username: z.string(),
    message: z.string(),
  }),
);

export const queryRouter = createTRPCRouter({
  addNew: protectedProcedure
    .input(newQuerySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await fetch(`${env.API_BASE_URL}/api/comments`, {
          method: "POST",
          body: JSON.stringify({ ...input, commentsNumber: COMMENTS_NUMBER }),
          headers: {
            "Content-Type": "application/json",
            password: env.API_PASSWORD, // TODO: use actual process.env.AI_API_SECRET
          },
        });

        const parsedQueryResponse = queryResponseSchema.parse(
          await response.json(),
        );

        const query = await ctx.db.query.create({
          data: {
            input: input.query,
            type: input.type,
            register: input.register,
            userId: ctx.session.user.id,
          },
          select: {
            id: true,
            input: true,
          },
        });

        const comments = await ctx.db.$transaction(
          parsedQueryResponse.map((comment) =>
            ctx.db.comment.create({
              data: { queryId: query.id, ...comment },
              select: {
                id: true,
                username: true,
                message: true,
              },
            }),
          ),
        );

        return {
          queryNamesResponse: query,
          commentsResponse: {
            comments,
            queryData: {
              input: input.query,
              type: input.type,
              register: input.register,
            },
          },
        };
      } catch (error) {
        console.log({ error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong communicating with AI API, try again",
        });
      }
    }),
  getMoreCommentsToQueryId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const query = await ctx.db.query.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            input: true,
            type: true,
            register: true,
          },
        });

        if (!query) throw new TRPCError({ code: "NOT_FOUND" });

        const response = await fetch(`${env.API_BASE_URL}/api/comments`, {
          method: "POST",
          body: JSON.stringify({
            query: query.input,
            type: query.type,
            register: query.register,
            commentsNumber: COMMENTS_NUMBER,
          }),
          headers: {
            "Content-Type": "application/json",
            password: env.API_PASSWORD,
          },
        });

        const parsedQueryResponse = queryResponseSchema.parse(
          await response.json(),
        );
        const comments = await ctx.db.$transaction(
          parsedQueryResponse.map((comment) =>
            ctx.db.comment.create({
              data: { queryId: query.id, ...comment },
              select: {
                id: true,
                username: true,
                message: true,
              },
            }),
          ),
        );

        return {
          queryNamesResponse: query,
          commentsResponse: {
            comments,
            queryData: {
              input: query.input,
              type: query.type,
              register: query.register,
            },
          },
        };
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
