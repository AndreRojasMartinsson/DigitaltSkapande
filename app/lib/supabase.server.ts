import { createServerClient, parse, serialize } from "@supabase/ssr";
import type { Database } from "~/supabase";

export function createSupabaseServer(request: Request, serviceRole = false) {
	const cookies = parse(request.headers.get("Cookie") ?? "");
	const headers = new Headers();

	const supabase = createServerClient<Database>(process.env.SUPABASE_URL!, serviceRole ? process.env.SUPABASE_SERVICE_ROLE! : process.env.SUPABASE_ANON_KEY!, {
		cookies: {
			get(key) {
				return cookies[key];
			},
			set(key, value, options) {
				headers.append("Set-Cookie", serialize(key, value, options));
			},
			remove(key, options) {
				headers.append("Set-Cookie", serialize(key, "", options));
			},
		},
	});

	return { supabase, cookies, headers };
}
