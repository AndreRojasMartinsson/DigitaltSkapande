import { Form, json, redirect } from "@remix-run/react";
import { Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServer } from "~/lib/supabase.server";
import Tooltip from "~/components/tooltip";

export async function loader() {
	return {
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL!,
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
		},
	};
}

const loginSchema = z.object({
	email: z.string().min(1, { message: "Email is required" }).email(),
	password: z
		.string()
		.min(1, { message: "Password is required" })
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(150, { message: "Password must be no more than 150 characters long" }),
});

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const { email, password } = await loginSchema.parseAsync(Object.fromEntries(formData.entries()));

	const { supabase, headers } = createSupabaseServer(request);

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) return json({ error }, { headers, status: 401 });
	if (data.session) return redirect("/app", { headers });

	return redirect("/login", { headers });
};

export default function Index() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [allFilled, setAllFilled] = useState<boolean>(false);

	useEffect(() => {
		setAllFilled(email.length > 0 && password.length > 0);
	}, [email, password, setAllFilled]);

	return (
		<div className="my-5">
			<h3 className="text-4xl text-white font-display font-bold">Log in to NutritionCoach</h3>
			<span className="text-red-500/50 font-semibold font-display text-sm">* Required</span>
			<Form method="POST" className="py-8 my-8 w-min rounded-md gap-5 flex flex-col">
				<div className="flex flex-col gap-2">
					<label htmlFor="email" className="text-sm font-semibold font-display text-gray-400/80">
						Your Email <span className="text-red-500/50 font-semibold font-display text-sm">*</span>
					</label>
					<div className="border-gray-800 border flex gap-3 pl-3 pr-5 w-[380px] py-[10px] bg-gray-950/30 hover:border-gray-700/80 has-[:focus]:border-gray-400 transition-all duration-200 rounded-md focus-default outline-none">
						<Mail color="rgb(156, 163, 175)" absoluteStrokeWidth strokeWidth={1} tabIndex={-1} />
						<input
							onChange={e => setEmail(e.target.value)}
							id="email"
							type="email"
							name="email"
							placeholder="example@example.com"
							className="placeholder:text-gray-400 border-none peer bg-transparent w-full text-white outline-none"
							required
							minLength={5}
							maxLength={100}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2 ">
					<label htmlFor="password" className="text-sm font-semibold font-display text-gray-400/80">
						Your Password <span className="text-red-500/50 font-semibold font-display text-sm">*</span>
					</label>
					<div className="border-gray-800 border flex gap-3 pl-3 pr-5 w-[380px] py-[10px] bg-gray-950/30 hover:border-gray-700/80 has-[:focus]:border-gray-400 transition-all duration-200 focus-default rounded-md outline-none">
						<Lock color="rgb(156, 163, 175)" absoluteStrokeWidth strokeWidth={1} tabIndex={-1} />
						<input
							onChange={e => setPassword(e.target.value)}
							id="password"
							type="password"
							name="password"
							placeholder="password"
							className="placeholder:text-gray-400 border-none peer bg-transparent w-full text-white outline-none"
							required
							minLength={8}
							maxLength={150}
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={!allFilled}
					className={`font-bold col-span-3 focus-default mt-8	text-sm ${
						allFilled
							? "bg-white text-gray-950 cursor-pointer border-gray-50 hover:border-gray-200 transition-all duration-200 hover:bg-gray-200"
							: "bg-gray-600/60 border-gray-400/60 cursor-not-allowed text-gray-300/80"
					}  border px-8 py-[10px] rounded-md text-center group`}
				>
					Login
					{!allFilled && <Tooltip>All fields need to be filled in</Tooltip>}
				</button>
				<div className="flex gap-2">
					<a
						href="/signup"
						className="font-bold text-xs focus-default text-center border flex-auto px-8 py-[10px] rounded-md bg-transparent text-gray-50 cursor-pointer border-gray-800  transition-all duration-200 hover:bg-gray-800"
					>
						Don&apos;t have an account?
					</a>
					<a
						href="/"
						className="font-bold text-xs text-center focus-default border px-8 py-[10px] rounded-md bg-transparent text-gray-50 cursor-pointer border-transparent transition-all duration-200 hover:bg-gray-900/60"
					>
						Forgot password?
					</a>
				</div>
				<div className="border-t border-gray-800 my-2 py-5 flex justify-center gap-5">
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Login with X</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_x.svg" alt="X" />
					</button>

					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Login with Google</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_google.svg" alt="X" />
					</button>
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Login with Discord</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_discord.svg" alt="X" />
					</button>
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Login with Github</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_github.svg" alt="X" />
					</button>
				</div>
			</Form>
		</div>
	);
}
