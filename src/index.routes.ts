import { Router } from "express";
import songRoutes from "./features/songs/song.routes";

const routes = Router();

routes.use("/songs", songRoutes);

export default routes;
