import * as dotenv from "dotenv";
dotenv.config();
import app from "./app";
import logger from "./utils/logger";
import { firestore } from "./config/firebase";

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test the Firestore connection
    const mint = await firestore.doc("mints/1").get();
    if (!mint.exists) {
      logger.error("Can't get 'mints/1', stopping api");
      process.exit(1);
    }
    logger.info("Successfully connected to firestore!");

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
