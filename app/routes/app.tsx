import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { Apple, DiamondPlus, History, Home, LineChart, LogOut, MoonStar, Sun } from "lucide-react";
import { useRef } from "react";
import { Theme, useTheme } from "remix-themes";
import Tooltip from "~/components/tooltip";
import { createSupabaseServer } from "~/lib/supabase.server";
import { containerRefContext } from "../lib/context";

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = createSupabaseServer(request);

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || user === null) return redirect("/login", { headers });

	const { data, error: err } = await supabase.storage.from("Avatars").createSignedUrl(`${user.id}`, 60 * 60 * 24, {
		transform: {
			width: 256,
			height: 256,
			quality: 70,
		},
	});

	if (err || data === null) return json({ user, avatar: "/default-avatar.svg" });

	return json({ user, avatar: data.signedUrl });
}

export default function Index() {
	const {
		user: {
			user_metadata: { username },
		},
		avatar,
	} = useLoaderData<typeof loader>();

	const [theme, setTheme] = useTheme();

	const containerRef = useRef<HTMLDivElement | null>(null);

	const logout = useFetcher();

	return (
		<div ref={containerRef} className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
			<header className="border-b border-gray-300 dark:border-gray-900 px-20 py-3 flex justify-between items-center">
				<div role="img" className="flex gap-2 items-center">
					<h2 className="text-2xl dark:text-white text-gray-900 font-bold font-display text-center">NutritionCoach</h2>
					<p className="text-sm font-bold bg-clip-text bg-gradient-to-tr text-left dark:from-fuchsia-500 dark:to-sky-500 from-fuchsia-700 to-sky-700 text-transparent animate-pulse">
						&mdash; Your Nutrition Coach
					</p>
				</div>
				<div className="flex gap-4 items-center">
					<button
						onClick={() => setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))}
						className="focus-default text-gray-700 bg-gray-300/40 hover:bg-gray-300/80 dark:text-gray-200 dark:bg-gray-900/40 dark:hover:bg-gray-900/80 transition-all duration-200 rounded-md group p-[8px]"
					>
						{theme === Theme.DARK ? (
							<>
								<Tooltip bottom>Light Theme</Tooltip>
								<Sun size={20} />
							</>
						) : (
							<>
								<Tooltip bottom>Dark Theme</Tooltip>
								<MoonStar size={20} />
							</>
						)}
					</button>
					<button
						onClick={() => logout.submit({}, { action: "/logout", method: "POST" })}
						className="focus-default text-gray-700 bg-gray-300/40 hover:bg-red-800/10 dark:text-gray-200 group dark:bg-gray-900/40 dark:hover:bg-red-300/20 transition-all duration-200 rounded-md group p-[8px]"
					>
						<Tooltip bottom>Logout</Tooltip>
						<LogOut className="group-hover:text-red-800/50 dark:group-hover:text-red-300/50" size={20} />
					</button>
				</div>
			</header>
			<div className="flex flex-auto">
				<aside className="border-r h-full p-6 border-gray-300 dark:border-gray-900">
					<div className="flex flex-row pr-14 gap-4 h-[60px] items-center">
						<img src={avatar} alt="google" width={60} height={60} className=" bg-gray-300/30 dark:bg-gray-900/30 rounded-lg p-3 aspect-square w-auto h-full" />
						<h2 className="text-gray-950 dark:text-gray-50 font-display font-semibold text-xl">
							Welcome back,
							<br />
							<span className="text-gray-600 dark:text-gray-300 text-base font-medium">{username}</span>
						</h2>
					</div>
					<div className="w-full h-[1px] my-4 bg-gray-200 dark:bg-gray-900"></div>
					<ol className="flex flex-col gap-2">
						<li className="">
							<Link
								to="/app"
								className="flex items-center gap-4 text-gray-950 dark:text-gray-100 hover:bg-gray-300/30 transition-all duration-150 dark:hover:bg-gray-900/50 rounded-md px-4 py-3"
							>
								<Home size={24} className="dark:text-gray-500 text-gray-600" />
								Home
							</Link>
						</li>
						<li className="">
							<Link
								to="/app/add-meal"
								className="flex items-center gap-4 text-white hover:bg-gray-900/50 bg-gradient-to-tr dark:from-blue-500/30 dark:to-green-400/40 from-blue-600/70 to-green-600/70 rounded-md px-4 py-3"
							>
								<DiamondPlus size={24} className="text-white" />
								Add meal
							</Link>
						</li>
						<li className="">
							<Link
								to="/app/meals"
								className="flex items-center gap-4 text-gray-950 dark:text-gray-100 hover:bg-gray-300/30 transition-all duration-150 dark:hover:bg-gray-900/50 rounded-md px-4 py-3"
							>
								<Apple size={24} className="dark:text-gray-500 text-gray-600" />
								Meals
							</Link>
						</li>
						<li className="">
							<Link
								to="/app/progress"
								className="flex items-center gap-4 text-gray-950 dark:text-gray-100 hover:bg-gray-300/30 transition-all duration-150 dark:hover:bg-gray-900/50 rounded-md px-4 py-3"
							>
								<LineChart size={24} className="dark:text-gray-500 text-gray-600" />
								Progress
							</Link>
						</li>
						<li className="">
							<Link
								to="/app/history"
								className="flex items-center gap-4 text-gray-950 dark:text-gray-100 hover:bg-gray-300/30 transition-all duration-150 dark:hover:bg-gray-900/50 rounded-md px-4 py-3"
							>
								<History size={24} className="dark:text-gray-500 text-gray-600" />
								History
							</Link>
						</li>
					</ol>
				</aside>
				<main className="flex-auto bg-gray-200/30 dark:bg-gray-900/20 p-5 flex gap-4">
					<containerRefContext.Provider value={containerRef}>
						<Outlet />
					</containerRefContext.Provider>
				</main>
			</div>
		</div>
	);
}
