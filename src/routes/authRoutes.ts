import express, { Response, Request } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";
// import '../utils/passport'

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as IUser;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// @ts-ignore - Ignoring type error until proper fix is found
router.get("/verify", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-accessToken');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      displayName: user.displayName,
      email: user.email
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//@ts-ignore
router.get("/logout", (req: Request, res: Response) => {
  try {
    // In newer versions of Passport, req.logout() is an asynchronous function
    if (req.logout && typeof req.logout === 'function') {
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ message: "Error during logout" });
        }
        return res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      // If req.logout is not available or not a function, just consider the user logged out
      return res.status(200).json({ message: "Logged out successfully" });
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
});

export default router;
