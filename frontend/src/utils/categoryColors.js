export const CATEGORY_COLORS = {
  Income: "#1F6D4C",
  Rent: "#8C3B4A",
  Food: "#C1652B",
  Investments: "#2C6E8E",
  Shopping: "#6A4C93",
  Utilities: "#A9820A",
  Entertainment: "#B23A6B",
  Other: "#8A8578",
  Uncategorized: "#C9C3B4",
};

export function getCategoryHex(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Uncategorized;
}