// Default colors for patterns
export const DEFAULT_COLORS = {
  NORTH_STAR: {
    outerSquares: "#F9A826", // Orange
    triangles: "#C74B16", // Red/brown
    diagonalTriangles: "#A7C5EB", // Light blue
    centerSquare: "#C7F9CC", // Mint green
  },
  CROSSROADS: {
    blue: "#6A8EAE", // Blue
    red: "#D64933", // Red
    yellow: "#F9E784", // Yellow
  },
  BEAR_PAWS: {
    mainPaw: "#8B4513", // Brown
    background: "#E6CCB2", // Light tan
    pawPrints: "#5D2E0C", // Darker brown
  },
  LOG_CABIN: {
    center: "#D64933", // Red
    strips: [
      "#F9E784", // Light yellow
      "#6A8EAE", // Blue
      "#F9E784", // Light yellow
      "#6A8EAE", // Blue
      "#F9E784", // Light yellow
      "#6A8EAE", // Blue
      "#F9E784", // Light yellow
      "#6A8EAE", // Blue
    ],
  },
}

// Storage keys for localStorage
export const STORAGE_KEYS = {
  NORTH_STAR: "northstar_fabrics",
  CROSSROADS: "crossroads_fabrics",
  BEAR_PAWS: "bearpaws_fabrics",
  LOG_CABIN: "logcabin_fabrics",
}
