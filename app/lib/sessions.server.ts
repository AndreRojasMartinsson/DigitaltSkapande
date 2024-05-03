import { createCookieSessionStorage } from "@remix-run/node";
import {createThemeSessionResolver} from "remix-themes"

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "theme",
		httpOnly: true,
		sameSite: "lax",
	}
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)