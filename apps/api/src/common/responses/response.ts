import { Context } from "hono";

export function successResponse(c: Context, message: string, data: any = {}, meta: any = {}, status: number = 200) {
  return c.json({
    success: true,
    message,
    data,
    meta,
  }, status as any);
}

export function errorResponse(c: Context, message: string, errors: any[] = [], status: number = 400) {
  return c.json({
    success: false,
    message,
    errors,
  }, status as any);
}
