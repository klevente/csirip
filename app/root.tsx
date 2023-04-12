import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./services/auth.server";
import React from "react";
import { Button } from "~/components/ui/button";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="mx-2 my-4 min-h-screen max-w-xl sm:mx-auto">
        <header className="mb-8">
          <nav className="flex items-center justify-between">
            <h1>
              <Link to="/" className="text-2xl">
                🐦
              </Link>
            </h1>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link className="hover:underline" to={`/${user.username}`}>
                    @{user.username}
                  </Link>
                  <Form action="/logout" method="post">
                    <Button intent="secondary" type="submit">
                      Logout
                    </Button>
                  </Form>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button intent="secondary">Sign up</Button>
                  </Link>
                  <Link to="/login">
                    <Button>Login</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
