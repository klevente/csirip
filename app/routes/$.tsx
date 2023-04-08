import { getPostsByUser } from "~/models/post.server";
import invariant from "tiny-invariant";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PostView } from "~/components/post-view";

export async function loader({ params }: LoaderArgs) {
  const username = params["*"];
  invariant(username, "username not found");

  const posts = await getPostsByUser(username);
  const postsWithUser = posts.map((post) => ({
    ...post,
    user: {
      username,
    },
  }));

  return json({ posts: postsWithUser, username });
}

export default function AuthorPage() {
  const { posts, username } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>@{username}'s profile</h1>
      <div>
        {posts.map((post) => (
          <PostView key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
