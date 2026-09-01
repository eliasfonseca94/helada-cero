import { defineConfig } from "vitest/config";

/**
 * Sin este archivo, `vite`/`vite build` igual funcionan con los valores por
 * defecto — se agrega únicamente para declarar la configuración de Vitest
 * (`test`), que no tiene dónde vivir sin un `vite.config.ts`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
