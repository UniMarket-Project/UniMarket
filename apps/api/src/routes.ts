import { Router } from "express";
import { authRouter } from "./modules/auth/index.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
