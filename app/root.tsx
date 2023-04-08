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
import { getUser } from "./session.server";
import React from "react";

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
            {user ? (
              <div className="flex items-center gap-2">
                <Link className="hover:underline" to={`/${user.username}`}>
                  @{user.username}
                </Link>
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="box-shadow-black active:box-shadow-black-active w-full rounded border-2 border-black px-1 py-2 hover:bg-gray-100 active:bg-gray-200"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            ) : (
              <button className="box-shadow-black active:box-shadow-black-active rounded border-2 border-solid border-black bg-teal-500 p-2 text-white hover:bg-teal-400 active:bg-teal-600">
                <Link to="/login">Login</Link>
              </button>
            )}
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
