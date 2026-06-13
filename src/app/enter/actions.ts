"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfigured } from "@/lib/env";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

const SERVER_MISCONFIG =
  "The glade isn't wired yet — add AUTH_SECRET in Vercel (Settings → Environment Variables), then redeploy.";

export type AuthState = { error?: string; ok?: boolean };

const credentials = z.object({
  email: z.string().email("That doesn't look like a raven's address."),
  password: z.string().min(8, "A passphrase needs at least 8 letters."),
});

const signUpSchema = credentials.extend({
  name: z.string().trim().min(1, "Tell the keeper your name.").max(60),
});

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!authConfigured()) return { error: SERVER_MISCONFIG };

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Something went awry." };
  }
  const { name, email, password } = parsed.data;
  const normalized = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return { error: "A library already grows under that address. Try returning instead." };
    }

    const user = await prisma.user.create({
      data: { name, email: normalized, passwordHash: await hashPassword(password) },
      select: { id: true },
    });

    await createSession(user.id);
    redirect("/dashboard");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error("signUpAction", e);
    return { error: "Could not reach the library vault. Check DATABASE_URL on Vercel and redeploy." };
  }
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!authConfigured()) return { error: SERVER_MISCONFIG };

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Something went awry." };
  }
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: "Those words don't match any tome here." };
    }

    await createSession(user.id);
    redirect("/dashboard");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error("signInAction", e);
    return { error: "Could not reach the library vault. Check DATABASE_URL on Vercel and redeploy." };
  }
}
