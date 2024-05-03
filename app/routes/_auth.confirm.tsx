import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServer } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const requestUrl = new URL(request.url);
	const token = requestUrl.searchParams.get("token");
	const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
	const next = requestUrl.searchParams.get("next") || "/";

	const { supabase, headers } = createSupabaseServer(request);
	if (token && type) {
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash: token,
		});

		if (!error) return redirect(next, { headers });
	}

	return redirect("/confirm", { headers });
}

export default function Index() {
	return <p>Hi</p>;
}
