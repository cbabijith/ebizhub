import { Context } from "hono";

export function getPaginationParams(c: Context) {
  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = parseInt(c.req.query("limit") || "20", 10);

  const sanitizedPage = isNaN(page) || page < 1 ? 1 : page;
  const sanitizedLimit = isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100);
  const offset = (sanitizedPage - 1) * sanitizedLimit;

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset,
  };
}

export function formatPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
  };
}
