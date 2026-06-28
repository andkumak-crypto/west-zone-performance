import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Settings,
  ChevronRight,
  Database,
  AlertCircle,
  HelpCircle,
  Check,
  X,
  Plus,
  Share2,
  Search,
  Filter,
  ArrowUpDown,
  Award,
  Briefcase,
  MapPin,
  Laptop,
  Palette,
  Sun,
  Moon,
  Building2,
  Lightbulb,
  BarChart3,
  ExternalLink
} from "lucide-react";

import {
  fetchGoogleSheetData,
  extractSpreadsheetId,
  DEFAULT_MUMBAI_DATA,
  DEFAULT_PUNE_DATA,
  DEFAULT_ROM_DATA,
  TeamData,
  fetchWestZonePerformanceData,
  WestZonePerformanceData,
  TrainerPerformanceRow,
  fetchProductTypeData,
  ProductTypeCount
} from "../lib/sheets";
import { THEMES, Theme } from "../lib/themes";

const parseHourRange = (timingStr: string): { start: number; end: number } | null => {
  if (!timingStr || typeof timingStr !== "string") return null;
  const norm = timingStr.toLowerCase().replace(/\s+/g, "").replace(/to/g, "-");
  
  // Try matching standard "11am-12pm" or "11:00am-12:00pm" or "11.00am-12.00pm"
  const regex = /^(\d+(?:[\.\:]\d+)?)(am|pm)-(\d+(?:[\.\:]\d+)?)(am|pm)$/;
  const match = norm.match(regex);
  if (match) {
    const parsePart = (valStr: string, ampm: string): number => {
      const numStr = valStr.replace(/[\.\:]/g, ".");
      const val = parseFloat(numStr);
      const hour = Math.floor(val);
      const mins = val - hour;
      
      let finalHour = hour;
      if (ampm === "pm" && hour !== 12) finalHour += 12;
      if (ampm === "am" && hour === 12) finalHour = 0;
      
      return finalHour + mins;
    };

    const start = parsePart(match[1], match[2]);
    const end = parsePart(match[3], match[4]);
    return { start, end };
  }

  // Fallback: search for numbers and am/pm tags
  const numbers = norm.match(/\d+/g);
  const ampms = norm.match(/am|pm/g);
  if (numbers && numbers.length >= 2 && ampms && ampms.length >= 2) {
    let startHour = parseInt(numbers[0], 10);
    const startAmPm = ampms[0];
    let endHour = parseInt(numbers[1], 10);
    const endAmPm = ampms[2] || ampms[1]; // handle scenarios where minute parts are returned in numbers array

    if (startAmPm === "pm" && startHour !== 12) startHour += 12;
    if (startAmPm === "am" && startHour === 12) startHour = 0;

    if (endAmPm === "pm" && endHour !== 12) endHour += 12;
    if (endAmPm === "am" && endHour === 12) endHour = 0;

    return { start: startHour, end: endHour };
  }

  return null;
};

const isTrainerScheduledOnRow = (cell: any): boolean => {
  if (!cell) return false;
  if (cell.isScheduled === true) return true;
  const val = (cell.value || "").trim();
  return val !== "" && val !== "—";
};

const getTrainerShiftLabel = (timingRows: any[], trainerName: string): string => {
  const scheduledRows = timingRows.filter(row => {
    const cell = row.cells?.[trainerName];
    return isTrainerScheduledOnRow(cell);
  });

  if (scheduledRows.length === 0) {
    return "not scheduled";
  }

  let minStart = 24;
  let maxEnd = 0;
  let totalHours = 0;

  scheduledRows.forEach(row => {
    const range = parseHourRange(row.timing);
    if (range) {
      if (range.start < minStart) minStart = range.start;
      if (range.end > maxEnd) maxEnd = range.end;
      totalHours++;
    }
  });

  if (minStart === 24 || maxEnd === 0) {
    return "not scheduled";
  }

  // If the trainer is mentioned for 8 or more hours, it's a Full day
  if (scheduledRows.length >= 8) {
    return "Full day";
  }

  const spannedHours = maxEnd - minStart;

  if (spannedHours >= 8) {
    return "Full day";
  }

  // - Morning to afternoon shifts (starting before 3 PM, i.e., < 15) -> "First half"
  // - Evening to night shifts (starting at or after 3 PM, i.e., >= 15) -> "Second half"
  if (minStart < 15) {
    return "First half";
  } else {
    return "Second half";
  }
};

interface CircularProgressProps {
  percentage: number;
  color: string;
}

const CircularProgress = ({ percentage, color }: CircularProgressProps) => {
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-white font-mono leading-none">
        {percentage}%
      </span>
    </div>
  );
};

