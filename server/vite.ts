import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
// Remove the vite config import and use a simpler setup
import { nanoid } from "nanoid";

// Minimal logger stub
const viteLogger = {
  hasErrorLogged: () => false,
  hasWarned: false,
  info: (msg: unknown) => console.log(msg),
  warn: (msg: unknown) => console.warn(msg),
  warnOnce: (msg: unknown) => console.warn(msg),
  error: (msg: unknown) => console.error(msg),
  clearScreen: undefined as unknown,
  clearScreenBuffer: undefined as unknown,
  get isTTY() { return (process.stdout as any).isTTY ?? false },
  level: 'info'
} as any;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const viteConfig = {
    configFile: false,
    root: path.resolve(import.meta.dirname, "..", "client"),
    customLogger: {
      ...viteLogger,
      error: (msg: any, _options?: any) => {
        viteLogger.error(String(msg));
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  };

  const viteModule: any = await import("vite");
  const vite = await viteModule.createServer(viteConfig as any);

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Support running from TS (server/) or compiled JS (server/dist)
  const candidatePaths = [
    path.resolve(import.meta.dirname, "..", "client", "dist"),
    path.resolve(import.meta.dirname, "..", "..", "client", "dist"),
  ];

  const distPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find the client build in any of: ${candidatePaths.join(", ")}. Run \`npm run build\` in the project root first.`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
