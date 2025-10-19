export const colors = {
  light: {
    background: "#EEEFE9",
    foreground: "#171717",
    accent: "#E5E7E0",
    border: "#D0D1C9",
    brandRed: "#F54E00",
    brandRedHover: "#D64400",
  },
  dark: {
    background: "#1A1A1A",
    foreground: "#EDEDED",
    accent: "#2A2A2A",
    border: "#404040",
    brandRed: "#F54E00",
    brandRedHover: "#D64400",
  },
} as const;

export type ThemeColors = typeof colors.light;
