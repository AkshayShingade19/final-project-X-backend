import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import databaseConnection from "./config/database.js";

dotenv.config({ path: ".env" });

const port = process.env.PORT || 4000;

// Connect to DB
databaseConnection();

const app = express();

// ✅ Define allowed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://capable-babka-252536.netlify.app',
  'https://685fb667aafe740008ec0ad0--capable-babka-252536.netlify.app' // Netlify preview URL
];

// ✅ CORS middleware with dynamic origin check
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);

// Start server
app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
