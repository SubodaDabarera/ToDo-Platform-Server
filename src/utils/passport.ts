import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Log the callback URL to help with debugging
const callbackURL = `${process.env.BACKEND_URL}/api/auth/google/callback`;
console.log('Google OAuth callback URL:', callbackURL);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: callbackURL,
  // Add these options to help with the access blocked issue
  proxy: true,
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth profile:', profile);
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0].value,
        accessToken: accessToken
      });
      await user.save();
    } else {
      // Update the access token if user already exists
      user.accessToken = accessToken;
      await user.save();
    }
    
    done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    done(err as Error);
  }
}));