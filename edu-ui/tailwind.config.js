/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
              "surface-variant": "#d3e4fe",
              "primary-fixed-dim": "#b4c5ff",
              "inverse-surface": "#213145",
              "on-primary": "#ffffff",
              "inverse-on-surface": "#eaf1ff",
              "surface-dim": "#cbdbf5",
              "outline": "#737686",
              "inverse-primary": "#b4c5ff",
              "on-secondary": "#ffffff",
              "surface": "#f8f9ff",
              "surface-tint": "#0053db",
              "on-tertiary": "#ffffff",
              "tertiary-fixed-dim": "#c4c7c9",
              "surface-container-high": "#dce9ff",
              "on-secondary-container": "#5c647a",
              "on-error": "#ffffff",
              "on-background": "#0b1c30",
              "on-error-container": "#93000a",
              "primary": "#004ac6",
              "on-secondary-fixed-variant": "#3f465c",
              "secondary": "#565e74",
              "on-tertiary-fixed": "#191c1e",
              "on-secondary-fixed": "#131b2e",
              "secondary-fixed-dim": "#bec6e0",
              "surface-bright": "#f8f9ff",
              "primary-container": "#2563eb",
              "on-primary-fixed-variant": "#003ea8",
              "on-tertiary-container": "#eff1f3",
              "tertiary-fixed": "#e0e3e5",
              "surface-container": "#e5eeff",
              "on-primary-fixed": "#00174b",
              "error": "#ba1a1a",
              "background": "#f8f9ff",
              "surface-container-low": "#eff4ff",
              "secondary-fixed": "#dae2fd",
              "primary-fixed": "#dbe1ff",
              "outline-variant": "#c3c6d7",
              "on-surface": "#0b1c30",
              "secondary-container": "#dae2fd",
              "on-tertiary-fixed-variant": "#444749",
              "tertiary-container": "#6b6e70",
              "surface-container-lowest": "#ffffff",
              "surface-container-highest": "#d3e4fe",
              "on-primary-container": "#eeefff",
              "tertiary": "#525657",
              "error-container": "#ffdad6",
              "on-surface-variant": "#434655"
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "stack-lg": "32px",
              "margin-desktop": "40px",
              "gutter": "24px",
              "stack-sm": "8px",
              "margin-mobile": "16px",
              "stack-md": "16px",
              "container-max": "1280px"
      },
      "fontFamily": {
              "label-sm": [
                      "Manrope"
              ],
              "body-sm": [
                      "Manrope"
              ],
              "headline-lg-mobile": [
                      "Plus Jakarta Sans"
              ],
              "body-lg": [
                      "Manrope"
              ],
              "headline-md": [
                      "Plus Jakarta Sans"
              ],
              "headline-lg": [
                      "Plus Jakarta Sans"
              ],
              "headline-xl-mobile": [
                      "Plus Jakarta Sans"
              ],
              "label-md": [
                      "Manrope"
              ],
              "headline-xl": [
                      "Plus Jakarta Sans"
              ],
              "body-md": [
                      "Manrope"
              ],
              "headline-sm": [
                      "Plus Jakarta Sans"
              ]
      },
      "fontSize": {
              "label-sm": [
                      "12px",
                      {
                              "lineHeight": "1",
                              "fontWeight": "700"
                      }
              ],
              "body-sm": [
                      "14px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ],
              "headline-lg-mobile": [
                      "28px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "700"
                      }
              ],
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "1.6",
                              "fontWeight": "400"
                      }
              ],
              "headline-md": [
                      "24px",
                      {
                              "lineHeight": "1.3",
                              "fontWeight": "700"
                      }
              ],
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "1.2",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "700"
                      }
              ],
              "headline-xl-mobile": [
                      "32px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "800"
                      }
              ],
              "label-md": [
                      "14px",
                      {
                              "lineHeight": "1",
                              "letterSpacing": "0.02em",
                              "fontWeight": "600"
                      }
              ],
              "headline-xl": [
                      "48px",
                      {
                              "lineHeight": "1.1",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "800"
                      }
              ],
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ],
              "headline-sm": [
                      "20px",
                      {
                              "lineHeight": "1.4",
                              "fontWeight": "600"
                      }
              ]
      }
    },
  },
  plugins: [],
};
