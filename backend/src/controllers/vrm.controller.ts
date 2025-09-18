// VRM animation control APIs
import { Request, Response } from "express";

export const sendGesture = (req: Request, res: Response) => {
  const { gesture } = req.body;             // e.g. "ThumbsUp"
  req.app.get("io").of("/vrm").emit("gesture_request", { gesture });
  res.json({ status: "queued" });
};
