import { Hono } from "hono";
import { newsCategoriesRouter } from "./categories/routes.js";
import { communityNewsRouter } from "./news/routes.js";
import { eventsRouter } from "./events/routes.js";
import { jobsRouter } from "./jobs/routes.js";
import { offersRouter } from "./offers/routes.js";
import { noticesRouter } from "./notices/routes.js";
import { bannersRouter } from "./banners/routes.js";
import { communityAnalyticsRouter } from "./analytics/routes.js";

export const communityRouter = new Hono();

communityRouter.route("/categories", newsCategoriesRouter);
communityRouter.route("/news", communityNewsRouter);
communityRouter.route("/events", eventsRouter);
communityRouter.route("/jobs", jobsRouter);
communityRouter.route("/offers", offersRouter);
communityRouter.route("/notices", noticesRouter);
communityRouter.route("/banners", bannersRouter);
communityRouter.route("/analytics", communityAnalyticsRouter);
