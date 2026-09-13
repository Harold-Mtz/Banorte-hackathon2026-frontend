import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("registro, onboarding, agente, simulaciones, ahorro, recarga y responsive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "warning") errors.push(message.text());
  });
  await page.goto("/app");
  await expect(page).toHaveURL(/login/);
  await page.screenshot({
    path: "artifacts/login-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Crea tu cuenta" }).click();
  await page.getByLabel("Nombre completo").fill("Ana Prueba");
  await page
    .getByLabel("Correo electrónico")
    .fill(`ana-${Date.now()}@example.test`);
  await page.getByLabel("Contraseña", { exact: true }).fill("TestPassword123!");
  await page.getByLabel("Confirma tu contraseña").fill("TestPassword123!");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page).toHaveURL(/onboarding$/);
  await page.getByLabel("Ingreso mensual", { exact: true }).fill("60000");
  await page.getByLabel("Gastos mensuales", { exact: true }).fill("16000");
  await page.getByLabel("Ahorros actuales").fill("300000");
  await page.getByLabel("Deuda actual", { exact: true }).fill("2000");
  await page.getByLabel("Score de crédito (opcional)").fill("720");
  await page.getByRole("button", { name: "Guardar y continuar" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByText(
      "Después de tus gastos habituales tienes aproximadamente $44,000 de margen al mes.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mi primera casa", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Haz espacio para tu primera casa" }),
  ).toBeVisible();
  await page.getByLabel("Presupuesto del objetivo (MXN)").fill("120000");
  await page.getByLabel("Ahorro que dedicarás (MXN)").fill("20000");
  await page.getByLabel("Plazo del plan (meses)").fill("10");
  await page.getByLabel("Aportación prevista al mes (MXN)").fill("8000");
  await page
    .getByRole("button", { name: "Generar mi plan", exact: true })
    .click();
  await expect(
    page.getByText("Necesita ajustes", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Aportación prevista al mes (MXN)").fill("10000");
  await page
    .getByRole("button", { name: "Recalcular mi plan", exact: true })
    .click();
  await expect(
    page.getByText("Alcanzable con estos datos", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Alcanzable con estos datos", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Aportación prevista al mes (MXN)")).toHaveValue(
    "10000",
  );
  const desktop = page.viewportSize()!;
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole("heading",{name:"Tu ruta para lograrlo"})).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path:"artifacts/plan-mobile.png",fullPage:true});
  await page.setViewportSize(desktop);
  await page
    .getByLabel("Producto hipotecario", { exact: true })
    .selectOption({ label: "Hipoteca de prueba" });
  await page.getByLabel("Valor de la propiedad · MXN").fill("1800000");
  await page.getByLabel("Enganche · MXN", { exact: true }).fill("300000");
  await page.getByLabel("Plazo en meses").fill("240");
  await page.getByRole("button", { name: "Actualizar simulación" }).click();
  await expect(page.getByText("Tu pago mensual estimado")).toBeVisible();
  const first = await page.locator(".simulation-result>strong").innerText();
  await page.getByLabel("Enganche · MXN", { exact: true }).fill("500000");
  await page.getByRole("button", { name: "Actualizar simulación" }).click();
  await expect(page.locator(".simulation-result>strong")).not.toHaveText(first);
  await expect(page.getByText("Diferencia por reunir")).toBeVisible();
  await expect(
    page.getByLabel("Monto objetivo · MXN", { exact: true }),
  ).toHaveValue("500000");
  await page.getByLabel("Nombre de tu meta").fill("El enganche de mi casa");
  await page.getByLabel("Monto objetivo · MXN", { exact: true }).fill("500000");
  await page.getByLabel("¿Cuánto llevas ahorrado? · MXN").fill("300000");
  await page.getByLabel("Aportación mensual · MXN (opcional)").fill("10000");
  await page.getByLabel("Fecha objetivo (opcional)").fill("2028-01-01");
  await page.getByRole("button", { name: "Revisar meta" }).click();
  await expect(
    page.getByText("Revisa tu meta antes de guardarla."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar y crear meta" }).click();
  await expect(
    page.getByText("Tu meta de ahorro se guardó correctamente."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Tu meta de ahorro se guardó correctamente."),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/experience-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Metas de ahorro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "El enganche de mi casa" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Actualizar mi ahorro" }).click();
  await page.getByLabel("Ahorro acumulado · MXN").fill("350000");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("70%", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Simulaciones", exact: true }).click();
  const boxes = page.getByRole("checkbox", { name: "Comparar" });
  await expect(boxes).toHaveCount(2);
  await boxes.nth(0).check();
  await boxes.nth(1).check();
  await expect(
    page.getByRole("heading", { name: "Compara tus escenarios" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(
    page.getByText("$60,000", { exact: true }).first(),
  ).toBeVisible();
  await page.waitForTimeout(400);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  for (const width of [1366, 1440, 1920, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(250);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: `artifacts/dashboard-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Experiencias", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tu primera casa" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/login/);
  await page.screenshot({ path: "artifacts/login-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("errores de credenciales, servidor caído y validación accesible", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill("missing@example.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(
    page.getByText("El correo o la contraseña son incorrectos."),
  ).toBeVisible();
  await page.route("**/api/auth/login", (route) => route.abort());
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(
    page.getByText(
      "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
    ),
  ).toBeVisible();
});

test("componentes desconocidos, datos incompletos y texto del agente son seguros", async ({
  page,
  request,
}) => {
  const registered = await request.post(
    "http://127.0.0.1:3101/api/auth/register",
    {
      data: {
        name: "Prueba de contrato",
        email: `contract-${Date.now()}@example.test`,
        password: "TestPassword123!",
      },
    },
  );
  const { data: session } = await registered.json();
  const message = await request.post(
    "http://127.0.0.1:3101/api/agent/message",
    {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        userId: session.user.id,
        message: "Quiero comprar mi primera casa",
      },
    },
  );
  const { data: agent } = await message.json();
  await page.addInitScript(
    ({ session, sessionId }) => {
      localStorage.setItem("adaptive-session", JSON.stringify(session));
      localStorage.setItem(`adaptive-agent-${session.user.id}`, sessionId);
    },
    { session, sessionId: agent.sessionId },
  );
  await page.route("**/ui-states/latest", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          schema: {
            version: "1.0",
            screen: { title: "Prueba de seguridad" },
            components: [
              {
                id: "unknown",
                type: "__proto__",
                props: { html: "<script>window.injected=true</script>" },
              },
              { id: "bad", type: "mortgage-simulator", props: {} },
              {
                id: "text",
                type: "confirmation",
                props: { message: "<script>window.injected=true</script>" },
              },
            ],
          },
        },
      },
    }),
  );
  await page.goto("/app/experience");
  await expect(
    page.getByRole("heading", { name: "Prueba de seguridad" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Esta sección no está disponible. Recupera la experiencia para actualizarla.",
    ),
  ).toHaveCount(2);
  await expect(
    page.getByText("<script>window.injected=true</script>", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.hasOwn(window, "injected"))).toBe(
    false,
  );
});
