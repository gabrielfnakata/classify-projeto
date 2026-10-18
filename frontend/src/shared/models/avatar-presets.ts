const presetFiles = import.meta.glob<string>("@/assets/avatars/*.svg", {
    eager: true,
    query: "?url",
    import: "default",
});

const presetUrls: Record<string, string> = Object.fromEntries(
    Object.entries(presetFiles).map(([path, url]) => [path.split("/").pop()!.replace(".svg", ""), url])
);

export const AVATAR_PRESETS = Object.keys(presetUrls).sort();

export const avatarPresetSrc = (preset: string): string | null => presetUrls[preset] ?? null;
