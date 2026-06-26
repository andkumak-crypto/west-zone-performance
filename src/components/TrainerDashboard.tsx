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
  Palette
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
  TrainerPerformanceRow
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

  const spannedHours = maxEnd - minStart;

  // "Total nine hours means it is a full day." -> standard 8 or more hours counts as Full day.
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
  
  // Dashboard states
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<"Mumbai" | "Pune" | "ROM">("Pune");
  const [activeView, setActiveView] = useState<"virtual" | "west">("virtual");
  
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
      const urlTheme = urlParams.get("theme");
      if (urlTheme && THEMES.some(t => t.id === urlTheme)) {
        localStorage.setItem("trainer_dashboard_theme", urlTheme);
        return urlTheme;
      }
      return localStorage.getItem("trainer_dashboard_theme") || "midnight";
    } catch (e) {
      return "midnight";
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
      }
      .bg-\\[\\#050811\\] {
        background-color: var(--theme-bg-page) !important;
      }
      .bg-\\[\\#0b1329\\] {
        background-color: var(--theme-bg-card) !important;
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
      .hover\\:border-\\[\\#253556\\]:hover {
        border-color: var(--theme-border-hover) !important;
      }
      .border-\\[\\#ebb305\\] {
        border-color: var(--theme-accent) !important;
      }
      .border-amber-500\\/80 {
        border-color: var(--theme-accent-80) !important;
      }
      .text-\\[\\#ebb305\\] {
        color: var(--theme-accent) !important;
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
  }, [mumbaiUrl, puneUrl, romUrl, westUrl, currentThemeId]);

  const handleShare = () => {
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      if (mumbaiUrl) url.searchParams.set("mumbai", mumbaiUrl);
      if (puneUrl) url.searchParams.set("pune", puneUrl);
      if (romUrl) url.searchParams.set("rom", romUrl);
      if (westUrl) url.searchParams.set("west", westUrl);
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

  // Initialize and load
  useEffect(() => {
    updateRefreshTimestamp();
    loadAllSheets();
  }, [mumbaiUrl, puneUrl, romUrl, westUrl]);

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

    setMumbaiData(loadedMumbai);
    setPuneData(loadedPune);
    setRomData(loadedRom);
    setWestData(loadedWest);
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

  // Aggregated KPIs
  const totalCompletedValue = mumbaiData.totalCompleted + puneData.totalCompleted + romData.totalCompleted;

  // Render a cell pill beautifully
  const renderCellPill = (value: string, isCompleted: boolean, isSpecial: boolean) => {
    if (value === "—" || value === "") {
      return <span className="text-[#4b5563] text-xs font-medium">—</span>;
    }
    
    if (isSpecial) {
      return (
        <div className="inline-flex items-center gap-1 bg-[#f59e0b] text-[#050811] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
          <Check className="w-2.5 h-2.5 stroke-[3px]" />
          <span>{value.replace(/[^\d]/g, "") || "1"}</span>
        </div>
      );
    }

    if (isCompleted) {
      return (
        <div className="inline-flex items-center justify-center bg-[#f3f4f6]/95 text-[#111827] w-9 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
          <span>{value}</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center justify-center bg-[#1e293b]/70 border border-[#334155]/60 text-gray-400 w-9 py-0.5 rounded-full text-[10px] font-semibold">
        <span>{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#f3f4f6] pb-16 font-sans">
      <style dangerouslySetInnerHTML={{ __html: getThemeStyles() }} />
      
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
      <div className="w-full px-4 md:px-8 mt-10 print:mt-2">
        
        {/* Top Control Bar containing View Switcher and Theme Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:hidden">
          
          {/* View Switcher Tabs (Left) */}
          <div className="flex items-center p-1 bg-[#0b1329] border border-[#1e293b]/60 rounded-xl w-fit">
            <button
              onClick={() => setActiveView("virtual")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                activeView === "virtual"
                  ? "bg-[#1e293b] border border-[#334155] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Virtual Trainer Performance</span>
            </button>
            <button
              onClick={() => setActiveView("west")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                activeView === "west"
                  ? "bg-[#1e293b] border border-[#334155] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>West Zone Performance</span>
            </button>
          </div>

          {/* Theme Palette Selector (Right) */}
          <div className="flex items-center gap-3 bg-[#0b1329] border border-[#1e293b]/60 px-3 py-1.5 rounded-xl w-fit">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mr-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Theme Preset:</span>
            </div>
            <div className="flex items-center gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setCurrentThemeId(theme.id);
                    try {
                      localStorage.setItem("trainer_dashboard_theme", theme.id);
                    } catch (e) {}
                  }}
                  className={`w-6 h-6 rounded-full ${theme.bubbleBg} border-2 ${theme.bubbleBorder} cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center relative group`}
                  title={theme.name}
                >
                  {currentThemeId === theme.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  )}
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 bg-gray-950 text-gray-200 text-[10px] font-medium px-2 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

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
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#050811] hover:bg-[#e2e8f0] rounded-lg text-xs font-semibold cursor-pointer transition"
              disabled={isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Layout with 4 KPI Cards stacked vertically on the left side, and table on the right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start print:block">
          
          {/* Left Column: 4 KPI Cards stacked vertically (on table/desktop screens) */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-3.5 print:grid print:grid-cols-4 print:gap-4 print:mb-6">
            
            {/* Card 1: Total Trainings */}
            <div className="bg-[#0b1329] border border-[#1e293b]/60 rounded-xl p-4 relative overflow-hidden shadow-xs hover:border-[#253556] transition duration-200">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 leading-tight">Total Trainings Completed</span>
                <TrendingUp className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-2xl font-bold font-display tracking-tight text-white">
                  {totalCompletedValue}
                </span>
              </div>
            </div>

            {/* Card 2: Mumbai */}
            <div 
              onClick={() => setActiveTab("Mumbai")}
              className={`cursor-pointer select-none transition duration-200 p-4 relative overflow-hidden rounded-xl border ${
                activeTab === "Mumbai" 
                  ? "border-[#ebb305] bg-[#111d3d] shadow-[0_0_12px_rgba(235,179,5,0.1)]" 
                  : "bg-[#0b1329] border-[#1e293b]/60 hover:border-[#253556]"
              } shadow-xs`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 leading-tight">Mumbai Team</span>
                <Users className={`w-3.5 h-3.5 shrink-0 ${activeTab === "Mumbai" ? "text-[#ebb305]" : "text-gray-500"}`} />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-display tracking-tight text-white block">
                  {mumbaiData.totalCompleted}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  {mumbaiData.trainerCount} trainers
                </span>
              </div>
              {mumbaiData.error && (
                <p className="mt-1 text-[9px] leading-tight text-red-400 font-mono italic whitespace-normal truncate-2-lines break-all">
                  {mumbaiData.error}
                </p>
              )}
            </div>

            {/* Card 3: Pune */}
            <div 
              onClick={() => setActiveTab("Pune")}
              className={`cursor-pointer select-none transition duration-200 p-4 relative overflow-hidden rounded-xl border ${
                activeTab === "Pune" 
                  ? "border-[#ebb305] bg-[#111d3d] shadow-[0_0_12px_rgba(235,179,5,0.1)]" 
                  : "bg-[#0b1329] border-[#1e293b]/60 hover:border-[#253556]"
              } shadow-xs`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 leading-tight">Pune Team</span>
                <Users className={`w-3.5 h-3.5 shrink-0 ${activeTab === "Pune" ? "text-[#ebb305]" : "text-gray-500"}`} />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-display tracking-tight text-white block">
                  {puneData.totalCompleted}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  {puneData.trainerCount} trainers
                </span>
              </div>
              {puneData.error && (
                <p className="mt-1 text-[9px] leading-tight text-red-400 font-mono italic whitespace-normal truncate-2-lines break-all">
                  {puneData.error}
                </p>
              )}
            </div>

            {/* Card 4: ROM */}
            <div 
              onClick={() => setActiveTab("ROM")}
              className={`cursor-pointer select-none transition duration-200 p-4 relative overflow-hidden rounded-xl border ${
                activeTab === "ROM" 
                  ? "border-[#ebb305] bg-[#111d3d] shadow-[0_0_12px_rgba(235,179,5,0.1)]" 
                  : "bg-[#0b1329] border-[#1e293b]/60 hover:border-[#253556]"
              } shadow-xs`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-gray-400 leading-tight">ROM Team</span>
                <Users className={`w-3.5 h-3.5 shrink-0 ${activeTab === "ROM" ? "text-[#ebb305]" : "text-gray-500"}`} />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-display tracking-tight text-white block">
                  {romData.totalCompleted}
                </span>
                {romData.error ? (
                  <p className="mt-1 text-[9px] leading-[13px] text-rose-500 font-mono italic break-anywhere">
                    {romData.error}
                  </p>
                ) : (
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    {romData.trainerCount} trainers
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Active Dashboard View Table & Help segment */}
          <div className="md:col-span-9 lg:col-span-10 space-y-8 print:block">
            
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

                          return (
                            <th
                              key={trainer}
                              className={`py-2 px-4 text-center border-b border-[#1e293b]/60 select-none ${
                                hasCompletions
                                  ? "bg-[#ebb305] text-[#050811]"
                                  : "text-gray-400 bg-transparent"
                              }`}
                            >
                              <div className="text-[10px] font-extrabold tracking-wider uppercase block">
                                {trainer}
                              </div>
                              <div className={`text-[9px] font-semibold mt-0.5 block ${
                                hasCompletions ? "text-[#050811]/70" : "text-gray-500 font-mono"
                              }`}>
                                ({shiftLabel})
                              </div>
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
                              className="py-2 px-4 text-center font-black font-mono text-[#ebb305]"
                            >
                              {totalSum || <span className="text-gray-600">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Total Trainers */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold tracking-wider uppercase text-gray-400">Total Trainers</span>
                      <Users className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black font-mono text-white leading-none">
                        {westData.rows.length}
                      </span>
                    </div>
                  </div>

                  {/* Total Trainings */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold tracking-wider uppercase text-gray-400">Trainings</span>
                      <Award className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black font-mono text-white leading-none">
                        {westData.totals.totalTraining.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Physical Visits */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold tracking-wider uppercase text-gray-400">Physical Visit</span>
                      <MapPin className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black font-mono text-white leading-none">
                        {westData.totals.physicalVisit.toLocaleString()}
                      </span>
                      <span className="text-3xs text-gray-500 block mt-0.5 font-mono">
                        {((westData.totals.physicalVisit / (westData.totals.totalTraining || 1)) * 100).toFixed(0)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Virtual Training */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold tracking-wider uppercase text-gray-400">Virtual</span>
                      <Laptop className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black font-mono text-white leading-none">
                        {westData.totals.virtual.toLocaleString()}
                      </span>
                      <span className="text-3xs text-gray-500 block mt-0.5 font-mono">
                        {((westData.totals.virtual / (westData.totals.totalTraining || 1)) * 100).toFixed(0)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Out of station & Productivity */}
                  <div className="bg-gradient-to-b from-[#0e172a] to-[#070d1e] border border-[#1e293b]/60 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px] col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold tracking-wider uppercase text-gray-400">Out of Station</span>
                      <Briefcase className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-2xl font-black font-mono text-white leading-none">
                        {westData.totals.outOfStation}
                      </span>
                      <span className="text-3xs text-gray-500 block mt-0.5 font-mono">
                        Avg Prod: {calculateAvgProductivity()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Team Lead Rollup & Mini Overview */}
                <div className="bg-[#0b1329]/40 border border-[#1e293b]/60 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Lead Wise Rollup</h3>
                    </div>
                    <span className="text-3xs font-mono text-gray-400">
                      {westTLFilter !== "all" ? (
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                          Filtering by <strong className="text-amber-400">{westTLFilter}</strong> • <button onClick={() => setWestTLFilter("all")} className="underline hover:text-white cursor-pointer">Clear</button>
                        </span>
                      ) : (
                        "Click a card below to filter the ledger"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {getTLGroupedStats().map(g => {
                      const isActive = westTLFilter === g.tl;
                      return (
                        <div
                          key={g.tl}
                          onClick={() => setWestTLFilter(isActive ? "all" : g.tl)}
                          className={`border rounded-xl p-3.5 space-y-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 select-none ${
                            isActive
                              ? "bg-[#112147] border-amber-500/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                              : "bg-[#080d1a] border-[#1e293b]/40 hover:border-amber-500/40 hover:bg-[#0c152b]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${isActive ? "text-amber-400" : "text-gray-300"}`}>
                              {g.tl}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isActive
                                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            }`}>
                              {g.trainerCount} Pax
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline pt-1">
                            <div>
                              <span className="text-lg font-extrabold font-mono text-white">{g.totalTraining}</span>
                              <span className="text-[10px] text-gray-500 font-mono ml-1">sessions</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-emerald-400 font-mono block">{g.avgProductivity}</span>
                              <span className="text-[9px] text-gray-500 font-mono block leading-none">Avg Prod</span>
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
                        <tr className="bg-[#070d1e] text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1e293b]/60">
                          <th className="py-3 px-4">Trainer Details</th>
                          <th className="py-3 px-4">Team Lead</th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "physicalVisit") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("physicalVisit");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Physical</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "virtual") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("virtual");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Virtual</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "outOfStation") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("outOfStation");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>OOS</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "totalTraining") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("totalTraining");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Total Session</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "workingDays") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("workingDays");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Working Days</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "productivityDay") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("productivityDay");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Productivity Day</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                          <th 
                            className="py-3 px-4 cursor-pointer hover:bg-white/5 transition"
                            onClick={() => {
                              if (westSortCol === "productivityPct") {
                                setWestSortOrder(prev => prev === "asc" ? "desc" : "asc");
                              } else {
                                setWestSortCol("productivityPct");
                                setWestSortOrder("desc");
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Productivity %</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-500" />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]/30 text-xs">
                        {getFilteredAndSortedWestRows().length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-500 font-mono">
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
                                <td className="py-3 px-4 font-bold text-white font-sans">{row.trainer}</td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-3xs font-extrabold uppercase font-mono">
                                    {row.tl || "No TL"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-300 font-mono">{row.physicalVisit || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-3 px-4 text-gray-300 font-mono">{row.virtual || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-3 px-4 text-gray-300 font-mono">{row.outOfStation || <span className="text-gray-600 font-medium">—</span>}</td>
                                <td className="py-3 px-4 font-black text-[#ebb305] font-mono">{row.totalTraining}</td>
                                <td className="py-3 px-4 text-gray-400 font-mono">{row.workingDays}</td>
                                <td className="py-3 px-4 text-gray-400 font-mono">{row.productivityDay}</td>
                                <td className="py-3 px-4 font-mono">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`font-extrabold ${textColor} w-11`}>{row.productivityPct}</span>
                                    <div className="hidden sm:block w-16 bg-[#080d1a] border border-[#1e293b] h-1.5 rounded-full overflow-hidden shrink-0">
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
              This dashboard is powered by live Google Sheets. Please ensure your sheets are shared as <strong className="text-[#ebb305]">"Anyone with the link can view"</strong> so the system can retrieve live data instantly.
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

              {/* Theme Selector inside Config Modal */}
              <div className="pt-2">
                <label className="block text-2xs font-bold tracking-wider uppercase text-gray-400 mb-2">
                  Dashboard Theme
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentThemeId(theme.id);
                        try {
                          localStorage.setItem("trainer_dashboard_theme", theme.id);
                        } catch (e) {}
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                        currentThemeId === theme.id
                          ? "bg-amber-500/10 border-amber-500/60 text-white"
                          : "bg-[#080d1a] border-[#1e293b]/60 text-gray-400 hover:text-white hover:border-[#253556]"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${theme.bubbleBg} border ${theme.bubbleBorder} flex items-center justify-center`}>
                        {currentThemeId === theme.id && (
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        )}
                      </span>
                      <span className="text-[10px] font-medium text-center leading-tight truncate w-full">
                        {theme.name.replace("Cosmic ", "").replace("Slate ", "").replace("Velvet ", "").replace("Emerald ", "").replace("Midnight ", "")}
                      </span>
                    </button>
                  ))}
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
