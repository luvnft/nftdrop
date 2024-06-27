import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import mintRoutes from "./routes/mintRoutes";
import logger from "./utils/logger";
import { getWalletBalance } from "./blockchain/base";

const app = express();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/user", userRoutes);
app.use("/project", projectRoutes);
app.use("/mint", mintRoutes);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/admin", async (req, res) => {
  if (req.headers.authorization !== "Bearer " + process.env.ADMIN_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  const addresses: any[] = req.body;

  const balances = await Promise.all(
    addresses.map(async (address) => {
      const balance = await getWalletBalance(address);
      return balance;
    })
  );

  res.send(balances);
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
