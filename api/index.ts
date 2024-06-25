import * as dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response, json } from "express";
import cors from "cors";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createLogger, transports } from "winston";
import { getFirestore } from "firebase-admin/firestore";
import { getWallet } from "./base";

var serviceAccount = require("./serviceAccountKey.json");

const logger = createLogger({
  level: "info",
  transports: [new transports.Console()],
});

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

const app = express();

app.use(cors());
app.use(json());

let port = process.env.PORT || 3000;
if (typeof port === "string") {
  port = parseInt(port);
}

const firestore = getFirestore(firebaseApp);

async function addProject(data: {
  title: any;
  from: any;
  description: any;
  image: any;
  nftLink: any;
}) {
  const { title, from, description, image, nftLink } = data;
  return firestore.collection("projects").add({
    title,
    from,
    description,
    image,
    nftLink,
  });
}

async function getUserMint(projectId: any, uid: any) {
  const mint = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (mint.empty) {
    return undefined;
  }

  return mint.docs[0].data();
}

async function getProjectMintCount(projectId: any) {
  const result = await firestore
    .collection("mints")
    .where("projectId", "==", projectId)
    .count()
    .get();

  return result.data();
}

type UserData = {
  primaryEthereumWallet?: string;
};

async function getUserData(uid: string): Promise<UserData> {
  const res = await firestore.doc(`users/${uid}`).get();
  if (!res.exists) {
    return {};
  }
  return res.data() ?? {};
}

async function verifyRequest(req: Request) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return undefined;
    }

    const decodedToken = await getAuth(firebaseApp).verifyIdToken(token);

    return decodedToken;
  } catch (e) {
    logger.error("Error verifying token", e, req.headers.authorization);
    return undefined;
  }
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const mint = await firestore.doc("mints/1").get();
    if (!mint.exists) {
      logger.error("Can't get 'mints/1', stopping api");
      return;
    }
    logger.info("Successfully connected to firestore!", mint);

    app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
      console.error(err.stack);
      res.status(500).send("Something broke!");
    });

    // Unprotected routes

    app.get("/", (_: Request, res: Response) => {
      res.send("Hello World!");
    });

    app.get("/project/:projectId", async (req: Request, res: Response) => {
      const projectId = req.params.projectId;

      if (!projectId) {
        res.status(400).send("projectId is required");
        return;
      }

      const project = await firestore.doc(`projects/${projectId}`).get();

      if (!project.exists) {
        res.status(404).send("Project not found");
        return;
      }

      res.send(project.data());
    });

    app.get("/admin/wallet", async (req: Request, res: Response) => {
      logger.info(getWallet());

      res.send("ok");
    });

    // Protected routes

    app.post("/user/wallet", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }

      const primaryEthereumWallet = req.body.primaryEthereumWallet;

      if (!primaryEthereumWallet) {
        res.status(400).send("primaryEthereumWallet is required");
        return;
      }

      try {
        await firestore.doc(`users/${decodedToken.uid}`).set({
          primaryEthereumWallet,
        });
        const mintsWithWrongWalletAddress = await firestore
          .collection("mints")
          .where("uid", "==", decodedToken.uid)
          .where("aidroppedOn", "==", null)
          .where("walletAddress", "!=", primaryEthereumWallet)
          .get();

        if (mintsWithWrongWalletAddress.size > 0) {
          const mintIds = mintsWithWrongWalletAddress.docs.map((doc) => doc.id);
          logger.info(
            "setting walletAddress for mints to",
            primaryEthereumWallet,
            mintIds
          );
          await Promise.all(
            mintIds.map((id) =>
              firestore.doc(`mints/${id}`).update({
                walletAddress: primaryEthereumWallet,
              })
            )
          );
        }
      } catch (e) {
        logger.error(e);
        res.status(500).send("Error setting wallet");
      }

      res.send("ok");
    });

    app.get("/user", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }
      const user = await getUserData(decodedToken.uid);

      return res.send(user);
    });

    app.get(
      "/project/:projectId/canMint",
      async (req: Request, res: Response) => {
        const decodedToken = await verifyRequest(req);
        if (!decodedToken) {
          res.status(401).send("Unauthorized");
          return;
        }

        const projectId = req.params.projectId;

        if (!projectId) {
          res.status(400).send("projectId is required");
          return;
        }

        const { primaryEthereumWallet } = await getUserData(decodedToken.uid);

        const userMint = await getUserMint(projectId, decodedToken.uid);

        if (!userMint) {
          return res.send({ userAlreadyMinted: false, primaryEthereumWallet });
        }

        res.send({
          userAlreadyMinted: true,
          mintedAt: userMint.timestamp.toDate(),
          primaryEthereumWallet,
        });
      }
    );

    app.post("/mint", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }

      if (await getUserMint(req.body.projectId, decodedToken.uid)) {
        res.status(400).send("User already minted");
        return;
      }

      const projectId = req.body.projectId;

      if (!projectId) {
        res.status(400).send("projectId is required");
        return;
      }

      const project = (
        await firestore.doc(`projects/${projectId}`).get()
      ).data();

      if (!project) {
        res.status(404).send("Project not found");
        return;
      }

      const { primaryEthereumWallet } = await getUserData(decodedToken.uid);

      const addMint: any = {
        projectId: projectId,
        uid: decodedToken.uid,
        from: project?.from,
        title: project?.title,
        description: project?.description,
        image: project?.image,
        nftLink: project?.nftLink,
        timestamp: new Date(),
        walletAddress: primaryEthereumWallet ?? null,
        airdroppedAt: null,
      };

      logger.info(
        `minting project ${projectId} for uid ${
          decodedToken.uid
        } ${JSON.stringify(addMint)}`
      );

      const result = await firestore.collection("mints").add(addMint);

      const newMintId = result.id;

      const mintCount = (await getProjectMintCount(projectId)).count;

      await firestore.doc(`projects/${projectId}`).update({
        mintCount,
      });

      res.status(200).send({ mintId: newMintId, mintCount, mint: addMint });
    });

    app.get("/mints", async (req: Request, res: Response) => {
      const decodedToken = await verifyRequest(req);
      if (!decodedToken) {
        res.status(401).send("Unauthorized");
        return;
      }
      const userMints = await firestore
        .collection("mints")
        .where("uid", "==", decodedToken.uid)
        .get();
      const data = userMints.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          timestamp: docData.timestamp.toDate(),
          airdroppedAt: docData.airdroppedAt?.toDate(),
        };
      });
      res.send(data);
    });

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (e) {
    logger.error("Error", e);
    firestore.terminate();
  }
}
run().catch(console.dir);
