import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServer } from "~/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
	const { headers, supabase } = createSupabaseServer(request);

	await supabase.auth.signOut();

	return redirect("/login", { headers });
}

export default function Index() {
	return <h1>Logging out</h1>;
}
