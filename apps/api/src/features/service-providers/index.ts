import { Hono } from "hono";
import { serviceCategoriesRouter } from "./service-categories/routes.js";
import { providersRouter } from "./providers/routes.js";

export const serviceProvidersRouter = new Hono();

serviceProvidersRouter.route("/service-categories", serviceCategoriesRouter);
serviceProvidersRouter.route("/providers", providersRouter);
