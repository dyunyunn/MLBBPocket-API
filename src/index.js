import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import heroRoutes from "./routes/heroRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "MLBBPocket REST API is running!",
    endpoints: ["/api/heroes", "/api/items"],
  });
});

app.use("/api/heroes", heroRoutes);
app.use("/api/items", itemRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
