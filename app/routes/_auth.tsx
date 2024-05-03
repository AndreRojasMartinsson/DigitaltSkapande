import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, redirect } from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import { createSupabaseServer } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = createSupabaseServer(request);

	const { data } = await supabase.auth.getUser();

	if (data.user !== null) return redirect("/app", { headers });

	return json(null);
}

export default function Index() {
	return (
		<div className="grid grid-cols-2 h-screen bg-white">
			<Toaster />
			<div className="bg-gray-950 topography-pattern p-16">
				<h1 className="text-6xl text-white font-bold font-display text-center">NutritionCoach</h1>
				<h2 className="text-3xl font-bold bg-clip-text bg-gradient-to-tr text-center from-fuchsia-500 to-sky-500 text-transparent animate-pulse">
					Your Nutrition Coach
				</h2>
				<div className="relative select-none">
					<div className="absolute w-[705px] select-none h-[450px] top-24 rounded-full left-1/2 origin-left bg-gradient-to-tr animate-[breathe_1.5s_ease-in-out_infinite] from-sky-600/50 to-fuchsia-600/50 blur-3xl"></div>
					<img
						src="/DashboardLatest3.png"
						width="705"
						alt="Dashboard"
						className="absolute left-1/2 select-none origin-left top-24 animate-[breathe2_3s_ease-in-out_infinite] duration-100"
					/>
				</div>
			</div>
			<div className="bg-gray-950/[97%] px-20 py-10 shadow-2xl shadow-blue-600/60 border-l border-gray-800/80">
				<Outlet />
			</div>
		</div>
	);
}
