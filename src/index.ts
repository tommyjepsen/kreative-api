import "dotenv/config";

//Start a Rest API on Express
import express from "express";
import cors from "cors";

import userRoutes from "./routes/user";
import helmet from "helmet";
import workflowRoutes from "./routes/workflows";

const app = express();
const port = process.env.PORT || 3008;

//Cors
app.use(cors());

//Allow JSON Post
app.use(express.json());
app.use(helmet());

//Allow URL encoded bodies
app.use(express.urlencoded({ extended: true }));

//Allow all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/user", userRoutes);
app.use("/workflows", workflowRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port} 🚀 `);
});
