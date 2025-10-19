export const tokens = {
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  typography: {
    weights: {
      regular: "430",
      medium: "475",
      semibold: "570",
      bold: "700",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  shadows: {
    window: "0 4px 16px rgba(0, 0, 0, 0.15)",
    card: "0 2px 8px rgba(0, 0, 0, 0.1)",
    button: "0 1px 3px rgba(0, 0, 0, 0.12)",
  },
  borderRadius: {
    sm: "4px",
    md: "6px",
    window: "8px",
    lg: "12px",
  },
} as const;