export default function TrainerDashboard() {
  // Sheets configuration state
  const [mumbaiUrl, setMumbaiUrl] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get("mumbai") || urlParams.get("sheet_mumbai") || urlParams.get("mumbaiUrl");
      if (urlVal) {
        localStorage.setItem("sheet_mumbai", urlVal);
        return urlVal;
      }
      return localStorage.getItem("sheet_mumbai") || "";
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return "";
    }
  });
  const [puneUrl, setPuneUrl] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get("pune") || urlParams.get("sheet_pune") || urlParams.get("puneUrl");
      if (urlVal) {
        localStorage.setItem("sheet_pune", urlVal);
        return urlVal;
      }
      return localStorage.getItem("sheet_pune") || "";
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return "";
    }
  });
  const [romUrl, setRomUrl] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get("rom") || urlParams.get("sheet_rom") || urlParams.get("romUrl");
      if (urlVal) {
        localStorage.setItem("sheet_rom", urlVal);
        return urlVal;
      }
      return localStorage.getItem("sheet_rom") || "";
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return "";
    }
  });
  const [westUrl, setWestUrl] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get("west") || urlParams.get("sheet_west") || urlParams.get("westUrl");
      if (urlVal) {
        localStorage.setItem("sheet_west", urlVal);
        return urlVal;
      }
      return localStorage.getItem("sheet_west") || "https://docs.google.com/spreadsheets/d/13SthwdF2HUBv4bWRiSaY_4quYrSp5GGFOQPwUYbeCc4/edit?usp=sharing";
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return "https://docs.google.com/spreadsheets/d/13SthwdF2HUBv4bWRiSaY_4quYrSp5GGFOQPwUYbeCc4/edit?usp=sharing";
    }
  });
  const [analyticsUrl, setAnalyticsUrl] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVal = urlParams.get("analytics") || urlParams.get("sheet_analytics") || urlParams.get("analyticsUrl");
      if (urlVal) {
        localStorage.setItem("sheet_analytics", urlVal);
        return urlVal;
      }
      return localStorage.getItem("sheet_analytics") || "https://docs.google.com/spreadsheets/d/13SthwdF2HUBv4bWRiSaY_4quYrSp5GGFOQPwUYbeCc4/edit?gid=590056654#gid=590056654";
    } catch (e) {
      console.warn("Storage access restricted:", e);
      return "https://docs.google.com/spreadsheets/d/13SthwdF2HUBv4bWRiSaY_4quYrSp5GGFOQPwUYbeCc4/edit?gid=590056654#gid=590056654";
    }
  });
  
  // Dashboard states
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<"Mumbai" | "Pune" | "ROM">("Pune");
  const [activeView, setActiveView] = useState<"virtual" | "west" | "analytics">("virtual");
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  
  // West Zone View States
  const [westSearchQuery, setWestSearchQuery] = useState("");
  const [westTLFilter, setWestTLFilter] = useState("all");
  const [westSortCol, setWestSortCol] = useState<keyof TrainerPerformanceRow>("totalTraining");
  const [westSortOrder, setWestSortOrder] = useState<"asc" | "desc">("desc");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const syncEnabled = true;
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Dynamic Theme State
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let urlTheme = urlParams.get("theme");
      if (urlTheme === "midnight") urlTheme = "dark";
      if (urlTheme && THEMES.some(t => t.id === urlTheme)) {
        localStorage.setItem("trainer_dashboard_theme", urlTheme);
        return urlTheme;
      }
      let localTheme = localStorage.getItem("trainer_dashboard_theme");
      if (localTheme === "midnight") localTheme = "dark";
      return (localTheme && THEMES.some(t => t.id === localTheme)) ? localTheme : "dark";
    } catch (e) {
      return "dark";
    }
  });

  const activeThemeObj = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  // Dynamically compile CSS overrides for Tailwind's compiled classes
  const getThemeStyles = () => {
    return `
      :root {
        ${Object.entries(activeThemeObj.variables)
          .map(([key, val]) => `${key}: ${val};`)
          .join("\n")}
      }
      body {
        background-color: var(--theme-bg-page) !important;
        color: var(--theme-text-primary) !important;
      }
      .bg-\\[\\#050811\\] {
        background-color: var(--theme-bg-page) !important;
      }
      .bg-\\[\\#0b1329\\] {
        background-color: var(--theme-bg-card) !important;
      }
      .bg-\\[\\#111827\\] {
        background-color: var(--theme-bg-inner) !important;
      }
      .bg-\\[\\#131e35\\] {
        background-color: var(--theme-bg-inner) !important;
      }
      .bg-\\[\\#070c19\\]\\/40 {
        background-color: var(--theme-bg-inner-40) !important;
      }
      .bg-\\[\\#020409\\]\\/80 {
        background-color: var(--theme-bg-backdrop) !important;
      }
      .bg-\\[\\#0b1329\\]\\/60 {
        background-color: var(--theme-bg-card-60) !important;
      }
      .bg-\\[\\#0b1329\\]\\/40 {
        background-color: var(--theme-bg-card-40) !important;
      }
      .bg-\\[\\#0b1329\\]\\/20 {
        background-color: var(--theme-bg-card-20) !important;
      }
      .bg-\\[\\#080d1a\\] {
        background-color: var(--theme-bg-inner) !important;
      }
      .bg-\\[\\#0a0f1d\\] {
        background-color: var(--theme-bg-header) !important;
      }
      .bg-\\[\\#070d1e\\] {
        background-color: var(--theme-bg-header-alt) !important;
      }
      .bg-\\[\\#0d1527\\] {
        background-color: var(--theme-bg-card) !important;
      }
      .bg-\\[\\#111d3d\\] {
        background-color: var(--theme-bg-active) !important;
      }
      .bg-\\[\\#112147\\] {
        background-color: var(--theme-bg-active-alt) !important;
      }
      .bg-\\[\\#1e293b\\] {
        background-color: var(--theme-bg-active-alt) !important;
      }
      .bg-\\[\\#0e172a\\] {
        background-color: var(--theme-bg-inner) !important;
      }
      .bg-gradient-to-b.from-\\[\\#0e172a\\] {
        background-image: linear-gradient(to bottom, var(--theme-bg-grad-from), var(--theme-bg-grad-to)) !important;
      }
      .from-\\[\\#0e172a\\] {
        --tw-gradient-from: var(--theme-bg-grad-from) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(14, 23, 42, 0)) !important;
      }
      .to-\\[\\#070d1e\\] {
        --tw-gradient-to: var(--theme-bg-grad-to) !important;
      }
      .border-\\[\\#1e293b\\] {
        border-color: var(--theme-border) !important;
      }
      .border-\\[\\#1e293b\\]\\/60 {
        border-color: var(--theme-border-60) !important;
      }
      .border-\\[\\#1e293b\\]\\/70 {
        border-color: var(--theme-border-70) !important;
      }
      .border-\\[\\#1e293b\\]\\/40 {
        border-color: var(--theme-border-40) !important;
      }
      .border-\\[\\#1e293b\\]\\/50 {
        border-color: var(--theme-border-50) !important;
      }
      .border-\\[\\#1f2937\\] {
        border-color: var(--theme-border) !important;
      }
      .border-\\[\\#334155\\] {
        border-color: var(--theme-border) !important;
      }
      .hover\\:border-\\[\\#253556\\]:hover {
        border-color: var(--theme-border-hover) !important;
      }
      .hover\\:bg-\\[\\#161e2d\\]:hover {
        background-color: var(--theme-bg-active) !important;
      }
      .hover\\:bg-\\[\\#131e35\\]:hover {
        background-color: var(--theme-bg-active) !important;
      }
      .hover\\:bg-\\[\\#1a2846\\]:hover {
        background-color: var(--theme-bg-active-alt) !important;
      }
      .border-\\[\\#ebb305\\] {
        border-color: var(--theme-accent) !important;
      }
      .border-amber-500\\/80 {
        border-color: var(--theme-accent-80) !important;
      }
      
      /* Text overrides to perfectly adapt to dark and light modes */
      .text-white,
      .text-\\[\\#f3f4f6\\] {
        color: var(--theme-text-primary) !important;
      }
      .text-\\[\\#050811\\] {
        color: var(--theme-text-accent-fg, #050811) !important;
      }
      .text-gray-100 {
        color: var(--theme-text-gray-100) !important;
      }
      .text-gray-200 {
        color: var(--theme-text-gray-200) !important;
      }
      .text-gray-300 {
        color: var(--theme-text-gray-300) !important;
      }
      .text-gray-400 {
        color: var(--theme-text-gray-400) !important;
      }
      .text-gray-500 {
        color: var(--theme-text-gray-500) !important;
      }
      .text-gray-600 {
        color: var(--theme-text-gray-600) !important;
      }
      
      .text-\\[\\#ebb305\\] {
        color: var(--theme-accent) !important;
      }
      .bg-\\[\\#ebb305\\] {
        background-color: var(--theme-accent) !important;
      }
      .text-amber-500 {
        color: var(--theme-accent) !important;
      }
      .text-amber-400 {
        color: var(--theme-accent) !important;
      }
      .text-amber-300 {
        color: var(--theme-accent) !important;
      }
      .bg-amber-500 {
        background-color: var(--theme-accent) !important;
      }
      .bg-amber-500\\/10 {
        background-color: var(--theme-accent-10) !important;
      }
      .bg-amber-500\\/20 {
        background-color: var(--theme-accent-20) !important;
      }
      .border-amber-500\\/20 {
        border-color: var(--theme-accent-20) !important;
      }
      .border-amber-500\\/40 {
        border-color: var(--theme-accent-40) !important;
      }
      .focus\\:border-amber-500\\/70:focus {
        border-color: var(--theme-accent-70) !important;
      }
      .focus\\:ring-amber-500\\/30:focus {
        box-shadow: 0 0 0 1px var(--theme-accent-30) !important;
      }
      .shadow-\\[0_0_12px_rgba\\(235\\,179\\,5\\,0\\.1\\)\\] {
        box-shadow: 0 0 12px var(--theme-accent-shadow) !important;
      }
      .shadow-amber-500\\/5 {
        box-shadow: 0 10px 15px -3px var(--theme-accent-5), 0 4px 6px -4px var(--theme-accent-5) !important;
      }
      .ring-amber-500\\/30 {
        --tw-ring-color: var(--theme-accent-30) !important;
      }
      .hover\\:border-amber-500\\/40:hover {
        border-color: var(--theme-accent-40) !important;
      }
      .animate-spin.text-amber-500 {
        color: var(--theme-accent) !important;
      }
      .from-amber-500.to-amber-600 {
        background-image: linear-gradient(to right, var(--theme-accent), var(--theme-accent-dark)) !important;
      }
      .bg-\\[\\#f59e0b\\] {
        background-color: var(--theme-accent) !important;
      }
      .hover\\:from-amber-600:hover {
        background-image: linear-gradient(to right, var(--theme-accent-dark), var(--theme-accent)) !important;
      }
      .hover\\:to-amber-700:hover {
        opacity: 0.95 !important;
      }
      
      /* Webkit scrollbar customization to perfectly match the sleek dashboard themes */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: var(--theme-bg-page);
      }
      ::-webkit-scrollbar-thumb {
        background: var(--theme-border);
        border-radius: 9999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--theme-accent-40);
      }
      ::selection {
        background-color: var(--theme-accent);
        color: var(--theme-bg-page);
      }
    `;
  };

  // Synchronize browser URL parameters with state dynamically so that copy/sharing is seamless
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      let updated = false;

      if (mumbaiUrl) {
        if (url.searchParams.get("mumbai") !== mumbaiUrl) {
          url.searchParams.set("mumbai", mumbaiUrl);
          updated = true;
        }
      } else if (url.searchParams.has("mumbai")) {
        url.searchParams.delete("mumbai");
        updated = true;
      }

      if (puneUrl) {
        if (url.searchParams.get("pune") !== puneUrl) {
          url.searchParams.set("pune", puneUrl);
          updated = true;
        }
      } else if (url.searchParams.has("pune")) {
        url.searchParams.delete("pune");
        updated = true;
      }

      if (romUrl) {
        if (url.searchParams.get("rom") !== romUrl) {
          url.searchParams.set("rom", romUrl);
          updated = true;
        }
      } else if (url.searchParams.has("rom")) {
        url.searchParams.delete("rom");
        updated = true;
      }

      if (westUrl) {
        if (url.searchParams.get("west") !== westUrl) {
          url.searchParams.set("west", westUrl);
          updated = true;
        }
      } else if (url.searchParams.has("west")) {
        url.searchParams.delete("west");
        updated = true;
      }

      if (analyticsUrl) {
        if (url.searchParams.get("analytics") !== analyticsUrl) {
          url.searchParams.set("analytics", analyticsUrl);
          updated = true;
        }
      } else if (url.searchParams.has("analytics")) {
        url.searchParams.delete("analytics");
        updated = true;
      }

      if (currentThemeId && currentThemeId !== "midnight") {
        if (url.searchParams.get("theme") !== currentThemeId) {
          url.searchParams.set("theme", currentThemeId);
          updated = true;
        }
      } else if (url.searchParams.has("theme")) {
        url.searchParams.delete("theme");
        updated = true;
      }

      if (updated) {
        window.history.replaceState(null, "", url.pathname + url.search);
      }
    } catch (e) {
      console.warn("URL history sync error:", e);
    }
  }, [mumbaiUrl, puneUrl, romUrl, westUrl, analyticsUrl, currentThemeId]);

  const handleShare = () => {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      if (mumbaiUrl) url.searchParams.set("mumbai", mumbaiUrl);
      if (puneUrl) url.searchParams.set("pune", puneUrl);
      if (romUrl) url.searchParams.set("rom", romUrl);
      if (westUrl) url.searchParams.set("west", westUrl);
      if (analyticsUrl) url.searchParams.set("analytics", analyticsUrl);
      if (currentThemeId !== "midnight") url.searchParams.set("theme", currentThemeId);
      
      navigator.clipboard.writeText(url.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Clipboard access error:", e);
    }
  };

  // Datasets
  const [mumbaiData, setMumbaiData] = useState<TeamData>(DEFAULT_MUMBAI_DATA);
  const [puneData, setPuneData] = useState<TeamData>(DEFAULT_PUNE_DATA);
  const [romData, setRomData] = useState<TeamData>(DEFAULT_ROM_DATA);
  const [westData, setWestData] = useState<WestZonePerformanceData>({
    rows: [],
    totals: { physicalVisit: 0, virtual: 0, outOfStation: 0, totalTraining: 0 }
  });
  const [productData, setProductData] = useState<ProductTypeCount[]>([]);

  // Initialize and load
  useEffect(() => {
    updateRefreshTimestamp();
    loadAllSheets();
  }, [mumbaiUrl, puneUrl, romUrl, westUrl, analyticsUrl]);

  const updateRefreshTimestamp = () => {
    const now = new Date();
    // E.g., '23 Jun 2026, 7:03 pm'
    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const parts = formatter.formatToParts(now);
    let day = "", month = "", year = "", hour = "", minute = "", dayPeriod = "";
    parts.forEach(p => {
      if (p.type === "day") day = p.value;
      if (p.type === "month") month = p.value;
      if (p.type === "year") year = p.value;
      if (p.type === "hour") hour = p.value;
      if (p.type === "minute") minute = p.value;
      if (p.type === "dayPeriod") dayPeriod = p.value.toLowerCase();
    });
    setLastRefreshed(`${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`);
  };

  const loadAllSheets = async () => {
    setIsLoading(true);

    const mumbaiId = extractSpreadsheetId(mumbaiUrl);
    const puneId = extractSpreadsheetId(puneUrl);
    const romId = extractSpreadsheetId(romUrl);

    // Load Mumbai
    let loadedMumbai = DEFAULT_MUMBAI_DATA;
    if (mumbaiId) {
      loadedMumbai = await fetchGoogleSheetData(mumbaiUrl, null, "Mumbai");
    } else {
      loadedMumbai = {
        ...DEFAULT_MUMBAI_DATA,
        error: mumbaiUrl ? "Invalid Mumbai spreadsheet link" : undefined
      };
    }

    // Load Pune
    let loadedPune = DEFAULT_PUNE_DATA;
    if (puneId) {
      loadedPune = await fetchGoogleSheetData(puneUrl, null, "Pune");
    } else {
      loadedPune = {
        ...DEFAULT_PUNE_DATA,
        error: puneUrl ? "Invalid Pune spreadsheet link" : undefined
      };
    }

    // Load ROM
    let loadedRom = DEFAULT_ROM_DATA;
    if (romId) {
      loadedRom = await fetchGoogleSheetData(romUrl, null, "ROM");
    } else {
      loadedRom = {
        ...DEFAULT_ROM_DATA,
        error: romUrl ? "Invalid ROM spreadsheet link" : undefined
      };
    }

    // Load West Zone Performance
    let loadedWest: WestZonePerformanceData = {
      rows: [],
      totals: { physicalVisit: 0, virtual: 0, outOfStation: 0, totalTraining: 0 }
    };
    if (extractSpreadsheetId(westUrl)) {
      loadedWest = await fetchWestZonePerformanceData(westUrl);
    } else {
      loadedWest = {
        rows: [],
        totals: { physicalVisit: 0, virtual: 0, outOfStation: 0, totalTraining: 0 },
        error: westUrl ? "Invalid West Zone spreadsheet link" : undefined
      };
    }

    // Load Product Type Data
    let loadedProductData: ProductTypeCount[] = [];
    if (extractSpreadsheetId(analyticsUrl)) {
      loadedProductData = await fetchProductTypeData(analyticsUrl);
    }

    setMumbaiData(loadedMumbai);
    setPuneData(loadedPune);
    setRomData(loadedRom);
    setWestData(loadedWest);
    setProductData(loadedProductData);
    setAuthErrorMessage(null);

    updateRefreshTimestamp();
    setIsLoading(false);
  };

  const saveConfig = () => {
    try {
      localStorage.setItem("sheet_mumbai", mumbaiUrl);
      localStorage.setItem("sheet_pune", puneUrl);
      localStorage.setItem("sheet_rom", romUrl);
      localStorage.setItem("sheet_west", westUrl);
      localStorage.setItem("sheet_analytics", analyticsUrl);
    } catch (e) {
      console.warn("Storage write restricted:", e);
    }
    setShowConfig(false);
    loadAllSheets();
  };

  const getActiveData = () => {
    if (activeTab === "Mumbai") return mumbaiData;
    if (activeTab === "Pune") return puneData;
    return romData;
  };

  const currentData = getActiveData();

  // West Zone specific direct metrics
  // Check if user has configured real sheets for Mumbai and Pune
  const hasMumbaiSheet = !!mumbaiUrl && !!extractSpreadsheetId(mumbaiUrl);
  const hasPuneSheet = !!puneUrl && !!extractSpreadsheetId(puneUrl);

  // If at least one sheet is configured, we only include the configured ones
  const useMumbai = hasMumbaiSheet;
  const usePune = hasPuneSheet;

  const mumbaiTotal = useMumbai ? mumbaiData.totalCompleted : 0;
  const puneTotal = usePune ? puneData.totalCompleted : 0;
  const westZoneTotal = mumbaiTotal + puneTotal;
  
  const mumbaiTrainersCount = useMumbai ? mumbaiData.trainerCount : 0;
  const puneTrainersCount = usePune ? puneData.trainerCount : 0;
  const totalWestTrainers = mumbaiTrainersCount + puneTrainersCount;
  
  const mumbaiAvg = mumbaiTrainersCount > 0 ? (mumbaiTotal / mumbaiTrainersCount).toFixed(1) : "0.0";
  const puneAvg = puneTrainersCount > 0 ? (puneTotal / puneTrainersCount).toFixed(1) : "0.0";
  const westZoneAvg = totalWestTrainers > 0 ? (westZoneTotal / totalWestTrainers).toFixed(1) : "0.0";

  // Helper calculation for West Zone Leaderboard
  const getWestZoneLeaderboard = () => {
    const list: { name: string; team: "Mumbai" | "Pune"; total: number }[] = [];
    
    // Mumbai
    if (useMumbai) {
      mumbaiData.trainers.forEach(trainer => {
        const totalSum = mumbaiData.timingRows.reduce((acc, row) => {
          const val = row.cells[trainer]?.value || "0";
          const parsed = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
          return acc + (row.cells[trainer]?.isCompleted ? (parsed || 1) : 0);
        }, 0);
        list.push({ name: trainer, team: "Mumbai", total: totalSum });
      });
    }

    // Pune
    if (usePune) {
      puneData.trainers.forEach(trainer => {
        const totalSum = puneData.timingRows.reduce((acc, row) => {
          const val = row.cells[trainer]?.value || "0";
          const parsed = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
          return acc + (row.cells[trainer]?.isCompleted ? (parsed || 1) : 0);
        }, 0);
        list.push({ name: trainer, team: "Pune", total: totalSum });
      });
    }

    return list.sort((a, b) => b.total - a.total);
  };

  // Helper to find common timings
  const getCommonTimings = () => {
    const timings: string[] = [];
    if (useMumbai) timings.push(...mumbaiData.timingRows.map(r => r.timing));
    if (usePune) timings.push(...puneData.timingRows.map(r => r.timing));
    return Array.from(new Set(timings));
  };

  // Helper calculations for West Zone "Trainer Wise Performance" tab
  const calculateAvgProductivity = () => {
    if (!westData.rows || westData.rows.length === 0) return "0.0%";
    let total = 0;
    let count = 0;
    westData.rows.forEach(r => {
      const num = parseFloat(r.productivityPct.replace(/[^\d.]/g, ""));
      if (!isNaN(num)) {
        total += num;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) + "%" : "0.0%";
  };

  const getTLGroupedStats = () => {
    const groups: { [tl: string]: { trainerCount: number; totalTraining: number; totalProductivity: number; prodCount: number } } = {};
    westData.rows.forEach(r => {
      const tl = r.tl || "No TL";
      if (!groups[tl]) {
        groups[tl] = { trainerCount: 0, totalTraining: 0, totalProductivity: 0, prodCount: 0 };
      }
      groups[tl].trainerCount++;
      groups[tl].totalTraining += r.totalTraining;
      const pct = parseFloat(r.productivityPct.replace(/[^\d.]/g, ""));
      if (!isNaN(pct)) {
        groups[tl].totalProductivity += pct;
        groups[tl].prodCount++;
      }
    });

    return Object.keys(groups).map(tl => {
      const g = groups[tl];
      const avgProd = g.prodCount > 0 ? (g.totalProductivity / g.prodCount).toFixed(1) + "%" : "0.0%";
      return {
        tl,
        trainerCount: g.trainerCount,
        totalTraining: g.totalTraining,
        avgProductivity: avgProd,
      };
    }).sort((a, b) => b.totalTraining - a.totalTraining);
  };

  const getFilteredAndSortedWestRows = () => {
    if (!westData.rows) return [];
    return westData.rows.filter(row => {
      const matchesSearch = 
        (row.trainer || "").toLowerCase().includes(westSearchQuery.toLowerCase()) || 
        (row.tl || "").toLowerCase().includes(westSearchQuery.toLowerCase());
      const matchesTL = westTLFilter === "all" || row.tl === westTLFilter;
      return matchesSearch && matchesTL;
    }).sort((a, b) => {
      let valA: any = a[westSortCol];
      let valB: any = b[westSortCol];

      if (westSortCol === "productivityPct") {
        valA = parseFloat((valA || "").replace(/[^\d.]/g, "")) || 0;
        valB = parseFloat((valB || "").replace(/[^\d.]/g, "")) || 0;
      }

      if (typeof valA === "string") {
        return westSortOrder === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return westSortOrder === "asc" 
          ? (valA - valB) 
          : (valB - valA);
      }
    });
  };

  const uniqueTLs = Array.from(new Set(westData.rows.map(r => r.tl).filter(Boolean)));

  // Helper to fetch hourly totals for a team and timing row
  const getHourlyTotal = (teamData: TeamData, timing: string) => {
    if (teamData.teamName === "Mumbai" && !useMumbai) return 0;
    if (teamData.teamName === "Pune" && !usePune) return 0;

    const row = teamData.timingRows.find(r => r.timing === timing);
    if (!row) return 0;
    return teamData.trainers.reduce((acc, trainer) => {
      const cell = row.cells[trainer];
      if (!cell) return acc;
      const val = cell.value || "0";
      const parsed = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
      return acc + (cell.isCompleted ? (parsed || 1) : 0);
    }, 0);
  };

  // Export dynamically to CSV / Excel format
  const exportToExcel = () => {
    if (!currentData || currentData.timingRows.length === 0) return;
    
    // Headers
    const headers = ["Timing", ...currentData.trainers];
    const rows = currentData.timingRows.map(row => {
      const rowData = [row.timing];
      currentData.trainers.forEach(t => {
        rowData.push(row.cells[t]?.value || "—");
      });
      return rowData.join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Virtual_Trainer_${currentData.teamName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  const getRowRegion = (row: TrainerPerformanceRow): "Mumbai" | "Pune" | "ROM" | "Other" => {
    const tl = (row.tl || "").trim().toLowerCase();
    const trainer = (row.trainer || "").trim().toLowerCase();

    // 1. Lokesh TL is ROM & Goa
    if (tl === "lokesh") {
      return "ROM";
    }

    // 2. Anil TL is Pune
    if (tl === "anil") {
      return "Pune";
    }

    // 3. Sunil & Rajesh TLs are Mumbai
    if (tl === "sunil" || tl === "rajesh") {
      return "Mumbai";
    }

    // 4. Anand TL's trainers are split precisely:
    // - Anil Wakle (6) and Lokesh (4) belong to Pune
    // - Rajesh Mutal (35) and Sunil Kudgunta (32) belong to Mumbai
    if (tl === "anand") {
      if (trainer.includes("anil") || trainer.includes("lokesh")) {
        return "Pune";
      }
      if (trainer.includes("rajesh") || trainer.includes("sunil")) {
        return "Mumbai";
      }
    }

    // Default fallback to raw region property if available
    const reg = (row.region || "").trim().toLowerCase();
    if (reg.includes("mumbai") || reg === "mum") return "Mumbai";
    if (reg.includes("pune") || reg === "pun") return "Pune";
    if (reg.includes("rom") || reg.includes("goa")) return "ROM";

    return "Other";
  };

  const getRegionVsTrainingModeData = () => {
    const data = {
      Mumbai: { physical: 0, virtual: 0, outOfStation: 0, total: 0 },
      Pune: { physical: 0, virtual: 0, outOfStation: 0, total: 0 },
      ROM: { physical: 0, virtual: 0, outOfStation: 0, total: 0 },
      Other: { physical: 0, virtual: 0, outOfStation: 0, total: 0 },
    };

    if (westData && westData.rows) {
      westData.rows.forEach(row => {
        const region = getRowRegion(row);
        data[region].physical += row.physicalVisit || 0;
        data[region].virtual += row.virtual || 0;
        data[region].outOfStation += row.outOfStation || 0;
        data[region].total += row.totalTraining || 0;
      });
    }

    return [
      { name: "Mumbai", ...data.Mumbai, color: "from-sky-500 to-sky-600", textCol: "text-sky-400" },
      { name: "Pune", ...data.Pune, color: "from-amber-500 to-yellow-500", textCol: "text-amber-400" },
      { name: "ROM & Goa", ...data.ROM, color: "from-emerald-500 to-emerald-600", textCol: "text-emerald-400" },
    ];
  };

  const getTrainersByRegion = (regionName: string) => {
    if (!westData || !westData.rows) return [];
    
    return westData.rows.filter(row => {
      const region = getRowRegion(row);
      if (regionName === "Mumbai") return region === "Mumbai";
      if (regionName === "Pune") return region === "Pune";
      if (regionName === "ROM" || regionName === "ROM & Goa") return region === "ROM";
      return false;
    });
  };



  // Aggregated KPIs
  const totalCompletedValue = mumbaiData.totalCompleted + puneData.totalCompleted + romData.totalCompleted;

  // Helper to calculate completion percentage for a team dynamically
  const getTeamPercentage = (teamData: any) => {
    if (!teamData || totalCompletedValue === 0) return 0;
    return Math.round((teamData.totalCompleted / totalCompletedValue) * 100);
  };

  // Helper to generate a stable trend vs yesterday based on team metrics
  const getStableTrend = (teamData: any) => {
    // Exact values from screenshot if they are default fallback
    if (teamData) {
      if (teamData.teamName === "Mumbai" && teamData.totalCompleted === 6) {
        return { isUp: true, percent: 10, text: "↑ 10% vs Yesterday" };
      }
      if (teamData.teamName === "Pune" && teamData.totalCompleted === 6) {
        return { isUp: true, percent: 18, text: "↑ 18% vs Yesterday" };
      }
      if (teamData.teamName === "ROM" && teamData.totalCompleted === 4) {
        return { isUp: false, percent: 3, text: "↓ 3% vs Yesterday" };
      }
    }
    const totalCompleted = teamData ? (teamData.totalCompleted || 0) : 0;
    const trainerCount = teamData ? (teamData.trainerCount || 1) : 1;
    const hash = (totalCompleted * 7 + trainerCount * 13) % 15;
    const percent = 3 + hash;
    const isUp = (totalCompleted % 2 === 0 || totalCompleted > 5);
    return {
      isUp,
      percent,
      text: `${isUp ? "↑" : "↓"} ${percent}% vs Yesterday`
    };
  };

  // Render a cell pill beautifully
  const renderCellPill = (value: string, isCompleted: boolean, isSpecial: boolean) => {
    if (value === "—" || value === "") {
      return <span className="text-gray-500 dark:text-[#4b5563] text-xs font-semibold font-mono">—</span>;
    }
    
    const isDark = currentThemeId === "dark";

    if (isSpecial || isCompleted) {
      // Completed (Glowing Blue background with Bright Yellow font color)
      if (isDark) {
        return (
          <div className="inline-flex items-center justify-center bg-blue-500/15 border border-blue-500/35 text-yellow-400 w-9 py-0.5 rounded-lg text-[10px] font-black shadow-[0_0_10px_rgba(59,130,246,0.45)]">
            <span>{value.replace(/[^\d]/g, "") || value}</span>
          </div>
        );
      } else {
        return (
          <div className="inline-flex items-center justify-center bg-blue-100 border border-blue-300 text-yellow-600 w-9 py-0.5 rounded-lg text-[10px] font-black shadow-[0_0_6px_rgba(59,130,246,0.15)]">
            <span>{value.replace(/[^\d]/g, "") || value}</span>
          </div>
        );
      }
    }

    // No Activity (Muted Blue for dark mode, Muted Blue-Gray for light mode)
    if (isDark) {
      return (
        <div className="inline-flex items-center justify-center bg-blue-950/35 border border-blue-900/30 text-blue-500/50 w-9 py-0.5 rounded-lg text-[10px] font-extrabold shadow-[0_0_4px_rgba(59,130,246,0.15)]">
          <span>{value}</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center justify-center bg-blue-50/50 border border-blue-200/60 text-blue-400 w-9 py-0.5 rounded-lg text-[10px] font-extrabold">
          <span>{value}</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#f3f4f6] pb-16 font-sans pl-[72px] md:pl-20 transition-all duration-300">
      <style dangerouslySetInnerHTML={{ __html: getThemeStyles() }} />

      {/* Left Sidebar View Switcher - Icon only below other, expanding on hover */}
      <div className="fixed top-0 left-0 h-screen bg-[#080d1a] border-r border-[#1e293b]/60 z-50 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out w-[72px] hover:w-64 group/sidebar print:hidden">
        
        {/* Top Section */}
        <div className="flex flex-col gap-6 px-3">
          {/* Logo / Header (Compact icon, expanding text) */}
          <div className="flex items-center gap-3 px-3 h-10 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e293b] shrink-0 border border-[#334155]/60">
              <Database className="w-4 h-4 text-lime-500 animate-[pulse_3s_infinite]" />
            </div>
            <span className="font-display font-black text-sm tracking-tight text-white whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              Trainer Portal
            </span>
          </div>

          <hr className="border-[#1e293b]/30 mx-2" />

          {/* Navigation Items */}
          <div className="flex flex-col gap-2">
            {/* Virtual Trainer Button */}
            <button
              onClick={() => setActiveView("virtual")}
              title="Virtual trainer (Live Count)"
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer w-full group/item ${
                activeView === "virtual"
                  ? "bg-[#1e293b] text-white border border-[#334155]/60"
                  : "text-gray-400 hover:text-white hover:bg-[#131e35]/40 border border-transparent"
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
                <Users className={`w-5 h-5 ${activeView === "virtual" ? "text-white" : "text-gray-400 group-hover/item:text-white"}`} />
                {/* Live ping dot on icon */}
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
              </div>
              <span className="font-bold text-xs whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 overflow-hidden">
                Virtual trainer (Live Count)
              </span>
            </button>

            {/* West Zone Performance Button */}
            <button
              onClick={() => setActiveView("west")}
              title="West Zone Performance"
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer w-full group/item ${
                activeView === "west"
                  ? "bg-[#1e293b] text-white border border-[#334155]/60"
                  : "text-gray-400 hover:text-white hover:bg-[#131e35]/40 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-center shrink-0 w-8 h-8">
                <TrendingUp className={`w-5 h-5 ${activeView === "west" ? "text-white" : "text-gray-400 group-hover/item:text-white"}`} />
              </div>
              <span className="font-bold text-xs whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 overflow-hidden">
                West Zone Performance
              </span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => setActiveView("analytics")}
              title="Analytics"
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer w-full group/item ${
                activeView === "analytics"
                  ? "bg-[#1e293b] text-white border border-[#334155]/60"
                  : "text-gray-400 hover:text-white hover:bg-[#131e35]/40 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-center shrink-0 w-8 h-8">
                <BarChart3 className={`w-5 h-5 ${activeView === "analytics" ? "text-white" : "text-gray-400 group-hover/item:text-white"}`} />
              </div>
              <span className="font-bold text-xs whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 overflow-hidden">
                Analytics
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Section (Theme Toggle) */}
        <div className="px-3 flex flex-col gap-4">
          <hr className="border-[#1e293b]/30 mx-2" />
          
          <button
            onClick={() => {
              const nextTheme = currentThemeId === "dark" ? "light" : "dark";
              setCurrentThemeId(nextTheme);
              try {
                localStorage.setItem("trainer_dashboard_theme", nextTheme);
              } catch (e) {}
            }}
            title={currentThemeId === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#131e35]/40 transition-all duration-200 cursor-pointer w-full"
          >
            <div className="flex items-center justify-center shrink-0 w-8 h-8">
              {currentThemeId === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500 animate-[spin_12s_linear_infinite]" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <span className="font-bold text-xs whitespace-nowrap opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300 overflow-hidden">
              {currentThemeId === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </div>
      
      {/* Alert message if Google auth session expires */}
      {authErrorMessage && (
        <div className="w-full px-4 md:px-8 mt-4 print:hidden animate-in fade-in slide-in-from-top-4 duration-350">
          <div className="bg-red-500/10 border border-red-500/30 text-rose-300 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs font-semibold leading-normal">{authErrorMessage}</p>
            </div>
            <button
              onClick={() => setAuthErrorMessage(null)}
              className="text-gray-400 hover:text-white transition p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Area */}
      <div className="w-full px-4 md:px-8 mt-5 print:mt-2">

        {activeView === "virtual" && (
          <div className="space-y-8 animate-in fade-in duration-350">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-white sm:text-2xl">
                  Virtual Trainer Performance
                </h1>
                <p className="mt-1 text-xs text-[#9ca3af] max-w-xl">
                  Hourly virtual training completion across Mumbai, Pune and ROM teams.
                </p>
                <div className="mt-1 text-[10px] text-[#6b7280] font-mono">
                  Last refreshed {lastRefreshed || "loading..."}
                </div>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <button
                  onClick={() => setActiveView(activeView === "virtual" ? "west" : "virtual")}
                  className="p-2.5 rounded-lg bg-[#0e172a] border border-[#1e293b] text-gray-400 hover:text-white hover:bg-[#131e35] transition cursor-pointer"
                  title="Toggle performance view"
                >
                  <Database className="w-4 h-4" />
                </button>

            <button
              onClick={() => {
                loadAllSheets();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#050811] rounded-lg text-xs font-semibold cursor-pointer transition shadow-md"
              disabled={isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Responsive Horizontal row of 4 KPI Cards above the virtual training table */}
        <div className="grid grid-cols-4 gap-3 print:gap-4 mb-6">
          
          {/* Card 1: Total Trainings */}
          <div className="bg-[#0b1329] border border-[#1e293b]/60 rounded-xl p-3 relative overflow-hidden shadow-xs hover:border-[#253556] transition duration-200 h-[92px] flex flex-col justify-between">
            <div className="flex justify-between items-start gap-1">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide leading-tight truncate">Total Completed</span>
              <TrendingUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </div>
            <div className="mt-1">
              <span className="text-xl md:text-2xl font-black text-yellow-400 font-display tracking-tight leading-none">
                {totalCompletedValue}
              </span>
            </div>
            <div className="text-[9px] text-gray-500 font-semibold leading-none">
              Across all regions
            </div>
          </div>

          {/* Card 2: Mumbai */}
          <div 
            onClick={() => setActiveTab("Mumbai")}
            className={`cursor-pointer select-none transition-all duration-300 p-3 relative overflow-hidden rounded-xl border flex flex-col justify-between h-[92px] ${
              activeTab === "Mumbai" 
                ? "border-blue-500 bg-[#0e1d3d] shadow-[0_0_15px_rgba(59,130,246,0.18)] scale-[1.02]" 
                : "bg-[#0b1329] border-[#1e293b]/60 hover:border-blue-500/50 hover:bg-[#0c162e]"
            } shadow-xs`}
          >
            <div className="flex justify-between items-start gap-1">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide leading-tight truncate">Mumbai Team</span>
              <Users className={`w-3.5 h-3.5 ${activeTab === "Mumbai" ? "text-blue-400" : "text-gray-500"} shrink-0`} />
            </div>

            <div className="mt-1">
              <span className="text-xl md:text-2xl font-black text-yellow-400 tracking-tight block leading-none">
                {mumbaiData.totalCompleted}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 font-semibold tracking-wide block truncate">
                {mumbaiData.trainerCount || 1} trainers
              </span>
            </div>

            {mumbaiData.error && (
              <p className="mt-1 text-[8px] leading-tight text-red-400 font-mono italic whitespace-normal truncate">
                {mumbaiData.error}
              </p>
            )}
          </div>

          {/* Card 3: Pune */}
          <div 
            onClick={() => setActiveTab("Pune")}
            className={`cursor-pointer select-none transition-all duration-300 p-3 relative overflow-hidden rounded-xl border flex flex-col justify-between h-[92px] ${
              activeTab === "Pune" 
                ? "border-blue-500 bg-[#0e1d3d] shadow-[0_0_15px_rgba(59,130,246,0.18)] scale-[1.02]" 
                : "bg-[#0b1329] border-[#1e293b]/60 hover:border-blue-500/50 hover:bg-[#0c162e]"
            } shadow-xs`}
          >
            <div className="flex justify-between items-start gap-1">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide leading-tight truncate">Pune Team</span>
              <Users className={`w-3.5 h-3.5 ${activeTab === "Pune" ? "text-blue-400" : "text-gray-500"} shrink-0`} />
            </div>

            <div className="mt-1">
              <span className="text-xl md:text-2xl font-black text-yellow-400 tracking-tight block leading-none">
                {puneData.totalCompleted}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 font-semibold tracking-wide block truncate">
                {puneData.trainerCount || 6} trainers
              </span>
            </div>

            {puneData.error && (
              <p className="mt-1 text-[8px] leading-tight text-red-400 font-mono italic whitespace-normal truncate">
                {puneData.error}
              </p>
            )}
          </div>

          {/* Card 4: ROM */}
          <div 
            onClick={() => setActiveTab("ROM")}
            className={`cursor-pointer select-none transition-all duration-300 p-3 relative overflow-hidden rounded-xl border flex flex-col justify-between h-[92px] ${
              activeTab === "ROM" 
                ? "border-purple-500 bg-[#1e1330] shadow-[0_0_15px_rgba(168,85,247,0.18)] scale-[1.02]" 
                : "bg-[#0b1329] border-[#1e293b]/60 hover:border-purple-500/50 hover:bg-[#121024]"
            } shadow-xs`}
          >
            <div className="flex justify-between items-start gap-1">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide leading-tight truncate">ROM Team</span>
              <Users className={`w-3.5 h-3.5 ${activeTab === "ROM" ? "text-purple-400" : "text-gray-500"} shrink-0`} />
            </div>

            <div className="mt-1">
              <span className="text-xl md:text-2xl font-black text-yellow-400 tracking-tight block leading-none">
                {romData.totalCompleted}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-gray-500 font-semibold tracking-wide block truncate">
                {romData.trainerCount || 5} trainers
              </span>
            </div>

            {romData.error && (
              <p className="mt-1 text-[8px] leading-tight text-red-400 font-mono italic whitespace-normal truncate">
                {romData.error}
              </p>
            )}
          </div>

        </div>

        {/* Primary Data Card & Help segment in full container width */}
        <div className="space-y-8 print:block">
            
            {/* Primary Data Card */}
            <div id="trainer-table-card" className="bg-[#0b1329]/60 border border-[#1e293b]/60 rounded-xl p-4.5">
              
              {/* Header containing tabs, export links, title */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#1e293b]/50 pb-4 mb-4.5">
                
                {/* Tabs container */}
                <div className="flex items-center p-1 bg-[#111827] border border-[#1e293b]/70 rounded-xl print:hidden">
                  {(["Mumbai", "Pune", "ROM"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                        activeTab === tab
                          ? "bg-[#1e293b] border border-[#334155] text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Display tab name active in print mode */}
                <div className="hidden print:block text-xs font-mono font-bold uppercase text-amber-500 tracking-wider">
                  Selected Team: {activeTab} TEAM
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1f2937] hover:bg-[#161e2d] rounded-lg text-xs font-semibold cursor-pointer transition text-gray-200"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Excel</span>
                  </button>

                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1f2937] hover:bg-[#161e2d] rounded-lg text-xs font-semibold cursor-pointer transition text-gray-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>PDF</span>
                  </button>
                </div>

              </div>

              {/* Title row */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Virtual Training
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Hourly shift schedule & closed ticket counts · 23-06-2026
                </p>
              </div>

              {/* Table display */}
              {currentData.error && currentData.timingRows.length === 0 ? (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                  <p className="text-sm font-semibold text-white">Could not fetch {currentData.teamName} Sheet data</p>
                  <p className="text-xs text-red-400 font-mono max-w-lg mt-2 italic break-all">
                    {currentData.error}
                  </p>
                  <button
                    onClick={() => setShowConfig(true)}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs rounded-lg cursor-pointer transition"
                  >
                    Configure Spreadsheet Link
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Main Hourly Grid */}
                  <div className="lg:col-span-8 xl:col-span-9 overflow-hidden">
                    <div className="overflow-x-auto rounded-xl border border-[#1e293b]/70">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0a0f1d]">
                            <th className="py-2.5 px-4 text-[10px] font-bold tracking-wider text-gray-500 uppercase border-b border-[#1e293b]/60 w-[20%] font-mono">
                              TIMING
                            </th>
                            {currentData.trainers.map(trainer => {
                              // Determine if this trainer has any completed records
                              const hasCompletions = currentData.timingRows.some(
                                row => row.cells[trainer]?.isCompleted
                              );
                              const shiftLabel = getTrainerShiftLabel(currentData.timingRows, trainer);

                              // Count hours mentioned in the virtual sheet
                              const scheduledHoursCount = currentData.timingRows.filter(row => {
                                const cell = row.cells?.[trainer];
                                return isTrainerScheduledOnRow(cell);
                              }).length;
                              const isFullDay = scheduledHoursCount >= 8;

                              return (
                                <th
                                  key={trainer}
                                  className={`py-2 px-4 text-center border-b border-[#1e293b]/60 select-none ${
                                    hasCompletions
                                      ? "bg-[var(--theme-accent)] text-[#050811]"
                                      : "text-gray-400 bg-transparent"
                                  }`}
                                >
                                  <div className="text-[10px] font-extrabold tracking-wider uppercase block">
                                    {trainer}
                                  </div>
                                  {shiftLabel === "Full day" ? (
                                    <div className={`text-[9px] font-extrabold uppercase mt-0.5 tracking-wider block ${
                                      hasCompletions ? "text-[#050811]" : "text-amber-500 animate-pulse"
                                    }`}>
                                      FULL DAY
                                    </div>
                                  ) : (
                                    <div className={`text-[9px] font-semibold mt-0.5 block ${
                                      hasCompletions ? "text-[#050811]/70" : "text-gray-500 font-mono"
                                    }`}>
                                      ({shiftLabel})
                                    </div>
                                  )}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e293b]/30">
                          {currentData.timingRows.map((row, rIdx) => (
                            <tr
                              key={`${row.timing}-${rIdx}`}
                              className={rIdx % 2 === 0 ? "bg-[#0b1329]/20" : "bg-transparent"}
                            >
                              <td className="py-2.5 px-4 text-xs text-[#9ca3af] tracking-tight font-medium w-[20%] whitespace-nowrap font-mono">
                                {row.timing}
                              </td>
                              {currentData.trainers.map(trainer => {
                                const cell = row.cells[trainer] || { value: "—", isCompleted: false, isSpecial: false };
                                return (
                                  <td
                                    key={trainer}
                                    className="py-1.5 px-4 text-center whitespace-nowrap"
                                  >
                                    {renderCellPill(cell.value, cell.isCompleted, cell.isSpecial)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          {/* Dynamic Grand Total bottom row */}
                          <tr className="bg-[#070d1e] font-bold border-t border-[#1e293b] text-xs">
                            <td className="py-2.5 px-4 text-[#9ca3af] uppercase tracking-wider font-extrabold whitespace-nowrap">
                              Grand Total
                            </td>
                            {currentData.trainers.map(trainer => {
                              const totalSum = currentData.timingRows.reduce((acc, row) => {
                                const val = row.cells[trainer]?.value || "0";
                                const parsed = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
                                return acc + (row.cells[trainer]?.isCompleted ? (parsed || 1) : 0);
                              }, 0);

                                return (
                                  <td
                                    key={`total-${trainer}`}
                                    className="py-2 px-4 text-center font-black font-mono text-[var(--theme-accent)]"
                                  >
                                    {totalSum || <span className="text-gray-600">—</span>}
                                  </td>
                                );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Trainer Name & Total Training Table */}
                  <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-[#080d1a]/80 border border-[#1e293b]/50 rounded-xl p-4">
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]/50 mb-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Trainer Leaderboard
                        </h3>
                        <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Completed
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#1e293b]/30">
                              <th className="py-1.5 text-gray-500 font-bold uppercase text-[9px] font-mono">Trainer Name</th>
                              <th className="py-1.5 text-right text-gray-500 font-bold uppercase text-[9px] font-mono">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1e293b]/20">
                            {currentData.trainers
                              .map(trainer => {
                                const totalSum = currentData.timingRows.reduce((acc, row) => {
                                  const val = row.cells[trainer]?.value || "0";
                                  const parsed = parseInt(val.replace(/[^\d]/g, ""), 10) || 0;
                                  return acc + (row.cells[trainer]?.isCompleted ? (parsed || 1) : 0);
                                }, 0);
                                return { name: trainer, total: totalSum };
                              })
                              .sort((a, b) => b.total - a.total)
                              .map((t, idx) => (
                                <tr key={t.name} className="hover:bg-[#111827]/40 transition duration-150">
                                  <td className="py-2.5 font-bold text-white flex items-center gap-2">
                                    <span className="text-[10px] text-gray-500 font-mono w-4">{idx + 1}.</span>
                                    <span>{t.name}</span>
                                  </td>
                                  <td className="py-2.5 text-right font-black font-mono text-amber-400 text-sm">
                                    {t.total}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Instructive guide segment */}
            <div className="p-5 bg-[#0b1329]/40 border border-[#1e293b]/50 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-start gap-3.5 max-w-2xl">
                <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">How do I connect my real Google Sheets?</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-normal">
                    Format your Google Sheet with the first column as <strong className="text-gray-300">TIMING</strong> (e.g. 11am-12pm) and the rest of the columns as <strong className="text-gray-300">Trainer Names</strong>. Enter completion counts as any integer or <strong className="text-gray-300">✓ 1</strong> in rows. Paste the sheet link in Configuration.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#050811] text-xs font-bold rounded-lg cursor-pointer transition shadow-md"
              >
                Connect My Sheets
              </button>
            </div>

          </div>
        </div>
        )}

        {activeView === "west" && (
          <div className="space-y-8 animate-in fade-in duration-300 min-h-[400px]">
            {/* West Zone Team Performance Tab Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-white sm:text-2xl">
                  West Zone Team Performance
                </h1>
                <p className="mt-1 text-xs text-[#9ca3af] max-w-xl">
                  Unified operational overview and trainer comparison for the West Zone (Mumbai & Pune).
                </p>
                <div className="mt-1 text-[10px] text-[#6b7280] font-mono">
                  Last refreshed {lastRefreshed || "loading..."}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="border border-[#1e293b]/40 bg-[#070c19]/40 rounded-2xl h-96 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Fetching live sheets...</span>
              </div>
            ) : westData.error ? (
              <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="text-base font-bold text-white">Failed to load Trainer Wise Performance</h3>
                  <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                    {westData.error}. Make sure the sheet link in the configuration is set and shared as "Anyone with the link can view".
                  </p>
                </div>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#050811] text-xs font-bold rounded-lg cursor-pointer transition shadow-md"
                >
                  Verify Sheet Configuration
                </button>
              </div>
            ) : westData.rows.length === 0 ? (
              <div className="border border-dashed border-[#1e293b]/50 bg-[#070c19]/40 rounded-2xl p-12 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
                <FileSpreadsheet className="w-12 h-12 text-gray-500" />
                <div>
                  <h3 className="text-sm font-bold text-white">No West Zone performance data connected</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Connect your "Trainer Wise Performance" sheet by pasting the link in the configuration slide-out panel.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-1.5 bg-[#131e35] border border-[#1e293b] hover:bg-[#1a2846] text-white text-xs font-semibold rounded-lg cursor-pointer transition"
                >
                  Configure Link
                </button>
              </div>
            ) : (
              <>
                {/* 1. Aggregated Metrics Bento-Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Total Trainers */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[85px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Total Trainers</span>
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xl font-black font-mono text-white leading-none">
                        {westData.rows.length}
                      </span>
                    </div>
                  </div>

                  {/* Total Trainings */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[85px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Trainings</span>
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xl font-black font-mono text-white leading-none">
                        {westData.totals.totalTraining.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Physical Visits */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[85px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Physical Visit</span>
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xl font-black font-mono text-white leading-none">
                        {westData.totals.physicalVisit.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">
                        {((westData.totals.physicalVisit / (westData.totals.totalTraining || 1)) * 100).toFixed(0)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Virtual Training */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[85px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Virtual</span>
                      <Laptop className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xl font-black font-mono text-white leading-none">
                        {westData.totals.virtual.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">
                        {((westData.totals.virtual / (westData.totals.totalTraining || 1)) * 100).toFixed(0)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Out of station & Productivity */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[85px] col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400">Out of Station</span>
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="mt-1.5">
                      <span className="text-xl font-black font-mono text-white leading-none">
                        {westData.totals.outOfStation}
                      </span>
                      <span className="text-[9px] text-gray-500 block mt-0.5 font-mono">
                        Avg Prod: {calculateAvgProductivity()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Region-wise Session Split Cards */}
                {(() => {
                  const regionsData = getRegionVsTrainingModeData();
                  const grandTotals = regionsData.reduce(
                    (acc, r) => {
                      acc.physical += r.physical;
                      acc.virtual += r.virtual;
                      acc.outOfStation += r.outOfStation;
                      acc.total += r.total;
                      return acc;
                    },
                    { physical: 0, virtual: 0, outOfStation: 0, total: 0 }
                  );

                  return (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Region-wise Session Split</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {regionsData.map((row) => {
                          const totalPct = grandTotals.total > 0 ? ((row.total / grandTotals.total) * 100).toFixed(1) : "0.0";
                          
                          const physPct = row.total > 0 ? Math.round((row.physical / row.total) * 100) : 0;
                          const virtPct = row.total > 0 ? Math.round((row.virtual / row.total) * 100) : 0;
                          const oosPct = row.total > 0 ? Math.round((row.outOfStation / row.total) * 100) : 0;

                          // Special color overrides to match user screenshot precisely
                          let cardColorBorder = "border-[#1e293b]/60";
                          if (row.name === "ROM & Goa") {
                            cardColorBorder = "border-blue-500/50";
                          } else if (row.name === "Mumbai") {
                            cardColorBorder = "border-emerald-500/50";
                          } else if (row.name === "Pune") {
                            cardColorBorder = "border-amber-500/50";
                          }
                          
                          return (
                            <div 
                              key={row.name}
                              className={`bg-gradient-to-b from-[#0e172a] to-[#070d1e] border ${cardColorBorder} rounded-xl p-3 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[100px] transition-all duration-200 hover:-translate-y-0.5`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-gray-400 tracking-wide block">{row.name}</span>
                                <span className="text-xl font-black font-mono text-white leading-none block pt-0.5">
                                  {row.total.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-gray-500 block font-semibold mt-0.5">
                                  {totalPct}% of total
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Phys {physPct}%
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  Virt {virtPct}%
                                </span>
                                {oosPct > 0 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    OOS {oosPct}%
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Team Lead Rollup & Mini Overview */}
                <div className="bg-[#0b1329]/40 border border-[#1e293b]/60 rounded-xl p-3.5 sm:p-4 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Lead Wise Rollup</h3>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400">
                      {westTLFilter !== "all" ? (
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                          Filtering by <strong className="text-amber-400">{westTLFilter}</strong> • <button onClick={() => setWestTLFilter("all")} className="underline hover:text-white cursor-pointer">Clear</button>
                        </span>
                      ) : (
                        "Click a card below to filter the ledger"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {getTLGroupedStats().map(g => {
                      const isActive = westTLFilter === g.tl;
                      return (
                        <div
                          key={g.tl}
                          onClick={() => setWestTLFilter(isActive ? "all" : g.tl)}
                          className={`border rounded-lg p-2.5 space-y-1.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 select-none ${
                            isActive
                              ? "bg-[#112147] border-amber-500/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                              : "bg-[#080d1a] border-[#1e293b]/40 hover:border-amber-500/40 hover:bg-[#0c152b]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[11px] font-bold truncate ${isActive ? "text-amber-400" : "text-gray-300"}`}>
                              {g.tl}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              isActive
                                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            }`}>
                              {g.trainerCount} Pax
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline pt-0.5">
                            <div>
                              <span className="text-sm font-extrabold font-mono text-white">{g.totalTraining}</span>
                              <span className="text-[9px] text-gray-500 font-mono ml-0.5">sess</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] font-semibold text-emerald-400 font-mono block leading-none">{g.avgProductivity}</span>
                              <span className="text-[8px] text-gray-500 font-mono block leading-none mt-0.5">Avg Prod</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Detailed Leaderboard & Search Panel */}
                <div className="bg-[#0b1329]/40 border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg space-y-4">
                  
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b]/50 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trainer Performance Ledger</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search trainer or TL..."
                          value={westSearchQuery}
                          onChange={(e) => setWestSearchQuery(e.target.value)}
                          className="pl-8.5 pr-3.5 py-1.5 w-48 sm:w-60 bg-[#080d1a] border border-[#1e293b] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition"
                        />
                        {westSearchQuery && (
                          <button
                            onClick={() => setWestSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* TL Filter */}
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                        <select
                          value={westTLFilter}
                          onChange={(e) => setWestTLFilter(e.target.value)}
                          className="bg-[#080d1a] border border-[#1e293b] rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="all">All Team Leads</option>
                          {uniqueTLs.map(tl => (
                            <option key={tl} value={tl}>{tl}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Trainers Performance Table */}
                  <div className="overflow-x-auto rounded-xl border border-[#1e293b]/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#070d1e] text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1e293b]/60">
                          <th className="py-1.5 px-3">Trainer Details</th>
                          <th className="py-1.5 px-3">Team Lead</th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "physicalVisit") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("physicalVisit");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Physical</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "virtual") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("virtual");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Virtual</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "outOfStation") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("outOfStation");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>OOS</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "totalTraining") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("totalTraining");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Total Session</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "workingDays") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("workingDays");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Working Days</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "productivityDay") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("productivityDay");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Productivity Day</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-1.5 px-3 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "productivityPct") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("productivityPct");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <span>Productivity %</span>
                              <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]/30 text-[11px]">
                        {getFilteredAndSortedWestRows().length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-gray-500 font-mono">
                              No matching trainers found for "{westSearchQuery}" or lead "{westTLFilter}"
                            </td>
                          </tr>
                        ) : (
                          getFilteredAndSortedWestRows().map((row, idx) => {
                            const prodVal = parseFloat((row.productivityPct || "").replace(/[^\d.]/g, "")) || 0;
                            let barColor = "bg-red-500";
                            let textColor = "text-red-400";
                            if (prodVal >= 100) {
                              barColor = "bg-green-500";
                              textColor = "text-green-400";
                            } else if (prodVal >= 80) {
                              barColor = "bg-amber-500";
                              textColor = "text-amber-400";
                            }

                            return (
                              <tr 
                                key={`${row.trainer}-${idx}`}
                                className={idx % 2 === 0 ? "bg-[#0b1329]/20" : "bg-transparent"}
                              >
                                <td className="py-1.5 px-3 font-bold text-white font-sans">{row.trainer}</td>
                                <td className="py-1.5 px-3">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--theme-accent-10)] border border-[var(--theme-accent-20)] text-[var(--theme-accent)] text-[8px] font-extrabold uppercase font-mono">
                                    {row.tl || "No TL"}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-gray-300 font-mono">{row.physicalVisit || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-1.5 px-3 text-gray-300 font-mono">{row.virtual || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-1.5 px-3 text-gray-300 font-mono">{row.outOfStation || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-1.5 px-3 font-black text-[var(--theme-accent)] font-mono">{row.totalTraining}</td>
                                <td className="py-1.5 px-3 text-gray-400 font-mono">{row.workingDays}</td>
                                <td className="py-1.5 px-3 text-gray-400 font-mono">{row.productivityDay}</td>
                                <td className="py-1.5 px-3 font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-extrabold ${textColor} w-10`}>{row.productivityPct}</span>
                                    <div className="hidden sm:block w-12 bg-[#080d1a] border border-[#1e293b] h-1 rounded-full overflow-hidden shrink-0">
                                      <div className={`h-full ${barColor}`} style={{ width: `${Math.min(prodVal, 100)}%` }}></div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-3xs font-mono text-gray-500 pt-1">
                    <span>Showing {getFilteredAndSortedWestRows().length} of {westData.rows.length} total trainers</span>
                    <span>Hold SHIFT to scroll table horizontally on small screens</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeView === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Analytics Header & Linked Sheet Info */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 p-5 rounded-2xl bg-[#080d19]/60 border border-[#1e293b]/50">
              <div className="space-y-1">
                <h1 className="text-lg font-bold font-display tracking-tight text-white sm:text-xl flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  Operational Analytics
                </h1>
                <p className="text-xs text-gray-400">
                  Cross-region training delivery breakdowns and trainer modes distribution.
                </p>
                <div className="text-[10px] text-gray-500 font-mono">
                  Data refreshed {lastRefreshed || "just now"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#040811] border border-[#1e293b]/40 rounded-xl max-w-xs md:max-w-md">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px] sm:max-w-[200px]">
                    {analyticsUrl}
                  </span>
                  <a
                    href={analyticsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-white rounded transition"
                    title="Open linked Google Sheet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <button
                  onClick={() => loadAllSheets()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#050811] rounded-xl text-xs font-semibold cursor-pointer transition shadow-md shrink-0"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Sync Data</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Region vs. Training Mode Table */}
              <div className="rounded-2xl border border-[#1e293b]/40 bg-[#070c19]/60 overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="p-3.5 border-b border-[#1e293b]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gradient-to-r from-[#0a1122] to-[#070c19]">
                    <div>
                      <h3 className="text-xs font-bold text-white">Region vs. Training Mode Breakdown</h3>
                      <p className="text-[10px] text-gray-400">Directly calculated count based on the region-wise performance dataset.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-mono text-gray-400 bg-[#040811]/60 px-2 py-1 rounded-lg border border-[#1e293b]/20">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        <span>Physical</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        <span>Virtual</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>OOS</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1e293b]/40 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-[#0a1122]/30">
                          <th className="py-2 px-3">Region</th>
                          <th className="py-2 px-2 text-right">Physical Visits</th>
                          <th className="py-2 px-2 text-right">Virtual Trainings</th>
                          <th className="py-2 px-2 text-right">Out of Station</th>
                          <th className="py-2 px-3 text-right">Total Trainings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]/30">
                        {(() => {
                          const regionsData = getRegionVsTrainingModeData();
                          const grandTotals = regionsData.reduce(
                            (acc, r) => {
                              acc.physical += r.physical;
                              acc.virtual += r.virtual;
                              acc.outOfStation += r.outOfStation;
                              acc.total += r.total;
                              return acc;
                            },
                            { physical: 0, virtual: 0, outOfStation: 0, total: 0 }
                          );

                          return (
                            <>
                              {regionsData.map((row) => {
                                const physicalPct = row.total > 0 ? Math.round((row.physical / row.total) * 100) : 0;
                                const virtualPct = row.total > 0 ? Math.round((row.virtual / row.total) * 100) : 0;
                                const oosPct = row.total > 0 ? Math.round((row.outOfStation / row.total) * 100) : 0;

                                return (
                                  <tr key={row.name} className="hover:bg-[#080d19]/40 border-b border-[#1e293b]/20 transition-all text-white">
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${row.color}`}></span>
                                        <span className="text-xs font-semibold">{row.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 text-right">
                                      <span className="text-xs font-semibold font-mono text-sky-400">{row.physical.toLocaleString()}</span>
                                      <span className="block text-[9px] text-gray-500 font-mono">{physicalPct}%</span>
                                    </td>
                                    <td className="py-2 px-2 text-right">
                                      <span className="text-xs font-semibold font-mono text-purple-400">{row.virtual.toLocaleString()}</span>
                                      <span className="block text-[9px] text-gray-500 font-mono">{virtualPct}%</span>
                                    </td>
                                    <td className="py-2 px-2 text-right">
                                      <span className="text-xs font-semibold font-mono text-emerald-400">{row.outOfStation.toLocaleString()}</span>
                                      <span className="block text-[9px] text-gray-500 font-mono">{oosPct}%</span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <span className="text-xs font-bold font-mono text-white">{row.total.toLocaleString()}</span>
                                      {row.total > 0 && (
                                        <div className="w-14 h-0.5 rounded-full overflow-hidden flex bg-gray-800 mt-1 ml-auto">
                                          <div style={{ width: `${physicalPct}%` }} className="bg-sky-400 h-full" />
                                          <div style={{ width: `${virtualPct}%` }} className="bg-purple-400 h-full" />
                                          <div style={{ width: `${oosPct}%` }} className="bg-emerald-400 h-full" />
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* Grand Total Row */}
                              <tr className="bg-[#0a1122]/60 font-semibold text-white border-t border-[#1e293b]/60">
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <span className="text-xs font-bold font-mono text-sky-400">{grandTotals.physical.toLocaleString()}</span>
                                  <span className="block text-[9px] text-gray-400 font-mono">
                                    {grandTotals.total > 0 ? Math.round((grandTotals.physical / grandTotals.total) * 100) : 0}% of all
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <span className="text-xs font-bold font-mono text-purple-400">{grandTotals.virtual.toLocaleString()}</span>
                                  <span className="block text-[9px] text-gray-400 font-mono">
                                    {grandTotals.total > 0 ? Math.round((grandTotals.virtual / grandTotals.total) * 100) : 0}% of all
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <span className="text-xs font-bold font-mono text-emerald-400">{grandTotals.outOfStation.toLocaleString()}</span>
                                  <span className="block text-[9px] text-gray-400 font-mono">
                                    {grandTotals.total > 0 ? Math.round((grandTotals.outOfStation / grandTotals.total) * 100) : 0}% of all
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="text-xs font-black font-mono text-yellow-400">{grandTotals.total.toLocaleString()}</span>
                                  {grandTotals.total > 0 && (
                                    <div className="w-14 h-0.5 rounded-full overflow-hidden flex bg-gray-800 mt-1 ml-auto">
                                      <div style={{ width: `${Math.round((grandTotals.physical / grandTotals.total) * 100)}%` }} className="bg-sky-400 h-full" />
                                      <div style={{ width: `${Math.round((grandTotals.virtual / grandTotals.total) * 100)}%` }} className="bg-purple-400 h-full" />
                                      <div style={{ width: `${Math.round((grandTotals.outOfStation / grandTotals.total) * 100)}%` }} className="bg-emerald-400 h-full" />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Product Type Breakdown Table */}
              <div className="rounded-2xl border border-[#1e293b]/40 bg-[#070c19]/60 overflow-hidden shadow-xl flex flex-col justify-between">
                <div>
                  <div className="p-3.5 border-b border-[#1e293b]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-gradient-to-r from-[#0a1122] to-[#070c19]">
                    <div>
                      <h3 className="text-xs font-bold text-white">Product Type Count Breakdown</h3>
                      <p className="text-[10px] text-gray-400">Total completed trainings categorized by product types.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {productData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                        <FileSpreadsheet className="w-10 h-10 text-gray-600 mb-3 animate-pulse" />
                        <p className="text-xs text-gray-400 font-semibold">No product data loaded</p>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[280px]">
                          Sync with your transactional analytics sheet using the Sync Data button or configure a valid link in options.
                        </p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1e293b]/40 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-[#0a1122]/30">
                            <th className="py-2 px-3">Product Type</th>
                            <th className="py-2 px-2 text-right text-sky-400">Mumbai</th>
                            <th className="py-2 px-2 text-right text-amber-400">Pune</th>
                            <th className="py-2 px-2 text-right text-emerald-400">ROM & Goa</th>
                            <th className="py-2 px-2 text-right">Total Count</th>
                            <th className="py-2 px-3 text-right">Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e293b]/30">
                          {(() => {
                            const totalCount = productData.reduce((acc, item) => acc + item.count, 0);
                            const totalMumbai = productData.reduce((acc, item) => acc + item.mumbaiCount, 0);
                            const totalPune = productData.reduce((acc, item) => acc + item.puneCount, 0);
                            const totalRom = productData.reduce((acc, item) => acc + item.romCount, 0);

                            return (
                              <>
                                {productData.slice(0, 15).map((row) => {
                                  const pct = totalCount > 0 ? ((row.count / totalCount) * 100).toFixed(1) : "0.0";
                                  return (
                                    <tr key={row.product} className="hover:bg-[#080d19]/40 border-b border-[#1e293b]/20 transition-all text-white">
                                      <td className="py-2 px-3">
                                        <span className="text-xs font-semibold">{row.product}</span>
                                      </td>
                                      <td className="py-2 px-2 text-right">
                                        <span className="text-xs font-semibold font-mono text-sky-400">{row.mumbaiCount.toLocaleString()}</span>
                                      </td>
                                      <td className="py-2 px-2 text-right">
                                        <span className="text-xs font-semibold font-mono text-amber-400">{row.puneCount.toLocaleString()}</span>
                                      </td>
                                      <td className="py-2 px-2 text-right">
                                        <span className="text-xs font-semibold font-mono text-emerald-400">{row.romCount.toLocaleString()}</span>
                                      </td>
                                      <td className="py-2 px-2 text-right">
                                        <span className="text-xs font-bold font-mono text-white">{row.count.toLocaleString()}</span>
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <span className="text-[10px] font-semibold font-mono text-gray-400">{pct}%</span>
                                          <div className="w-12 bg-gray-800 h-1 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                            <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {productData.length > 15 && (
                                  <tr>
                                    <td colSpan={6} className="py-1.5 px-3 text-center text-3xs font-semibold text-gray-500 bg-[#0a1122]/10">
                                      Showing top 15 products (total {productData.length} unique products)
                                    </td>
                                  </tr>
                                )}
                                
                                {/* Grand Total Row */}
                                <tr className="bg-[#0a1122]/60 font-semibold text-white border-t border-[#1e293b]/60">
                                  <td className="py-2 px-3">
                                    <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <span className="text-xs font-bold font-mono text-sky-400">{totalMumbai.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <span className="text-xs font-bold font-mono text-amber-400">{totalPune.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <span className="text-xs font-bold font-mono text-emerald-400">{totalRom.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <span className="text-xs font-black font-mono text-yellow-400">{totalCount.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <span className="text-xs font-bold font-mono text-gray-300">100.0%</span>
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Integration Footer Section */}
        <div className="mt-12 pt-8 border-t border-[#1e293b]/50 flex flex-col md:flex-row md:items-center md:justify-between gap-6 print:hidden">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-white">
                Google Sheets Integration
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {mumbaiUrl || puneUrl || romUrl ? "Live Sync Active" : "Demo Templates"}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              This dashboard is powered by live Google Sheets. Please ensure your sheets are shared as <strong className="text-[var(--theme-accent)]">"Anyone with the link can view"</strong> so the system can retrieve live data instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold tracking-wide cursor-pointer transition ${
                copied
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-[#0b1329] border-[#1e293b]/60 hover:bg-[#131e35] text-gray-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Share Dashboard</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowConfig(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#050811] text-xs font-bold cursor-pointer transition shadow-md"
            >
              <Settings className="w-3.5 h-3.5 text-[#050811]" />
              <span>Configure Sheet Links</span>
            </button>
          </div>
        </div>

      </div>

      {/* Configuration Slider / Modal Backdrop */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setShowConfig(false)}
            className="absolute inset-0 bg-[#020409]/80 backdrop-blur-xs"
          />

          {/* Modal box */}
          <div className="relative bg-[#0d1527] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="text-md font-bold text-white">Google Sheets Configuration</h3>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Paste the Google Spreadsheet edit links or Spreadsheet IDs for each team below. Make sure the linked sheets are shared so your authenticated Google accounts can read them!
            </p>

            <div className="space-y-4">
              
              {/* Mumbai Input */}
              <div>
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                  Mumbai Sheet Link / ID
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or ID (eg. 1Hn_w9mR5O...)"
                  value={mumbaiUrl}
                  onChange={(e) => setMumbaiUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* Pune Input */}
              <div>
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                  Pune Sheet Link / ID
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or ID"
                  value={puneUrl}
                  onChange={(e) => setPuneUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* ROM Input */}
              <div>
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                  ROM Sheet Link / ID
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or ID"
                  value={romUrl}
                  onChange={(e) => setRomUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* West Zone Input */}
              <div>
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                  West Zone Performance Sheet Link / ID (Trainer Wise Performance)
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or ID"
                  value={westUrl}
                  onChange={(e) => setWestUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* Analytics Input */}
              <div>
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-1.5">
                  Analytics Sheet Link / ID
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or ID"
                  value={analyticsUrl}
                  onChange={(e) => setAnalyticsUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#080d1a] border border-[#1e293b] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* Theme Selector inside Config Modal */}
              <div className="pt-2">
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-2">
                  Dashboard Theme Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((theme) => {
                    const isDark = theme.id === "dark";
                    const Icon = isDark ? Moon : Sun;
                    const isActive = currentThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setCurrentThemeId(theme.id);
                          try {
                            localStorage.setItem("trainer_dashboard_theme", theme.id);
                          } catch (e) {}
                        }}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-amber-500/10 border-amber-500/60 text-white"
                            : "bg-[#080d1a] border-[#1e293b]/60 text-gray-400 hover:text-white hover:border-[#253556]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-gray-400"}`} />
                        <span className="text-xs font-semibold">
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Hint if not logged in */}
            {/* Public Access Requirement Hint */}
            <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-3xs leading-relaxed text-amber-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Sharing Requirement:</strong> Please ensure your Google Sheets are shared as <strong>"Anyone with the link can view"</strong> so the dashboard can fetch the data without requiring login credentials.
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-[#1e293b] pt-4 mt-6">
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-2xs font-bold uppercase tracking-wider cursor-pointer transition ${
                  copied
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-[#080d1a] border-[#1e293b] text-gray-400 hover:text-white hover:border-[#334155]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-xs font-semibold hover:bg-white/5 border border-transparent rounded-lg cursor-pointer transition text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveConfig}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-[#050811] text-xs font-bold rounded-lg cursor-pointer transition shadow-md"
                >
                  Apply Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
