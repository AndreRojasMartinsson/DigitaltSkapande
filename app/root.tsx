import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import styles from "~/tailwind.css?url";
import { themeSessionResolver } from "./lib/sessions.server";
import { PreventFlashOnWrongTheme, ThemeProvider, useTheme } from "remix-themes";
import type { PropsWithChildren } from "react";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Oxanium:wght@200..800&display=swap" },
	{ rel: "stylesheet", href: styles },
];

export async function loader({ request }: LoaderFunctionArgs) {
	const { getTheme } = await themeSessionResolver(request);
	return { theme: getTheme() };
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>();

	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction="/set-theme" disableTransitionOnThemeChange={false}>
			<AppWithProviders>{children}</AppWithProviders>
		</ThemeProvider>
	);
}

function AppWithProviders({ children }: PropsWithChildren) {
	const data = useLoaderData<typeof loader>();
	const [theme] = useTheme();

	return (
		<html lang="en" data-theme={theme ?? ""} className={theme ?? ""}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
