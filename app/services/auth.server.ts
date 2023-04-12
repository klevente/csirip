import { Authenticator } from "remix-auth";
import { getSession, sessionStorage } from "~/services/session.server";
import type { User } from "@prisma/client";
import { FormStrategy } from "remix-auth-form";
import {
  findOrCreateUserFromOAuthProvider,
  verifyLogin,
} from "~/models/user.server";
import invariant from "tiny-invariant";
import { NoUserError, UnreachableCaseError } from "~/error";
import { GoogleStrategy } from "remix-auth-google";
import {
  DiscordStrategy,
  GitHubStrategy,
  SocialsProvider,
} from "remix-auth-socials";

type FormContext =
  | {
      type: "login";
      email: string;
      password: string;
    }
  | {
      type: "registration";
      user: User;
    };

invariant(sessionStorage, "Session storage must exist");
export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ context }) => {
    const typedContext = context as FormContext;
    console.log(typedContext);
    switch (typedContext.type) {
      case "registration":
        return typedContext.user;
      case "login":
        const { email, password } = typedContext;
        const user = await verifyLogin(email, password);
        if (!user) {
          throw new NoUserError();
        }
        return user;
      default:
        throw new UnreachableCaseError(typedContext);
    }
  }),
  "form"
);

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: ["openid", "email", "profile"],
      callbackURL: `${process.env.APP_URL}/auth/${SocialsProvider.GOOGLE}/callback`,
    },
    async ({ profile }) => {
      return findOrCreateUserFromOAuthProvider(profile.emails[0].value);
    }
  )
);

authenticator.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.APP_URL}/auth/${SocialsProvider.GITHUB}/callback`,
    },
    async ({ profile }) => {
      return findOrCreateUserFromOAuthProvider(profile.emails[0].value);
    }
  )
);

authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      callbackURL: `${process.env.APP_URL}/auth/${SocialsProvider.DISCORD}/callback`,
    },
    async ({ profile }) => {
      console.log(JSON.stringify(profile));
      const email = profile.__json.email;
      if (!email) {
        throw new Error("No email");
      }
      return findOrCreateUserFromOAuthProvider(email);
    }
  )
);

export async function getUser(request: Request) {
  const session = await getSession(request);
  const user = session.get(authenticator.sessionKey);
  if (!user) {
    return null;
  }
  return user as User;
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    return await authenticator.logout(request, {
      redirectTo: "/",
    });
  }
  return user;
}

/*export async function createUserSession({
  request,
  user,
  remember,
  redirectTo,
}: {
  request: Request;
  user: User;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(authenticator.sessionKey, user);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}*/
