import { Hono } from "hono";
import { authRouter } from "./features/auth/index.js";
import { memberRouter, branchRouter } from "./features/members/index.js";
import {
  categoryRouter,
  businessRouter,
  galleryRouter,
  productRouter,
  serviceRouter,
  verificationRouter,
  searchRouter,
  analyticsRouter,
} from "./features/business/index.js";

import { serviceProvidersRouter } from "./features/service-providers/index.js";

export const apiRouter = new Hono();

// Version 1 Base Endpoint
apiRouter.get("/v1", (c) => {
  return c.json({
    message: "Welcome to EzhavaClub API v1",
    timestamp: new Date().toISOString(),
  });
});

// Register feature routers
apiRouter.route("/v1/auth", authRouter);
apiRouter.route("/v1/members", memberRouter);
apiRouter.route("/v1/branches", branchRouter);

// Feature 03 - Business Management
apiRouter.route("/v1/business-categories", categoryRouter);
apiRouter.route("/v1/businesses", businessRouter);
apiRouter.route("/v1/business-gallery", galleryRouter);
apiRouter.route("/v1/business-products", productRouter);
apiRouter.route("/v1/business-services", serviceRouter);
apiRouter.route("/v1/business-verification", verificationRouter);
apiRouter.route("/v1/business-search", searchRouter);
apiRouter.route("/v1/business-analytics", analyticsRouter);

// Feature 04 - Service Provider Module
apiRouter.route("/v1", serviceProvidersRouter);

// Feature 05 - Discovery Platform
import discoveryRouter from "./features/discovery/index.js";
import { adminFeaturedRouter } from "./features/discovery/featured/routes.js";
apiRouter.route("/v1/discovery", discoveryRouter);
apiRouter.route("/v1/admin", adminFeaturedRouter);

// Feature 06 - Community Engagement Platform
import { communityRouter } from "./features/community/index.js";
apiRouter.route("/v1/community", communityRouter);

// Feature 07 - User Engagement
import { favoritesRouter, ratingsRouter, reviewsRouter, adminReviewsRouter, bookmarksRouter, shareLinksRouter, emailRouter } from "./features/engagement/index.js";
apiRouter.route("/v1/favorites", favoritesRouter);
apiRouter.route("/v1/ratings", ratingsRouter);
apiRouter.route("/v1/reviews", reviewsRouter);
apiRouter.route("/v1/admin", adminReviewsRouter);
apiRouter.route("/v1/bookmarks", bookmarksRouter);
apiRouter.route("/v1/share-links", shareLinksRouter);
apiRouter.route("/v1/email", emailRouter);

