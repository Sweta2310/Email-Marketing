import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import TokenBlacklist from "../models/TokenBlacklist.model.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        // Log headers for debugging (can be removed after fixing)
        // console.log('[AUTH] Request headers:', {
        //     authorization: req.headers.authorization,
        //     path: req.path,
        //     method: req.method
        // });

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            // console.log('[AUTH] No token found in request');
            return res.status(401).json({
                message: "Not authorized, token missing",
            });
        }

        // console.log('[AUTH] Token found, verifying...');

        const blacklisted = await TokenBlacklist.findOne({ token });
        if (blacklisted) {
            // console.log('[AUTH] Token is blacklisted');
            return res.status(401).json({ message: "Token revoked" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('[AUTH] Token verified for user:', decoded.userId);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            // console.log('[AUTH] User not found for ID:', decoded.userId);
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        req.user = user;
        // console.log('[AUTH] Authentication successful for:', user.email);

        next();
    } catch (error) {
        console.error("[AUTH] Middleware error:", error.message);

        return res.status(401).json({
            message: "Not authorized, token invalid",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
