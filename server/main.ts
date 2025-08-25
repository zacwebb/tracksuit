// deno-lint-ignore-file no-explicit-any
import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import { createTable } from "./tables/insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);

// TODO any future tables go in here, but ideally we'd be using migrations or something more eloquent
console.log("Creating database tables");
db.exec(createTable);

console.log("Initialising server");

const router = new oak.Router();

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.get("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const result = lookupInsight({ db, id: params.id });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights/create", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const result = createInsight({ db, brand: body.brand, text: body.text });
    ctx.response.body = result;
    ctx.response.status = 201;
  } catch (error) {
    console.error("Error creating insight:", error);
    ctx.response.status = 400;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

// TODO check Tracksuit convention on using DELETE instead (a lot of APIs just stick to GET for delete requests)
router.get("/insights/delete/:id", (ctx) => {
  try {
    const params = ctx.params as Record<string, any>;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid ID parameter" };
      return;
    }

    const result = deleteInsight({ db, id });

    if (result) {
      ctx.response.body = {
        success: true,
        message: "Insight deleted successfully",
      };
      ctx.response.status = 200;
    } else {
      ctx.response.body = { error: "Insight not found" };
      ctx.response.status = 404;
    }
  } catch (error) {
    console.error("Error deleting insight:", error);
    ctx.response.status = 400;
    ctx.response.body = {
      error: error instanceof Error
        ? error.message
        : "An unknown error occurred",
    };
  }
});

const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
