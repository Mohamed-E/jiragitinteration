import express from "express";
import helmet from "helmet";
import { statusRouter } from "./routes";


const app = express();
app.use(helmet());
app.use("/status", statusRouter);
const PORT = 3000;
app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
module.exports = app;
