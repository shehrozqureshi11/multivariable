import { prisma } from "./prisma";

export async function writeAudit(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: unknown;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId || undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as object | undefined,
      ip: params.ip,
    },
  });
}

export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function notify(
  userId: string,
  title: string,
  body: string,
  type:
    | "SYSTEM"
    | "INVESTMENT"
    | "PAYMENT"
    | "FARM"
    | "DISPUTE" = "SYSTEM",
  link?: string
) {
  return prisma.notification.create({
    data: { userId, title, body, type, link },
  });
}
