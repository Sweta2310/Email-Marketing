import express from "express";
import passport from "passport";
import { protect } from "../middleware/auth.middleware.js";
// import { sendVerificationEmail } from "../utils/sendEmail.js";
import {
    signup,
    login,
    logout,
    googleOAuthCallback,
    // appleOAuthCallback,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", protect, (req, res) => {
    res.status(200).json({
        user: req.user,
    });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Password Reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// router.post("/send-verification-email", sendVerificationEmail);


// Google OAuth routes
router.get("/google",
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);
router.get("/google/callback",
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:5173/signup?error=oauth_failed'
    }),
    googleOAuthCallback
);

// Apple OAuth routes
// router.post("/apple",
//     passport.authenticate('apple', {
//         session: false
//     })
// );
// router.post("/apple/callback",
//     passport.authenticate('apple', {
//         session: false,
//         failureRedirect: 'http://localhost:5173/signup?error=oauth_failed'
//     }),
//     appleOAuthCallback
// );

export default router;
