import type { PropsWithChildren } from "react";

export default function Tooltip({ children, bottom = false }: PropsWithChildren<{ bottom?: boolean }>) {
	return <span className={`tooltip ${bottom ? "tooltip-bottom" : ""}`}>{children}</span>;
}
