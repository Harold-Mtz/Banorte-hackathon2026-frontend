import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "node ../../Backend/Banorte-hackathon-backend/tests/test-app.cjs",
      url: "http://127.0.0.1:3101/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      env: { VITE_API_URL: "http://127.0.0.1:3101" },
      reuseExistingServer: false,
    },
  ],
});
