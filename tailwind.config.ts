import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
const { parseColor } = require("tailwindcss/lib/util/color");
const flattenColorPalette =
  require("tailwindcss/lib/util/flattenColorPalette").default;

function colorToRgb(value: string) {
  // need to handle `alpha` here as well
  const { mode, color } = parseColor(value);
  return `${mode}(${color.join(" ")})`;
}

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "shadow-offset": (value) => {
            return {
              boxShadow: `2px 2px 0 0 ${colorToRgb(value)}`,
            };
          },
          "shadow-inset": (value) => {
            return {
              boxShadow: `inset 2px 2px 0 0 ${colorToRgb(value)}`,
            };
          },
        },
        { values: flattenColorPalette(theme("colors")), type: "color" }
      );
    }),
  ],
} satisfies Config;
