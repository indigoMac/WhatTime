/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo. -->
 *
 * This file is the main Node.js server file that defines the express middleware.
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
import createError from "http-errors";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import express from "express";
import https from "https";
import { getHttpsServerOptions } from "office-addin-dev-certs";
import { getUserData } from "./msgraph-helper";
import { validateJwt } from "./ssoauth-helper";

/* global console, process, require, __dirname */

const app = express();
const port: number | string = process.env.API_PORT || "3000";

app.set("port", port);

// Remove view engine setup - we're serving static files, not using templates
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Turn off caching when developing */
if (process.env.NODE_ENV !== "production") {
  app.use(express.static(path.join(process.cwd(), "dist"), { etag: false }));

  app.use(function (req, res, next) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  });
} else {
  // In production mode, let static files be cached.
  app.use(express.static(path.join(process.cwd(), "dist")));
}

// Backend API connection test
async function testBackendConnection() {
  try {
    const response = await fetch("http://localhost:8000/health");
    const data = await response.json();
    console.log("✅ Backend API connection successful:", data.message);
    return true;
  } catch (error: any) {
    console.log("⚠️ Backend API not available:", error.message);
    return false;
  }
}

const indexRouter = express.Router();
indexRouter.get("/", function (req, res) {
  // Send the HTML file directly instead of trying to render it
  res.sendFile(path.join(process.cwd(), "dist", "taskpane.html"));
});

app.use("/", indexRouter);

// Middle-tier API calls
// listen for 'ping' to verify service is running
// Un comment for development debugging, but un needed for production deployment
// app.get("/ping", function (req: any, res: any) {
//   res.send(process.platform);
// });

//app.get("/getuserdata", validateJwt, getUserData);
app.get("/getuserdata", validateJwt, getUserData);

// Get the client side task pane files requested
app.get("/taskpane.html", async (req: any, res: any) => {
  return res.sendfile("taskpane.html");
});

app.get("/fallbackauthdialog.html", async (req: any, res: any) => {
  return res.sendfile("fallbackauthdialog.html");
});

// Catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Since we removed Pug, we need to send error as JSON instead of rendering
  res.status(err.status || 500).json({
    error: err.message,
    status: err.status || 500,
  });
});

getHttpsServerOptions().then(async (options) => {
  // Test backend connection before starting
  await testBackendConnection();

  https
    .createServer(options, app)
    .listen(port, () => console.log(`Server running on ${port} in ${process.env.NODE_ENV} mode`));
});
