import { Hono } from "hono";
import homeRouter from "./home/routes.js";
import businessDirectoryRouter from "./business-directory/routes.js";
import providerDirectoryRouter from "./provider-directory/routes.js";
import { searchRouter } from "./search/routes.js";
import { categoriesRouter } from "./categories/routes.js";
import analyticsRouter from "./analytics/routes.js";

// Sprint 3 modules
import featuredRouter from "./featured/routes.js";
import recommendationsRouter from "./recommendations/routes.js";
import trendingRouter from "./trending/routes.js";
import recentRouter from "./recent/routes.js";
import popularCategoriesRouter from "./popular-categories/routes.js";

const discoveryRouter = new Hono();

// Sprint 1
discoveryRouter.route("/", homeRouter);
discoveryRouter.route("/", businessDirectoryRouter);
discoveryRouter.route("/", providerDirectoryRouter);
discoveryRouter.route("/", searchRouter);
discoveryRouter.route("/", categoriesRouter);
discoveryRouter.route("/", analyticsRouter);

// Sprint 3
discoveryRouter.route("/", featuredRouter);
discoveryRouter.route("/", recommendationsRouter);
discoveryRouter.route("/", trendingRouter);
discoveryRouter.route("/", recentRouter);
discoveryRouter.route("/", popularCategoriesRouter);

export default discoveryRouter;
