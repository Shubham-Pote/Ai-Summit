// Settings API routes
import { Router } from "express";
import {
  switchLanguage,
  getSession
} from "../controllers/settings.controller";

const router = Router();

router.post("/language", switchLanguage);
router.get("/session", getSession);

export default router;
