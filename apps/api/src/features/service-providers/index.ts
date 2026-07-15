import { Hono } from "hono";
import { serviceCategoriesRouter } from "./service-categories/routes.js";
import { providersRouter } from "./providers/routes.js";
import { portfolioRouter } from "./portfolio/routes.js";
import { skillsRouter } from "./provider-skills/routes.js";
import { areasRouter } from "./service-areas/routes.js";
import { publicProvidersRouter } from "./public/routes.js";
import { searchProvidersRouter } from "./search/routes.js";

export const serviceProvidersRouter = new Hono();

serviceProvidersRouter.route("/service-categories", serviceCategoriesRouter);
serviceProvidersRouter.route("/providers", providersRouter);
serviceProvidersRouter.route("/portfolio", portfolioRouter);
serviceProvidersRouter.route("/provider-skills", skillsRouter);
serviceProvidersRouter.route("/service-areas", areasRouter);
serviceProvidersRouter.route("/service-providers/search", searchProvidersRouter);
serviceProvidersRouter.route("/service-providers", publicProvidersRouter);
