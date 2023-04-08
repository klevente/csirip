import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import { useOptionalUser } from "~/utils";
import { createPost, getLatestPosts } from "~/models/post.server";
import { json, redirect } from "@remix-run/node";
import React, { useEffect, useRef } from "react";
import { requireUserId } from "~/session.server";
import { PostView } from "~/components/post-view";

export const meta: V2_MetaFunction = () => [{ title: "Csirip!" }];

export async function loader() {
  const posts = await getLatestPosts();
  return json({ posts });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const content = formData.get("content");

  if (typeof content !== "string" || content.length === 0) {
    return json({ errors: { post: "Content is required" } }, { status: 400 });
  }

  await createPost({ content, userId });

  return redirect("/");
}

export default function Index() {
  const user = useOptionalUser();
  const { posts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <main className="relative min-h-screen">
      <h1>Csirip!</h1>
      {user ? (
        <>
          <Form method="post" ref={formRef}>
            <input type="text" placeholder="Csirip?" name="content" />
            <button type="submit">Csiripelek!</button>
          </Form>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </>
      ) : (
        <Link to="/login">Log in!</Link>
      )}
      {posts.map((post) => {
        return <PostView key={post.id} post={post} />;
      })}
    </main>
  );
}
