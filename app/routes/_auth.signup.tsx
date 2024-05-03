import { Form, useActionData } from "@remix-run/react";
import { Image, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import toast from "react-hot-toast";
import { createSupabaseServer } from "~/lib/supabase.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supabase";
import Tooltip from "~/components/tooltip";

export async function loader() {
	return {
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL!,
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
		},
	};
}

const signupSchema = z.object({
	email: z.string().min(1, { message: "Email is required" }).email(),
	username: z
		.string()
		.min(1, { message: "Username is required" })
		.min(4, { message: "Username must be at least 4 characters" })
		.max(20, { message: "Username must be no more than 20 characters long" }),
	password: z
		.string()
		.min(1, { message: "Password is required" })
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(150, { message: "Password must be no more than 150 characters long" }),
});

async function doesUserExist(supabase: SupabaseClient<Database>, email: string, username: string) {
	const { data, error } = await supabase
		.from("users")
		.select("email, raw_user_meta_data->username")
		.or(`email.eq."${email}",raw_user_meta_data->>username.eq."${username}"`);

	if (error) throw error;

	if (data !== null && data.length > 0) {
		// if (data[0].email === email) return json({ notification: [false, `Email is already in use`] });
		if (data[0].email === email) return "email";

		// return json({ notification: [false, `Username is already in use`] });

		return "username";
	}

	return false;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const { email, password, username } = await signupSchema.parseAsync(Object.fromEntries(formData.entries()));
	const avatar = formData.get("avatar") as Blob;

	if (email === undefined || username === undefined || password === undefined || avatar === null) {
		return json({ notification: [false, "All fields need to be filled."] });
	}

	const { supabase, headers } = createSupabaseServer(request, true);

	const userExists = await doesUserExist(supabase, email, username);

	if (userExists === "email") return json({ notification: [false, `Email is already in use`] }, { headers });
	if (userExists === "username") return json({ notification: [false, `Username is already in use`] }, { headers });

	const {
		error,
		data: { user },
	} = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username,
			},
		},
	});

	if (user === null) return json({ notification: [false, "Something went wrong."] }, { headers });

	await supabase.storage.from("Avatars").upload(`${user.id}`, avatar, { contentType: avatar.type, upsert: true });

	if (error) return json({ notification: [false, `[${error.code}] ${error.message}`] }, { headers });

	return json({ notification: [true, "Check your email for a verification link"] }, { headers });
}

export default function Index() {
	const [email, setEmail] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [allFilled, setAllFilled] = useState<boolean>(false);

	const actionData = useActionData<typeof action>();

	useEffect(() => {
		console.log(actionData);

		if (actionData && actionData.notification) {
			const [success, message] = actionData.notification;
			if (success) toast.success(`${message}`, { duration: 15_000 });
			if (!success) toast.error(`${message}`, { duration: 15_000 });
		}
	}, [actionData]);

	useEffect(() => {
		setAllFilled(email.length > 0 && password.length > 0 && username.length > 0);
	}, [email, password, username, setAllFilled]);

	return (
		<div className="my-5">
			<h3 className="text-4xl text-white font-display font-bold">Create an account at NutritionCoach</h3>
			<span className="text-red-500/50 font-semibold font-display text-sm">* Required</span>
			<Form method="POST" className="py-8 my-8 w-min rounded-md gap-5 flex flex-col" encType="multipart/form-data">
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
							maxLength={150}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="email" className="text-sm font-semibold font-display text-gray-400/80">
						Avatar <span className="text-red-500/50 font-semibold font-display text-sm">*</span>
					</label>
					<div className="border-gray-800 border flex gap-3 pl-3 pr-5 w-[380px] py-[10px] bg-gray-950/30 hover:border-gray-700/80 has-[:focus]:border-gray-400 transition-all duration-200 rounded-md focus-default outline-none">
						<Image color="rgb(156, 163, 175)" absoluteStrokeWidth strokeWidth={1} tabIndex={-1} />
						<input
							accept="image/png, image/jpeg"
							id="avatar"
							type="file"
							name="avatar"
							className="placeholder:text-gray-400 border-none peer bg-transparent w-full outline-none block text-gray-300 file:border-none file:hidden"
							required
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="email" className="text-sm font-semibold font-display text-gray-400/80">
						Your Username <span className="text-red-500/50 font-semibold font-display text-sm">*</span>
					</label>
					<div className="border-gray-800 border flex gap-3 pl-3 pr-5 w-[380px] py-[10px] bg-gray-950/30 hover:border-gray-700/80 has-[:focus]:border-gray-400 transition-all duration-200 rounded-md focus-default outline-none">
						<User color="rgb(156, 163, 175)" absoluteStrokeWidth strokeWidth={1} tabIndex={-1} />
						<input
							onChange={e => setUsername(e.target.value)}
							id="username"
							type="text"
							name="username"
							placeholder="onlytwentycharacters"
							className="placeholder:text-gray-400 border-none peer bg-transparent w-full text-white outline-none"
							required
							minLength={4}
							maxLength={20}
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
					}  border px-8 py-[10px] group rounded-md text-center`}
				>
					Signup
					{!allFilled && <Tooltip>All fields need to be filled in</Tooltip>}
				</button>
				<a
					href="/login"
					className="font-bold text-xs focus-default text-center border flex-auto px-8 py-[10px] rounded-md bg-transparent text-gray-50 cursor-pointer border-gray-800  transition-all duration-200 hover:bg-gray-800"
				>
					Already have an account?
				</a>
				<div className="border-t border-gray-800 my-2 py-5 flex justify-center gap-5">
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Join with X</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_x.svg" alt="X" />
					</button>

					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Join with Google</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_google.svg" alt="X" />
					</button>
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Join with Discord</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_discord.svg" alt="X" />
					</button>
					<button className="focus-default bg-white group p-[10px] rounded-md">
						<span className="tooltip">Join with Github</span>
						<img width={20} height={20} className="w-5 aspect-square h-auto" src="/social_github.svg" alt="X" />
					</button>
				</div>
			</Form>
		</div>
	);
}
