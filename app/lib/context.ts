import { createContext, type MutableRefObject } from "react";

export const containerRefContext = createContext<MutableRefObject<HTMLDivElement | null> | null>(null);