// middleware/auth.middleware.ts - UPDATED VERSION
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: { userId: string }
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ 
                success: false, 
                message: 'No authentication token, access denied' 
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        // FIXED: Only assign userId (no 'id' property)
        req.user = { userId: decoded.userId };
        
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};
