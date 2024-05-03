import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "~/supabase";

export function createSupabase(env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }) {
	return createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
		cookieOptions: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		},
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
			flowType: "pkce",
			debug: process.env.NODE_ENV === "development",
		},
	});
}
