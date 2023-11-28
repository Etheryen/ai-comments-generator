import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { newQuerySchema } from "~/utils/schemas";

const testComments = [
  {
    username: "@johndoeAAAAAAAAAAAAAA",
    message:
      "Hi there! Welcome to Facebook 🎉 I hope you enjoy exploring all of the features and connecting with friends and family. Let me know if you have any questions or need help getting started! 😊 #FacebookWelcome #NewToSocialMedia",
  },
  {
    username: "@mariagomez",
    message:
      "Welcome aboard! We are happy to see new users on our page, especially during this challenging time. Don't hesitate to reach out if you need any assistance or have questions about how to use Facebook effectively. 😊 #FacebookCommunity #WelcomeToSocialMedia",
  },
  {
    username: "@sarahjones",
    message:
      "Hi there! Welcome to the world of social media 🌐 We hope you find it fun and engaging, and that you connect with people who share your interests and passions. Don't forget to personalize your profile and add a cover photo so you can make an even better impression! 😊 #FacebookWelcome #NewToSocialMedia",
  },
  {
    username: "@markdavis",
    message:
      "Welcome to the biggest social network on Earth 🌍 It can be overwhelming at first, but with some experimentation and practice, you'll soon find your groove. Don't forget to join groups that interest you and participate in conversations to build",
  },
  {
    username: "@jessicawu",
    message:
      "Hello! Welcome to the vast world of social media 🌐 We hope you enjoy connecting with friends, sharing your thoughts and ideas, and discovering new content that inspires you. Remember to be kind and respectful to others, and don't hesitate to reach out if you need help or have questions. 😊 #FacebookWelcome #NewToSocialMedia",
  },
];

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
      await new Promise((r) => setTimeout(r, 1500));
      try {
        // const response = await fetch(`${env.API_BASE_URL}/api/comments`, {
        //   method: "POST",
        //   body: JSON.stringify({ ...input, commentsNumber: 5 }),
        //   headers: {
        //     "Content-Type": "application/json",
        //     password: env.API_PASSWORD, // TODO: use actual process.env.AI_API_SECRET
        //   },
        // });
        //
        // const parsedQueryResponse = queryResponseSchema.parse(
        //   await response.json(),
        // );

        const parsedQueryResponse = testComments;

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
      await new Promise((r) => setTimeout(r, 1500));
      try {
        // const response = await fetch(`${env.API_BASE_URL}/api/comments`, {
        //   method: "POST",
        //   body: JSON.stringify({ ...input, commentsNumber: 5 }),
        //   headers: {
        //     "Content-Type": "application/json",
        //     password: env.API_PASSWORD, // TODO: use actual process.env.AI_API_SECRET
        //   },
        // });
        //
        // const parsedQueryResponse = queryResponseSchema.parse(
        //   await response.json(),
        // );

        const parsedQueryResponse = testComments;

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
