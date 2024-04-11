import express, { Express, Request } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { rootSchema } from "./base";
import playground from "graphql-playground-middleware-express";
import { APIToolkit } from "apitoolkit-express";
import limiter from "./middleware/limiter";
import { connect, disconnect } from "./utils/cache";
dotenv.config();
const port = process.env.PORT || 8000;
const app: Express = express();
const apitoolkitClient = APIToolkit.NewClient({
  apiKey: String(process.env.API_TOOLKIT),
});

app.use(cors());
app.use(limiter());
app.use(apitoolkitClient.expressMiddleware);
connect();
app.all(
  "/graphql",
  createHandler({
    schema: rootSchema,
    context: (req) => ({
      headers: req.headers,
    }),
  })
);

app.get("/playground", playground({ endpoint: "/graphql" }));

if (!module.parent) {
  const server = app.listen(port, () => {
    console.log(`now listening on port ${port}`);
  });

  process.on("SIGTERM", () => {
    server.close(() => {
      console.log("Server closed");
      disconnect();
      process.exit(0);
    });
  });
}

export default app;
