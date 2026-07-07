import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import "express-async-errors";
import { config } from "./config";
import { pingDb } from "./db";
import { notFound, errorHandler } from "./middleware/error";
import * as wa from "./providers/whatsapp";
import { ensureSchema } from "./settings";
import { ensureAuthSchema } from "./utils/password";

import auth from "./routes/auth";
import members from "./routes/members";
import events from "./routes/events";
import news from "./routes/news";
import causes from "./routes/causes";
import notifications from "./routes/notifications";
import push from "./routes/push";
import serviceProjects from "./routes/service-projects";
import attendance from "./routes/attendance";
import broadcast from "./routes/broadcast";
import chats from "./routes/chats";
import meetingMinutes from "./routes/meeting-minutes";
import awards from "./routes/awards";
import referrals from "./routes/referrals";
import faqs from "./routes/faqs";
import photos from "./routes/photos";
import admin from "./routes/admin";
import meetings from "./routes/meetings";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.cors.origins.length ? config.cors.origins : true, credentials: false }));
app.use(express.json({ limit: "120mb" }));
if (config.env !== "production") app.use(morgan("dev"));

app.use("/uploads", express.static(path.dirname(config.uploads.dir), { maxAge: "7d", index: false, fallthrough: true }));

app.get("/health", async (_req, res) => {
  try { await pingDb(); res.json({ ok: true, env: config.env }); }
  catch (e: any) { res.status(503).json({ ok: false, error: e.message }); }
});

app.use("/auth", auth);
app.use("/members", members);
app.use("/events", events);
app.use("/news", news);
app.use("/causes", causes);
app.use("/notifications", notifications);
app.use("/push", push);
app.use("/service-projects", serviceProjects);
app.use("/attendance", attendance);
app.use("/broadcast", broadcast);
app.use("/chats", chats);
app.use("/meeting-minutes", meetingMinutes);
app.use("/awards", awards);
app.use("/referrals", referrals);
app.use("/faqs", faqs);
app.use("/photos", photos);
app.use("/admin", admin);
app.use("/meetings", meetings);

app.use(notFound);
app.use(errorHandler);

ensureSchema().catch(() => {});
ensureAuthSchema().catch(() => {});
wa.start().catch((e) => console.error("[wa] init failed", e));

if (require.main === module) {
  app.listen(config.port, () => {
    console.log("[server] listening on :" + config.port + " (" + config.env + ")");
  });
}