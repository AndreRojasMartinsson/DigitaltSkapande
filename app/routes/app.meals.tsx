import { Calendar } from "lucide-react";

export default function Index() {
	return (
		<>
			<div className="island p-6 bg-white border border-gray-200 dark:bg-gray-900/70 dark:border-gray-800/70 shadow-md">
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
			<div className="island p-10 bg-white border border-gray-200 dark:bg-gray-900/70 dark:border-gray-800/70 shadow-md flex-auto">
				<h1 className="text-gray-950">Another island</h1>
			</div>
		</>
	);
}
