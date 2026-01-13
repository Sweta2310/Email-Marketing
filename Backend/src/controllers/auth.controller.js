import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import TokenBlacklist from "../models/TokenBlacklist.model.js";

const JWT_EXPIRES_IN = "7d";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (req, res) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.exp) {
            return res.status(401).json({ message: "Invalid token" });
        }

        await TokenBlacklist.create({
            token,
            expiresAt: new Date(decoded.exp * 1000),
        });

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// OAuth callback handlers
// Google OAuth callback - called by Passport after successful authentication
export const googleOAuthCallback = async (req, res) => {
    try {
        // User is attached to req.user by Passport
        const user = req.user;

        if (!user) {
            return res.redirect('http://localhost:5173/signup?error=oauth_failed');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Redirect to frontend with token
        res.redirect(`http://localhost:5173/?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture
        }))}`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect('http://localhost:5173/signup?error=oauth_failed');
    }
};

// Apple OAuth callback - called by Passport after successful authentication
// export const appleOAuthCallback = async (req, res) => {
//     try {
//         // User is attached to req.user by Passport
//         const user = req.user;

//         if (!user) {
//             return res.redirect('http://localhost:5173/signup?error=oauth_failed');
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: JWT_EXPIRES_IN }
//         );

//         // Redirect to frontend with token
//         res.redirect(`http://localhost:5173/?token=${token}&user=${encodeURIComponent(JSON.stringify({
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             profilePicture: user.profilePicture
//         }))}`);
//     } catch (error) {
//         console.error('Apple OAuth callback error:', error);
//         res.redirect('http://localhost:5173/signup?error=oauth_failed');
//     }
// };

// Forgot Password - Generate reset token and send email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token using crypto
        const crypto = await import('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiration (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

        // console.log('Password Reset URL:', resetUrl);
        // console.log('Reset Token:', resetToken);
        res.status(200).json({
            message: 'Password reset link has been sent to your email',
            resetUrl: resetUrl
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const crypto = await import('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
