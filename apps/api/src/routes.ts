import { Router } from "express";
import { authRouter } from "./modules/auth/index.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
