import { Calendar, Loader2, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { containerRefContext } from "~/lib/context";

const DRIs = {
	ZN: 10,
	VITE: 12,
	VITD: 5,
	VITC: 80,
	VITB6: 1.4,
	VITB12: 2.5,
	VITA: 800,
	WATER: -1,
	THIA: 1.1,
	SUGAD: -1,
	SUGFR: -1,
	SE: 55,
	SUCS: -1,
	RIBF: 1.4,
	RETOL: -1,
	PROT: 50,
	FAPU: -1,
	P: 700,
	NIAEQ: -1,
	NIA: 16,
	NACL: 6,
	NA: -1,
	MNSAC: -1,
	SUGAR: 90,
	FAMS: -1,
	MG: 375,
	FASAT: 20,
	CHO: 260,
	CHORL: -1,
	K: 2000,
	ID: 150,
	WHOLET: -1,
	FOL: -1,
	FIBT: -1,
	FAT: 70,
	FE: 14,
	ENERC_KCAL: 2000,
	ENERC_KJ: 8400,
	DISAC: -1,
	CA: 800,
	["F4-10:0"]: -1,
	["F22:6"]: -1,
	["F22:5"]: -1,
	["F20:5"]: -1,
	["F20:4"]: -1,
	["F20:0"]: -1,
	["F18:3"]: -1,
	["F18:2"]: -1,
	["F18:1"]: -1,
	["F18:0"]: -1,
	["F16:1"]: -1,
	["F16:0"]: -1,
	["F14:0"]: -1,
	["F12:0"]: -1,
	["CARTB"]: -1,
	WASTE: -1,
	ASH: -1,
	ALC: -1,
};

interface SearchResult {
	arLivsmedel: boolean;
	bildtyp: number;
	id: number;
	namn: string;
}

interface FoodNutritionalData {
	namn: string;
	euroFIRkod: string;
	forkortning: string;
	varde: number;
	enhet: string;
	dri: number;
	viktGram: number;
	berakning: string;
	vardetyp: string;
	vardetypkod: string;
	ursprung: string;
	ursprungkod: string;
	publikation: string;
	metodtyp: string;
	metodtypkod: string;
	metodindikator: string;
	metodindikatorkod: string;
	referenstyp: string;
	referenstypkod: string;
	kommentar: string;
}

export default function Index() {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [query, setQuery] = useState<string>("");
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
	const [loading, setLoading] = useState<boolean>(false);
	const [showResults, setShowResults] = useState<boolean>(true);
	const [item, setItem] = useState<SearchResult | null>(null);
	const [itemData, setItemData] = useState<FoodNutritionalData[] | null>(null);
	const [containerHeight, setContainerHeight] = useState<number>(0);
	const containerRef = useContext(containerRefContext);

	useEffect(() => {
		const getItemData = async () => {
			if (item === null) return;

			setItemData(null);

			const response = await fetch(
				`https://corsproxy.io/?https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel/${item?.id}/naringsvarden?sprak=1`,
				{
					cache: "force-cache",
				}
			);
			const data = (await response.json()) as FoodNutritionalData[];

			const processedData = data
				.map(item => {
					const unit = item.enhet;
					let normalizedAmount: number = 0;
					let converted = true;

					let dri = DRIs[item.euroFIRkod as keyof typeof DRIs];
					if (item.euroFIRkod === "ENERC") {
						if (item.namn === "Energi (kJ)") dri = DRIs["ENERC_KJ"];
						if (item.namn === "Energi (kcal)") dri = DRIs["ENERC_KCAL"];
					}

					switch (unit) {
						case "mg":
							normalizedAmount = item.varde / 1000;
							break;
						case "µg":
							normalizedAmount = item.varde / 1_000_000;
							break;
						default:
							converted = false;
							normalizedAmount = item.varde;
					}

					return {
						...item,
						varde: normalizedAmount,
						enhet: converted ? "g" : item.enhet,
						originalEnhet: item.enhet,
						originalVarde: item.varde,
						dri,
					};
				})
				.sort((a, b) => b.varde - a.varde)
				.map(item => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const obj: any = {
						...item,
						enhet: item.originalEnhet,
						varde: item.originalVarde,
					};

					delete obj["originalEnhet"];
					delete obj["originalVarde"];

					return obj as FoodNutritionalData;
				});

			setItemData(processedData);
		};

		void getItemData();
	}, [item]);

	useEffect(() => {
		clearTimeout(timeoutId);
		setLoading(true);

		if (query.length < 1) {
			setLoading(false);
			clearTimeout(timeoutId);
			setResults([]);
			return;
		}

		const id = setTimeout(async () => {
			if (query.length < 1) {
				setLoading(false);
				clearTimeout(timeoutId);
				setResults([]);
				return;
			}

			const response = await fetch(
				`https://corsproxy.io/?https://soknaringsinnehall.livsmedelsverket.se/Home/HamtaLivsmedelTillAutoComplete?sokOrd=${encodeURIComponent(
					query
				)}&soktyp=1&_=1713531079644`,
				{
					cache: "force-cache",
				}
			);

			const body = (await response.json()) as SearchResult[];
			setResults(body.slice(1));
			setLoading(false);
		}, 200);

		setTimeoutId(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, setLoading]);

	useEffect(() => {
		const callback = () => {
			if (containerRef === null || containerRef.current === null) return;

			const container = containerRef.current;
			setContainerHeight(container.clientHeight);
		};

		callback();

		window.addEventListener("resize", callback);
		return () => window.removeEventListener("resize", callback);
	}, [containerRef]);

	return (
		<>
			<div className="island p-6 rounded-md bg-white border border-gray-200 dark:bg-gray-900/70 dark:border-gray-800/70 shadow-md">
				<h4 className="text-gray-950 dark:text-gray-50 font-display font-bold text-2xl">Today&apos;s Macros</h4>
				<div className="flex flex-row items-center py-1 mt-1 gap-2 pr-32">
					<Calendar size={16} className="text-gray-300 dark:text-gray-700" />
					<h5 className="text-gray-400 dark:text-gray-600 font-medium text-xs">19/04/2024</h5>
				</div>
				<div className="h-[1px] w-full bg-gray-200 dark:bg-gray-800 my-4"></div>
				<ol className="flex flex-col gap-6">
					<li className="flex flex-col">
						<div className="flex justify-between items-center">
							<p className="text-gray-950 dark:text-gray-50 text-sm font-display font-semibold">Protein</p>
							<span className="text-gray-400 dark:text-gray-600 text-xs font-medium">
								67 / 105 <span className="text-xs text-gray-400/80 dark:text-gray-600/80">(g)</span>
							</span>
						</div>
						<div className="w-full overflow-clip rounded-full bg-orange-400/20 dark:bg-orange-300/20 h-[5px]">
							<div className="w-[63.809523809%] bg-orange-400/80 dark:bg-orange-300/80 h-full"></div>
						</div>
					</li>
					<li className="flex flex-col">
						<div className="flex justify-between items-center">
							<p className="text-gray-950 dark:text-gray-50 text-sm font-display font-semibold">Carbohydrates</p>
							<span className="text-gray-400 dark:text-gray-600 text-xs font-medium">
								86 / 165 <span className="text-xs text-gray-400/80 dark:text-gray-600/80">(g)</span>
							</span>
						</div>
						<div className="w-full overflow-clip rounded-full bg-amber-400/20 dark:bg-amber-300/20 h-[5px]">
							<div className="w-[52.121212121%] bg-amber-400/80 dark:bg-amber-300/80 h-full"></div>
						</div>
					</li>
				</ol>
			</div>
			<div className="island rounded-md p-10 bg-white border border-gray-200 dark:bg-gray-900/70 dark:border-gray-800/70 shadow-md flex-auto">
				<div className="relative">
					<div className="pl-4 pr-3 relative py-2 rounded-md w-fit gap-3 focus-default flex items-center justify-between bg-gray-200/60 dark:bg-gray-900">
						<input
							className="dark:text-white text-gray-900 bg-transparent h-full flex-auto outline-none border-none"
							placeholder="Search here"
							type="text"
							name="search"
							onFocus={() => setShowResults(true)}
							onBlur={() => setTimeout(() => setShowResults(false), 150)}
							onChange={e => setQuery(e.target.value)}
						/>
						<Loader2 className={`animate-spin text-gray-400 dark:text-gray-700 ${loading ? "visible" : "invisible"}`} />
					</div>

					<div
						className={`p-4 dark:bg-gray-900 ${
							showResults ? "visible" : "invisible"
						} bg-white shadow-2xl dark:shadow-gray-950/50 shadow-gray-600/10 border border-gray-300 dark:border-gray-800 rounded-md z-50 absolute top-12 w-fit ${
							query.length > 0 ? "visible" : "invisible"
						}`}
					>
						<div className={`w-full h-full min-w-48`}>
							<header className="flex items-center mb-2 pb-2">
								<div className="flex items-center justify-between flex-auto gap-[5px]">
									<p className="font-semibold dark:text-gray-400 text-gray-600">{results.length}</p>
									<p className="flex-auto dark:text-gray-300 text-gray-700 font-semibold">Results</p>
								</div>
								<button className="flex justify-center p-[4px] items-center aspect-square bg-gray-200/40 dark:bg-gray-800/80 rounded">
									<X size={18} className="text-gray-500  aspect-square" />
								</button>
							</header>
							<ol className={`flex flex-col divide-y divide-gray-200/60 dark:divide-gray-800 ${loading ? "hidden" : showResults ? "visible" : "hidden"}  `}>
								{results.map(result => (
									<li
										key={result.id}
										className="even:bg-gray-100/30 hover:bg-gray-100/40 even:hover:bg-gray-200/40 dark:even:bg-gray-800/30 hover:cursor-pointer dark:hover:bg-gray-800/20 dark:even:hover:bg-gray-800/50 transition-all text-gray-900 dark:text-white duration-150 ease-in-out"
									>
										<button
											className="outline-none border-none bg-transparent p-2 px-3 appearance-none w-full h-full text-left"
											onClick={() => {
												setItem(result);
											}}
										>
											{result.namn}
										</button>
									</li>
								))}
							</ol>
							<div className={`flex justify-center items-center ${loading ? "visible" : "hidden"}`}>
								<Loader2 size={32} className="text-gray-600 animate-spin" />
							</div>
						</div>
					</div>
				</div>
				{/* {item === null || (itemData === null && <Loader2 size={32} className="animate-spin text-gray-600" />)} */}

				<div>
					<ol className="overflow-y-scroll bg-gray-50 dark:bg-gray-900 rounded-md mt-6 relative" style={{ maxHeight: `${containerHeight - 300}px` }}>
						<h5 className="text-3xl font-display p-6 pb-4 font-bold text-gray-950 dark:text-gray-200 border-b sticky flex items-end rounded-t-md top-0 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-lg border-gray-200 dark:border-gray-800">
							{(item === null || itemData === null) && <div className="animate-pulse bg-gray-800 w-64 h-10"></div>}
							{item !== null && itemData !== null && item.namn}
							<span className="text-xl ml-5  text-gray-500 font-semibold">Nutritional Values</span>
						</h5>
						<div className="w-full h-full p-6 flex flex-col divide-y dark:divide-gray-800/50 divide-gray-300/50">
							{itemData !== null &&
								itemData.map((item, index) => (
									<li key={index} className="flex flex-col gap-3 py-3">
										<div className="flex gap-3 items-center justify-between">
											<div className="flex gap-3 items-center">
												<p className="text-gray-950 dark:text-gray-100 font-semibold font-display">{item.namn}</p>
												<p className="text-gray-950 dark:text-gray-100 text-sm">
													{item.varde}
													{item.enhet}
												</p>
											</div>
											<div>
												<p className="text-gray-400 dark:text-gray-500 text-sm">
													DRI {item.dri < 0 ? "" : "- "}
													<span className="text-xs text-gray-950 dark:text-gray-100">
														{item.dri < 0 ? "-" : `${item.dri} ${item.enhet} (${Math.floor((item.varde / item.dri) * 100)} %)`}
													</span>
												</p>
											</div>
										</div>
										<div className="w-full overflow-clip rounded-full bg-orange-400/20 dark:bg-orange-300/20 h-[5px]">
											<div
												style={{ width: `${(item.varde / item.dri) * 100}%` }}
												className="w-[63.809523809%] bg-orange-400/80 dark:bg-orange-300/80 h-full"
											></div>
										</div>
									</li>
								))}
						</div>
					</ol>
				</div>
			</div>
		</>
	);
}
