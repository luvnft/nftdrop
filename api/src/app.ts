import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import mintRoutes from "./routes/mintRoutes";
import logger from "./utils/logger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/mint", mintRoutes);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _: express.NextFunction
  ) => {
    logger.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

export default app;
