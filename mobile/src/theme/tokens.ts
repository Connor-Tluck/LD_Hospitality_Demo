/** Design tokens from Hospitality.pen `variables` */
export const colors = {
  accentDark: "#5A4D2E",
  accentLight: "#C4A96A",
  accentPrimary: "#7D6B3D",
  borderSubtle: "#DCD8CB",
  foregroundInverse: "#F5F2E9",
  foregroundMuted: "#9A958C",
  foregroundPrimary: "#2D2926",
  foregroundSecondary: "#5E5954",
  success: "#4A7C59",
  surfaceCard: "#FFFDF7",
  surfaceInverse: "#2D2926",
  surfacePrimary: "#F5F2E9",
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const fontFamily = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
} as const;
