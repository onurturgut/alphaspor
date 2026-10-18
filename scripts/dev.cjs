const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
const dnsFix = path.join(__dirname, "node-dns-fix.cjs");
const currentNodeOptions = process.env.NODE_OPTIONS?.trim();
const dnsRequireOption = `--require=${JSON.stringify(dnsFix)}`;

const child = spawn(
  process.execPath,
  [nextCli, "dev", "--hostname", "127.0.0.1", "--webpack"],
  {
    cwd: root,
    env: {
      ...process.env,
      NODE_OPTIONS: currentNodeOptions
        ? `${currentNodeOptions} ${dnsRequireOption}`
        : dnsRequireOption,
    },
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exitCode = code ?? 1;
});
