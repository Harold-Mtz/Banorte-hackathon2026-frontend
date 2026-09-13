import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("panorama real, actualizaciones sin recarga, marca y casos límite responsive", async ({
  page,
  request,
}) => {
  const registered = await request.post(
    "http://127.0.0.1:3101/api/auth/register",
    {
      data: {
        name: "Panorama Prueba",
        email: `panorama-${Date.now()}@example.test`,
        password: "TestPassword123!",
      },
    },
  );
  const { data: session } = await registered.json();
  const path = `http://127.0.0.1:3101/api/financial-profiles/${session.user.id}/financial-profile`;
  const result = await request.patch(path, {
    headers: { Authorization: `Bearer ${session.token}` },
    data: {
      monthlyIncome: 30000,
      monthlyExpenses: 20000,
      currentSavings: 80000,
      currentDebt: 25000,
    },
  });
  expect(result.ok()).toBe(true);
  await page.addInitScript(
    (session) =>
      localStorage.setItem("adaptive-session", JSON.stringify(session)),
    session,
  );
  await page.goto("/app");
  await expect(
    page.getByText(
      "Después de tus gastos habituales tienes aproximadamente $10,000 de margen al mes.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Gastas alrededor del 67% de tus ingresos."),
  ).toBeVisible();
  await expect(
    page
      .getByText(
        "Tus ahorros podrían cubrir aproximadamente 4 meses de tus gastos actuales.",
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Tu deuda acumulada equivale aproximadamente a 0.8 meses de tus ingresos.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Tus ahorros superan tu deuda actual por $55,000.").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Banorte", exact: true }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("img", { name: "Banorte", exact: true })
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Prepararme para un hijo" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Mi vida financiera", exact: true })
    .click();
  await page.getByLabel("Gastos mensuales", { exact: true }).fill("32000");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    page.getByText("Tu información está actualizada."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(
    page.getByText("Tus gastos superan tus ingresos por $2,000 al mes."),
  ).toBeVisible();
  await expect(
    page.getByText("Tus gastos representan más del 100% de tu ingreso.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: "artifacts/panorama-deficit-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page
    .getByRole("link", { name: "Mi vida financiera", exact: true })
    .click();
  await page.getByLabel("Ingreso mensual", { exact: true }).fill("0");
  await page.getByLabel("Gastos mensuales", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    page.getByText("Tu información está actualizada."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(
    page.getByText("Empecemos por entender lo que recibes cada mes."),
  ).toBeVisible();
  await expect(page.getByText("Sin estimación", { exact: true })).toBeVisible();
  expect(await page.locator("main").innerText()).not.toMatch(/NaN|Infinity/);
});
