import React from "react";
import { Link } from "@remix-run/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostViewProps = {
  post: {
    id: string;
    content: string;
    createdAt: string;
    user: { username: string };
  };
};

export const PostView: React.FC<PostViewProps> = ({ post }) => {
  const fromNow = dayjs(post.createdAt).fromNow();
  return (
    <div className="my-4 rounded border-2 border-solid border-black p-4">
      <h2>
        <Link className="hover:underline" to={`/${post.user.username}`}>
          @{post.user.username}
        </Link>{" "}
        -{" "}
        <Link className="hover:underline" to={`post/${post.id}`}>
          {fromNow}
        </Link>
      </h2>
      <p>{post.content}</p>
    </div>
  );
};
