const eventColorThemes = [
  "bg-sky-50 border-sky-200 border-l-sky-500 text-sky-950 dark:bg-[#22313a] dark:border-[#32454f] dark:border-l-sky-500 dark:text-sky-50",
  "bg-teal-50 border-teal-200 border-l-teal-500 text-teal-950 dark:bg-[#223533] dark:border-[#334b47] dark:border-l-teal-500 dark:text-teal-50",
  "bg-amber-50 border-amber-200 border-l-amber-500 text-amber-950 dark:bg-[#3a3325] dark:border-[#514733] dark:border-l-amber-500 dark:text-amber-50",
  "bg-indigo-50 border-indigo-200 border-l-indigo-500 text-indigo-950 dark:bg-[#282d3d] dark:border-[#3a4158] dark:border-l-indigo-500 dark:text-indigo-50",
  "bg-slate-50 border-slate-200 border-l-slate-500 text-slate-950 dark:bg-[#2f3338] dark:border-[#454a50] dark:border-l-slate-400 dark:text-slate-50",
  "bg-rose-50 border-rose-200 border-l-rose-500 text-rose-950 dark:bg-[#3a2930] dark:border-[#513a43] dark:border-l-rose-500 dark:text-rose-50",
]

export function getEventColorTheme(name: string) {
  let hash = 0

  for (let index = 0; index < name.length; index++) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash)
  }

  return eventColorThemes[Math.abs(hash) % eventColorThemes.length]
}
