import { execFileSync } from "node:child_process";
import { join } from "node:path";

// Browser regression checks; never submits forms or modifies server data.
const browser =
  process.env.AGENT_BROWSER_BIN ||
  (process.platform === "win32"
    ? join(
        process.env.APPDATA,
        "npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe",
      )
    : "agent-browser");
const base = process.env.THEME_TEST_URL || "http://127.0.0.1:3000";
const session = process.env.THEME_TEST_SESSION || "theme-verification";
function run(...args) {
  return execFileSync(browser, ["--session", session, ...args], {
    stdio: "inherit",
    timeout: 60000,
  });
}
function check(code) {
  run("eval", code);
}

try {
  run("open", base);
  run("set", "viewport", "1440", "900");
  check("localStorage.removeItem('alfa-theme')");
  run("reload");
  check(
    "if(document.documentElement.dataset.theme!==(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))throw Error('System preference not applied')",
  );

  for (const theme of ["light", "dark"]) {
    check(
      `if(document.documentElement.dataset.theme === '${theme}')document.querySelector('.theme-toggle').click();document.querySelector('.theme-toggle').click()`,
    );
    for (const route of [
      "/",
      "/kulubumuz",
      "/takimlar",
      "/takimlar/u13",
      "/haberler",
      "/maclar",
      "/iletisim",
      "/admin/giris",
    ]) {
      run("open", base + route);
      check(
        `if(document.documentElement.dataset.theme !== '${theme}' || localStorage.getItem('alfa-theme') !== '${theme}')throw Error('Theme not persisted'); if(document.documentElement.scrollWidth>innerWidth)throw Error('Horizontal overflow'); if(!document.querySelector('.theme-toggle'))throw Error('Toggle missing'); if(!document.querySelector('main, .admin-root'))throw Error('Page failed'); if((getComputedStyle(document.body).backgroundImage.match(/radial-gradient/g)||[]).length!==${theme === "light" ? 10 : 4})throw Error('Gradient layers differ'); if(getComputedStyle(document.documentElement).colorScheme!=='${theme}')throw Error('Native controls use wrong theme')`,
      );
      console.log(`${theme}: ${route} passed`);
    }
  }

  run("set", "viewport", "390", "844");
  run("open", base);
  run("click", ".menu-toggle");
  for (let i = 0; i < 2; i++) {
    run("click", ".theme-toggle");
    check(
      "if(!document.querySelector('#mobile-menu'))throw Error('Switch closed menu');if(document.documentElement.scrollWidth>innerWidth)throw Error('Mobile overflow')",
    );
  }
  run("press", "Escape");
  check(
    "if(document.querySelector('#mobile-menu'))throw Error('Escape failed');if(!document.activeElement.matches('.menu-toggle'))throw Error('Focus not restored')",
  );
  run("open", base + "/iletisim");
  check(
    "if(!document.querySelector('form'))throw Error('Contact form missing');if(document.documentElement.scrollWidth>innerWidth)throw Error('Mobile contact overflow')",
  );
  console.log(
    "Mobile menu, theme switching, focus restoration and contact form passed.",
  );
} finally {
  run("close");
}
