import express, { Express } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create Express server
const app: Express = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors()); // Enable CORS for all routes
app.use(morgan("dev")); // Request logging

// Start server
app.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
});

export default app;
