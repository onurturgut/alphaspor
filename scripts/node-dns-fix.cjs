const dns = require("node:dns");

// Node.js 24.13+ can incorrectly select localhost as the c-ares DNS server on
// Windows. Atlas SRV lookups then fail before MongoDB can connect. Apply the
// workaround before Next.js and the MongoDB driver are loaded, and only when
// the resolver is in that known-broken state.
if (process.platform === "win32") {
  const servers = dns.getServers();
  if (
    servers.length > 0 &&
    servers.every((server) => server === "127.0.0.1" || server === "::1")
  ) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}
