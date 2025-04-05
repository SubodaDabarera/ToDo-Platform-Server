import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./services/db";
import passport from 'passport';
import session from 'express-session';
import authRouter from './routes/authRoutes'
import todoRouter from './routes/todoRoutes'
import './utils/passport'

dotenv.config();

// Create Express server
const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware
// app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
// app.use(morgan("dev")); // Request logging

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/todos', todoRouter);

// Start server
app.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
});

export default app;
