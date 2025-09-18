// Character settings APIs
import { Request, Response } from "express";
import CharacterSession from "../models/characterSession";

export const switchLanguage = async (req: Request, res: Response) => {
  const { language } = req.body;            // "es" | "ja"
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const session = await CharacterSession.findOneAndUpdate(
    { userId: userId },
    { language },
    { new: true, upsert: true }
  );
  res.json({ mode: session.language });
};

export const getSession = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const session = await CharacterSession.findOne({ userId: userId });
  res.json(session);
};
