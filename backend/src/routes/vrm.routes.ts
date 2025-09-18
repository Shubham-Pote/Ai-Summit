// VRM animation API routes
import { Router } from "express";
import { sendGesture } from "../controllers/vrm.controller";

const router = Router();

router.post("/gesture", sendGesture);

export default router;
