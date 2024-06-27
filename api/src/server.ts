import * as dotenv from "dotenv";
dotenv.config();
import app from "./app";
import logger from "./utils/logger";
import { firestore } from "./config/firebase";

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (e) {
    logger.error("Error starting server", e);
    firestore.terminate();
    process.exit(1);
  }
}

startServer().catch(console.dir);
