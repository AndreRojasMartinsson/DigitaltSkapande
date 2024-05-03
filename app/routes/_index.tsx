import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [];
};

export default function Index() {
	return (
		<div>
			<h1 className="font-display font-bold text-3xl my-5">Welcome to NutritionCoach</h1>
		</div>
	);
}
