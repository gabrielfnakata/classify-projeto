import type { Accent, Theme } from "@/shared/models/theme";

export interface ThemeSettingDTO {
    colorMode: Theme;
    accent: Accent;
}
