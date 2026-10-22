import { Router } from "express";
import { authRouter } from "./modules/auth/index.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { verificationRouter } from "./modules/verification/verification.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { ratingsRouter } from "./modules/ratings/ratings.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/verification", verificationRouter);
apiV1Router.use("/notifications", notificationsRouter);
apiV1Router.use("/ratings", ratingsRouter);
apiV1Router.use("/admin", adminRouter);