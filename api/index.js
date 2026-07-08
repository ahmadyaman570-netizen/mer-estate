import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import { rateLimit, securityHeaders } from "./middleware/security.js";
dotenv.config();

if (!process.env.MONGO || !process.env.JWT_SECRET) {
  throw new Error("MONGO and JWT_SECRET environment variables are required");
}

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
const app = express();
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(express.json({ limit: "10kb" }));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/auth", rateLimit({ max: 20, keyPrefix: "auth" }));
app.use("/api/users", rateLimit({ max: 60, keyPrefix: "users" }));
app.use("/api/listings", rateLimit({ max: 80, keyPrefix: "listings" }));
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    message = "Username or email already exists";
  }
  
  if (err.name === "ValidationError") {
    message = "Invalid user data";
  }

  return res.status(statusCode).json({ success: false, statusCode, message });
});
