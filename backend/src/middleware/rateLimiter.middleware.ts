// API rate limiting protection
import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,   // 15 min
  max: 300,                    // 300 requests/window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later."
});
