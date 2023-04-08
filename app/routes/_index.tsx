import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import {
  Await,
  Form,
  Link,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import { useOptionalUser } from "~/utils";
import { createPost, getLatestPosts } from "~/models/post.server";
import { defer, json, redirect } from "@remix-run/node";
import React, { Suspense, useEffect, useRef } from "react";
import { requireUserId } from "~/session.server";
import { PostView } from "~/components/post-view";

export const meta: V2_MetaFunction = () => [{ title: "Csirip!" }];

export async function loader() {
  const posts = getLatestPosts().then((posts) =>
    posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }))
  );
  return defer({ posts });
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
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting";

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  return (
    <main>
      {user && (
        <Form
          method="post"
          ref={formRef}
          className="flex justify-between gap-2"
        >
          <input
            type="text"
            placeholder="Csirip csirip..."
            name="content"
            className="box-shadow-black w-full rounded border-2 border-black px-1 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="box-shadow-black active:box-shadow-black-active rounded border-2 border-solid border-black bg-teal-500 p-2 text-white hover:bg-teal-400 active:bg-teal-600"
          >
            Csirip!
          </button>
        </Form>
      )}
      <Suspense fallback={<p>Loading...</p>}>
        <Await resolve={data.posts}>
          {(posts) => {
            return posts.map((post) => {
              return <PostView key={post.id} post={post} />;
            });
          }}
        </Await>
      </Suspense>
    </main>
  );
}
