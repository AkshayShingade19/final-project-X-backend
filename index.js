import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // <-- add this
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import databaseConnection from "./config/database.js";

dotenv.config({ path: ".env" });

const port = process.env.PORT || 4000;

// Connect to DB
databaseConnection();

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-domain.vercel.app',
  'https://685fb667aafe740008ec0ad0--capable-babka-252536.netlify.app'  // ✅ ADD THIS
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Allow cross-origin requests
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://your-frontend-domain.vercel.app' // add your production domain if deployed
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));

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
