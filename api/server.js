import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoutes.js";
import messageRoute from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
// app.use("/api/users", userRoutes);
// app.use("/api/friends", friendRoutes);

app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
