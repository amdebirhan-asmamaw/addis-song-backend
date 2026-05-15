import type { Request, Response, NextFunction } from "express";
import { songService } from "./song.service";
import { getOverallStats } from "./song.stats";
import { apiResponse } from "../../utils/apiResponse";

export const songController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const genre = req.query.genre as string | undefined;
      const songs = await songService.getAll(genre ? { genre } : undefined);
      res.json(
        apiResponse({ success: true, message: "Songs retrieved", data: songs }),
      );
    } catch (err) {
      next(err);
    }
  },

  async getOne(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const song = await songService.getById(req.params.id as string);
      if (!song) {
        res
          .status(404)
          .json(apiResponse({ success: false, message: "Song not found" }));
        return;
      }
      res.json(
        apiResponse({ success: true, message: "Song retrieved", data: song }),
      );
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const song = await songService.create(req.body);
      res
        .status(201)
        .json(
          apiResponse({ success: true, message: "Song created", data: song }),
        );
    } catch (err) {
      next(err);
    }
  },

  async update(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const song = await songService.update(req.params.id as string, req.body);
      if (!song) {
        res
          .status(404)
          .json(apiResponse({ success: false, message: "Song not found" }));
        return;
      }
      res.json(
        apiResponse({ success: true, message: "Song updated", data: song }),
      );
    } catch (err) {
      next(err);
    }
  },

  async remove(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const song = await songService.remove(req.params.id as string);
      if (!song) {
        res
          .status(404)
          .json(apiResponse({ success: false, message: "Song not found" }));
        return;
      }
      res.json(
        apiResponse({ success: true, message: "Song deleted", data: song }),
      );
    } catch (err) {
      next(err);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await getOverallStats();
      res.json(
        apiResponse({
          success: true,
          message: "Statistics retrieved",
          data: stats,
        }),
      );
    } catch (err) {
      next(err);
    }
  },
};
