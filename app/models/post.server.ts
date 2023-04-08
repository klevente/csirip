import type { Post, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function createPost({
  content,
  userId,
}: {
  content: Post["content"];
  userId: User["id"];
}) {
  return prisma.post.create({
    data: {
      content,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function getPost(id: Post["id"]) {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}

export function getPostsByUser(username: User["username"]) {
  return prisma.post.findMany({
    where: {
      user: {
        username,
      },
    },
    take: 100,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });
}

export async function getLatestPosts() {
  return prisma.post.findMany({
    take: 100,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });
}
