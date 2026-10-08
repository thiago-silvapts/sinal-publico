import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { deleteUserProfile, getUserProfileById, updateUserProfile } from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    profile: router({
      me: protectedProcedure.query(({ ctx }) => getUserProfileById(ctx.user.id)),
      update: protectedProcedure.input(z.object({
        name: z.string().trim().min(2).max(160),
        email: z.string().email(),
        phone: z.string().trim().min(8).max(32),
        city: z.string().trim().min(2).max(120),
        state: z.string().length(2),
        gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say", "other"]),
        appRole: z.enum(["deaf_person", "interpreter", "establishment"]),
      })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.id, input)),
      remove: protectedProcedure.mutation(({ ctx }) => deleteUserProfile(ctx.user.id)),
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
