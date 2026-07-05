import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Creates a Supabase admin client using the service_role key.
 * This bypasses RLS — only use in server-side code (API routes, server actions,
 * background jobs).
 *
 * NEVER expose the service_role key to the browser.
 * NEVER use this in client components or route handlers called from the client.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
