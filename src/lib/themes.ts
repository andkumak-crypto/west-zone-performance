export interface Theme {
  id: string;
  name: string;
  primaryBg: string;
  bubbleBg: string;
  bubbleBorder: string;
  variables: { [key: string]: string };
}

export const THEMES: Theme[] = [
  {
    id: "dark",
    name: "Dark Mode",
    primaryBg: "#17181c",
    bubbleBg: "bg-[#222328]",
    bubbleBorder: "border-[#3b82f6]",
    variables: {
      "--theme-bg-page": "#17181c",
      "--theme-bg-card": "#222328",
      "--theme-bg-card-60": "rgba(34, 35, 40, 0.6)",
      "--theme-bg-card-40": "rgba(34, 35, 40, 0.4)",
      "--theme-bg-card-20": "rgba(34, 35, 40, 0.2)",
      "--theme-bg-inner": "#1d1e22",
      "--theme-bg-header": "#1a1b1f",
      "--theme-bg-header-alt": "#141518",
      "--theme-bg-active": "rgba(59, 130, 246, 0.12)",
      "--theme-bg-active-alt": "rgba(59, 130, 246, 0.2)",
      "--theme-bg-grad-from": "#222328",
      "--theme-bg-grad-to": "#17181c",
      "--theme-border": "#2e3037",
      "--theme-border-60": "rgba(46, 48, 55, 0.6)",
      "--theme-border-70": "rgba(46, 48, 55, 0.7)",
      "--theme-border-40": "rgba(46, 48, 55, 0.4)",
      "--theme-border-50": "rgba(46, 48, 55, 0.5)",
      "--theme-border-hover": "#3d3f49",
      "--theme-accent": "#3b82f6",
      "--theme-accent-dark": "#1d4ed8",
      "--theme-accent-80": "rgba(59, 130, 246, 0.8)",
      "--theme-accent-70": "rgba(59, 130, 246, 0.7)",
      "--theme-accent-40": "rgba(59, 130, 246, 0.4)",
      "--theme-accent-30": "rgba(59, 130, 246, 0.3)",
      "--theme-accent-20": "rgba(59, 130, 246, 0.2)",
      "--theme-accent-10": "rgba(59, 130, 246, 0.1)",
      "--theme-accent-5": "rgba(59, 130, 246, 0.05)",
      "--theme-accent-shadow": "rgba(59, 130, 246, 0.15)",
      "--theme-bg-inner-40": "rgba(29, 30, 34, 0.4)",
      "--theme-bg-backdrop": "rgba(18, 19, 22, 0.8)",
      
      /* Text Colors for Dark Mode */
      "--theme-text-primary": "#f3f4f6",
      "--theme-text-white": "#ffffff",
      "--theme-text-gray-100": "#f3f4f6",
      "--theme-text-gray-200": "#e5e7eb",
      "--theme-text-gray-300": "#d1d5db",
      "--theme-text-gray-400": "#9ca3af",
      "--theme-text-gray-500": "#6b7280",
      "--theme-text-gray-600": "#4b5563"
    }
  },
  {
    id: "light",
    name: "Light Mode",
    primaryBg: "#f8f9fc",
    bubbleBg: "bg-[#ffffff]",
    bubbleBorder: "border-[#7c838f]",
    variables: {
      "--theme-bg-page": "#f8f9fc",
      "--theme-bg-card": "#ffffff",
      "--theme-bg-card-60": "rgba(255, 255, 255, 0.8)",
      "--theme-bg-card-40": "rgba(255, 255, 255, 0.6)",
      "--theme-bg-card-20": "rgba(248, 249, 252, 0.5)",
      "--theme-bg-inner": "#f1f5f9",
      "--theme-bg-inner-40": "rgba(241, 245, 249, 0.4)",
      "--theme-bg-backdrop": "rgba(15, 23, 42, 0.6)",
      "--theme-bg-header": "#f8f9fc",
      "--theme-bg-header-alt": "#f1f5f9",
      "--theme-bg-active": "rgba(124, 131, 143, 0.12)",
      "--theme-bg-active-alt": "rgba(124, 131, 143, 0.2)",
      "--theme-bg-grad-from": "#ffffff",
      "--theme-bg-grad-to": "#f8f9fc",
      "--theme-border": "#e2e8f0",
      "--theme-border-60": "rgba(226, 232, 240, 0.6)",
      "--theme-border-70": "rgba(226, 232, 240, 0.7)",
      "--theme-border-40": "rgba(226, 232, 240, 0.4)",
      "--theme-border-50": "rgba(226, 232, 240, 0.5)",
      "--theme-border-hover": "#cbd5e1",
      "--theme-accent": "#7c838f",
      "--theme-accent-dark": "#475569",
      "--theme-accent-80": "rgba(124, 131, 143, 0.8)",
      "--theme-accent-70": "rgba(124, 131, 143, 0.7)",
      "--theme-accent-40": "rgba(124, 131, 143, 0.4)",
      "--theme-accent-30": "rgba(124, 131, 143, 0.3)",
      "--theme-accent-20": "rgba(124, 131, 143, 0.2)",
      "--theme-accent-10": "rgba(124, 131, 143, 0.1)",
      "--theme-accent-5": "rgba(124, 131, 143, 0.05)",
      "--theme-accent-shadow": "rgba(124, 131, 143, 0.15)",
      
      /* Text Colors for Light Mode */
      "--theme-text-primary": "#0f172a",
      "--theme-text-white": "#0f172a",
      "--theme-text-gray-100": "#1e293b",
      "--theme-text-gray-200": "#334155",
      "--theme-text-gray-300": "#475569",
      "--theme-text-gray-400": "#64748b",
      "--theme-text-gray-500": "#94a3b8",
      "--theme-text-gray-600": "#cbd5e1",
      "--theme-text-accent-fg": "#ffffff"
    }
  }
];
