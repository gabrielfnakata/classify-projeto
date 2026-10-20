export type Theme = "dark" | "light" | "system"

export const THEMES: { value: Theme; label: string }[] = [
    { value: "light", label: "Claro" },
    { value: "dark", label: "Escuro" },
    { value: "system", label: "Sistema" },
];

export const ACCENTS = [
    { value: "blue", label: "Azul" },
    { value: "green", label: "Verde" },
    { value: "red", label: "Vermelho" },
    { value: "purple", label: "Roxo" },
    { value: "orange", label: "Laranja" },
    { value: "gray", label: "Cinza" },
] as const;

export type Accent = (typeof ACCENTS)[number]["value"];

export const DEFAULT_ACCENT: Accent = "blue";

export interface ThemePreference {
    theme: Theme;
    accent: Accent;
}

export const isTheme = (value: unknown): value is Theme =>
    THEMES.some((theme) => theme.value === value);

export const isAccent = (value: unknown): value is Accent =>
    ACCENTS.some((accent) => accent.value === value);

export const USER_THEMES = THEMES.filter((theme) => theme.value !== "system");
