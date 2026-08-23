export type FeedbackNotificationItem = {
  id: string;
  updatedAt: Date | string | null;
  status: string;
  adminReply?: string | null;
};

export function getFeedbackNotification(items: FeedbackNotificationItem[]): string | null {
  const latest = items
    .filter(item => item.updatedAt && (Boolean(item.adminReply) || item.status !== "Nouveau"))
    .sort((a, b) => new Date(b.updatedAt as Date | string).getTime() - new Date(a.updatedAt as Date | string).getTime())[0];
  if (!latest) return null;
  return latest.adminReply
    ? "L’administration a répondu à votre demande."
    : `Votre demande est maintenant : ${latest.status}.`;
}

export function matchesFeedbackSearch(value: string, search: string): boolean {
  return value.toLocaleLowerCase("fr-FR").includes(search.trim().toLocaleLowerCase("fr-FR"));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  return items.slice((safePage - 1) * safePageSize, safePage * safePageSize);
}

export function buildFeedbackCsv(rows: unknown[][]): string {
  const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return "\uFEFF" + rows.map(row => row.map(escapeCsv).join(";")).join("\n");
}
