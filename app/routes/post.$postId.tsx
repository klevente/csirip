import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PostView } from "~/components/post-view";

export async function loader({ params }: LoaderArgs) {
  invariant(params.postId, "noteId not found");

  const post = await getPost(params.postId);

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
}

export default function PostDetailsPage() {
  const { post } = useLoaderData<typeof loader>();

  return <PostView post={post} />;
}
