import React from "react";
import { Link } from "@remix-run/react";

type PostViewProps = {
  post: {
    id: string;
    content: string;
    createdAt: string;
    user: { username: string };
  };
};

export const PostView: React.FC<PostViewProps> = ({ post }) => {
  return (
    <div>
      <h2>
        <Link to={`/${post.user.username}`}>{post.user.username}</Link> -{" "}
        <Link to={`post/${post.id}`}>{post.createdAt}</Link>
      </h2>
      <p>{post.content}</p>
    </div>
  );
};
