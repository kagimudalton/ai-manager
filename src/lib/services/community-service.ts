import { db } from "@/lib/db";

export async function getGroups() {
  return db.communityGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export async function getGroupWithPosts(groupId: string, userId: string) {
  const blocks = await db.block.findMany({ where: { blockerId: userId } });
  const blockedIds = blocks.map((b) => b.blockedUserId);

  const group = await db.communityGroup.findUnique({
    where: { id: groupId },
    include: {
      posts: {
        where: { authorId: { notIn: blockedIds } },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          reactions: true,
        },
      },
    },
  });

  return group;
}

export async function toggleReaction(postId: string, userId: string) {
  const existing = await db.reaction.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
    return { liked: false };
  }
  await db.reaction.create({ data: { postId, userId, type: "like" } });
  return { liked: true };
}

export async function reportPost(postId: string, reporterId: string) {
  return db.report.create({ data: { postId, reporterId } });
}

export async function blockUser(blockerId: string, blockedUserId: string) {
  return db.block.upsert({
    where: { blockerId_blockedUserId: { blockerId, blockedUserId } },
    update: {},
    create: { blockerId, blockedUserId },
  });
}