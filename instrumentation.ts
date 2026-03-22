/**
 * instrumentation.ts
 *
 * Next.js server startup hook (runs once when the Node.js server initialises).
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Seeds the admin user from environment variables into MongoDB so that
 * the admin credentials are persisted in the database on first boot.
 */
export async function register() {
  // Only run in the Node.js runtime (not in Edge or during build).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { seedAdmin } = await import("@/lib/seedAdmin");
      await seedAdmin();
    } catch (err) {
      // Log but don't crash the server – auth still works via env-var fallback.
      console.error("[Admin] Failed to seed admin user:", err);
    }
  }
}
