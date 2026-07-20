export interface TeamData {
  teamName: string;
  trainers: string[]; // List of unique trainer names
  timingRows: {
    timing: string;
    cells: { [trainerName: string]: { value: string; isCompleted: boolean; isSpecial: boolean; isScheduled?: boolean } };
  }[];
  totalCompleted: number;
  trainerCount: number;
  error?: string;
}

// Extract Spreadsheet ID from Google Sheet URL
export function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9-_]{15,100}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
}

// Fallback high-fidelity mock data featuring ANITYA and FAIJAN as the single columns
export const DEFAULT_PUNE_DATA: TeamData = {
  teamName: "Pune",
  trainers: ["ANITYA", "FAIJAN"],
  trainerCount: 2,
  totalCompleted: 6, // 5 for Anitya + 1 for Faijan
  timingRows: [
    {
      timing: "10am- 11am",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "11am-12pm",
      cells: {
        ANITYA: { value: "1", isCompleted: true, isSpecial: true },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "12pm - 1pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "1pm - 2pm",
      cells: {
        ANITYA: { value: "1", isCompleted: true, isSpecial: true },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "2pm - 3pm",
      cells: {
        ANITYA: { value: "1", isCompleted: true, isSpecial: true },
        FAIJAN: { value: "✓ 1", isCompleted: true, isSpecial: true },
      }
    },
    {
      timing: "3pm - 4pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "4pm - 5pm",
      cells: {
        ANITYA: { value: "1", isCompleted: true, isSpecial: true },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "5pm - 6pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "6pm - 7pm",
      cells: {
        ANITYA: { value: "1", isCompleted: true, isSpecial: true },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "7pm - 8pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "8pm - 9pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "9pm - 10pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    },
    {
      timing: "10pm - 11pm",
      cells: {
        ANITYA: { value: "—", isCompleted: false, isSpecial: false },
        FAIJAN: { value: "—", isCompleted: false, isSpecial: false },
      }
    }
  ]
};

export const DEFAULT_MUMBAI_DATA: TeamData = {
  teamName: "Mumbai",
  trainers: ["YOGESH", "ARFAT", "VAIBHAV"],
  trainerCount: 3,
  totalCompleted: 6,
  timingRows: [
    {
      timing: "11am-12pm",
      cells: {
        YOGESH: { value: "—", isCompleted: false, isSpecial: false },
        ARFAT: { value: "—", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "12pm - 1pm",
      cells: {
        YOGESH: { value: "1", isCompleted: true, isSpecial: false },
        ARFAT: { value: "0", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "1pm - 2pm",
      cells: {
        YOGESH: { value: "1", isCompleted: true, isSpecial: false },
        ARFAT: { value: "0", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "2pm - 3pm",
      cells: {
        YOGESH: { value: "1", isCompleted: true, isSpecial: false },
        ARFAT: { value: "0", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "3pm - 4pm",
      cells: {
        YOGESH: { value: "✓ 1", isCompleted: true, isSpecial: true },
        ARFAT: { value: "0", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "4pm - 5pm",
      cells: {
        YOGESH: { value: "✓ 1", isCompleted: true, isSpecial: true },
        ARFAT: { value: "0", isCompleted: false, isSpecial: false },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "5pm - 6pm",
      cells: {
        YOGESH: { value: "✓ 1", isCompleted: true, isSpecial: true },
        ARFAT: { value: "✓ 1", isCompleted: true, isSpecial: true },
        VAIBHAV: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
  ],
};

export const DEFAULT_ROM_DATA: TeamData = {
  teamName: "ROM",
  trainers: ["SURESH", "MAHESH"],
  trainerCount: 2,
  totalCompleted: 4,
  timingRows: [
    {
      timing: "11am-12pm",
      cells: {
        SURESH: { value: "—", isCompleted: false, isSpecial: false },
        MAHESH: { value: "1", isCompleted: true, isSpecial: false },
      },
    },
    {
      timing: "12pm - 1pm",
      cells: {
        SURESH: { value: "1", isCompleted: true, isSpecial: false },
        MAHESH: { value: "—", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "1pm - 2pm",
      cells: {
        SURESH: { value: "—", isCompleted: false, isSpecial: false },
        MAHESH: { value: "—", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "2pm - 3pm",
      cells: {
        SURESH: { value: "✓ 1", isCompleted: true, isSpecial: true },
        MAHESH: { value: "0", isCompleted: false, isSpecial: false },
      },
    },
    {
      timing: "3pm - 4pm",
      cells: {
        SURESH: { value: "0", isCompleted: false, isSpecial: false },
        MAHESH: { value: "✓ 1", isCompleted: true, isSpecial: true },
      },
    },
  ],
};

// Extract gid parameter from Google Sheet URL
export function extractGid(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[#&?]gid=([0-9]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Highly robust, localized transaction date parsing utility
export function parseTransactionDate(rawDateStr: string | null, rowIndex?: number): Date | null {
  if (!rawDateStr) return null;
  const str = rawDateStr.trim();
  if (!str) return null;

  // 1. Check if it's a numeric Excel/Google Sheets serial date (e.g. "45468" or 45468.5)
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const d = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) return d;
  }

  // Pre-process: replace " at " with " " (case-insensitive)
  const cleanStr = str.replace(/\s+at\s+/gi, " ").trim();

  // Check if it contains letters (month names)
  const hasLetters = /[a-zA-Z]/.test(cleanStr);

  if (hasLetters) {
    // English-style dates (e.g. "July 1, 2026 11:54:11 PM" or "29 Jun 2026")
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const fullMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    
    const strLower = cleanStr.toLowerCase();
    let monthIdx = -1;
    
    for (let i = 0; i < 12; i++) {
      if (strLower.includes(fullMonths[i])) {
        monthIdx = i;
        break;
      }
    }
    if (monthIdx === -1) {
      for (let i = 0; i < 12; i++) {
        if (strLower.includes(months[i])) {
          monthIdx = i;
          break;
        }
      }
    }

    if (monthIdx !== -1) {
      const digits = cleanStr.match(/\d+/g);
      if (digits && digits.length >= 2) {
        let year = 2026;
        const yearMatch = digits.find(d => d.length === 4 || parseInt(d, 10) > 100);
        if (yearMatch) {
          year = parseInt(yearMatch, 10);
        } else if (digits.length >= 3) {
          const lastNum = parseInt(digits[2], 10);
          year = lastNum < 50 ? 2000 + lastNum : 1900 + lastNum;
        }

        // Safer non-year digits extraction to avoid removing days/hours that match the year value
        const yearIdxInDigits = digits.indexOf(yearMatch || String(year));
        const nonYearDigits = digits.filter((_, idx) => idx !== yearIdxInDigits);
        const day = nonYearDigits[0] ? parseInt(nonYearDigits[0], 10) : 1;
        
        let hour = nonYearDigits[1] ? parseInt(nonYearDigits[1], 10) : 0;
        const minute = nonYearDigits[2] ? parseInt(nonYearDigits[2], 10) : 0;
        const second = nonYearDigits[3] ? parseInt(nonYearDigits[3], 10) : 0;

        if (strLower.includes("pm") && hour < 12) {
          hour += 12;
        } else if (strLower.includes("am") && hour === 12) {
          hour = 0;
        }

        const d = new Date(year, monthIdx, day, hour, minute, second);
        if (!isNaN(d.getTime())) return d;
      }
    }

    const parsedMs = Date.parse(cleanStr);
    if (!isNaN(parsedMs)) {
      return new Date(parsedMs);
    }
  } else {
    // Purely numeric dates (e.g. DD/MM/YYYY, YYYY/MM/DD)
    const parts = cleanStr.split(/[-/.\s,:]+/);
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);

      if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
        const isYearFirst = parts[0].length === 4;
        const isYearLast = parts[2].length === 4 || parts[2].length === 2;

        const hour = parts.length > 3 ? parseInt(parts[3], 10) : 0;
        const minute = parts.length > 4 ? parseInt(parts[4], 10) : 0;
        const second = parts.length > 5 ? parseInt(parts[5], 10) : 0;

        const h = isNaN(hour) ? 0 : hour;
        const m = isNaN(minute) ? 0 : minute;
        const s = isNaN(second) ? 0 : second;

        if (isYearFirst) {
          const d = new Date(p0, p1 - 1, p2, h, m, s);
          if (!isNaN(d.getTime())) return d;
        } else if (isYearLast) {
          let year = p2;
          if (parts[2].length === 2) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }

          if (p1 > 12) {
            const d = new Date(year, p0 - 1, p1, h, m, s);
            if (!isNaN(d.getTime())) return d;
          } else if (p0 > 12) {
            const d = new Date(year, p1 - 1, p0, h, m, s);
            if (!isNaN(d.getTime())) return d;
          } else {
            // Both p0 and p1 are <= 12 (ambiguous!)
            // If rowIndex is provided and we are in July (index >= 3386), treat as MM/DD/YYYY (July format)
            if (typeof rowIndex === "number" && rowIndex >= 3386) {
              const d = new Date(year, p0 - 1, p1, h, m, s);
              if (!isNaN(d.getTime())) return d;
            } else {
              // Otherwise, default to DD/MM/YYYY (June format)
              const d = new Date(year, p1 - 1, p0, h, m, s);
              if (!isNaN(d.getTime())) return d;
            }
          }
        }
      }
    }
  }

  return null;
}

// Robust RFC-compliant CSV parser to convert spreadsheet text to string[][]
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        cell += '"';
        i++; // Skip next escaped double quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(cell);
      cell = "";
    } else if ((char === '\n' || char === '\r') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
      row.push(cell);
      lines.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (row.length > 0 || cell !== "") {
    row.push(cell);
    lines.push(row);
  }

  return lines.map(r => r.map(c => c.trim()));
}

// Intelligent generic parser for Google Sheet values
export async function fetchGoogleSheetData(
  spreadsheetIdOrUrl: string,
  accessToken: string | null | undefined,
  teamName: string
): Promise<TeamData> {
  try {
    const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
    if (!spreadsheetId) {
      throw new Error("Invalid Spreadsheet ID or URL provided.");
    }

    const gid = extractGid(spreadsheetIdOrUrl);
    
    // Build direct public CSV export link
    let csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    if (gid) {
      csvUrl += `&gid=${gid}`;
    }

    const valRes = await fetch(csvUrl);

    if (!valRes.ok) {
      if (valRes.status === 404) {
        throw new Error("Spreadsheet not found. Please double-check the URL.");
      }
      throw new Error(`HTTP ${valRes.status}: Unable to export Google Sheet. Please make sure the sheet is shared as "Anyone with the link can view".`);
    }

    const csvText = await valRes.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      throw new Error("Sheet needs a header row and content rows.");
    }

    // Find all header rows, which act as subtable boundaries
    const headerIndices: number[] = [];
    rows.forEach((row, rIdx) => {
      if (!row || row.length === 0) return;
      
      let isHeader = false;
      
      let hasTimingCell = false;
      let hasTrainerCell = false;
      let hasCompletedCell = false;
      
      row.forEach(cell => {
        const val = (cell || "").toLowerCase().trim().replace(/[:\s]+/g, " ");
        if (
          val === "timing" || 
          val.includes("timing") || 
          val === "time" || 
          val === "timings" || 
          val.includes("time slot") || 
          val.includes("hour") || 
          val.includes("shift") || 
          val === "schedule"
        ) {
          hasTimingCell = true;
        }
        if (
          val === "trainer" ||
          val === "trainers" ||
          val === "trainer name" ||
          val === "trainer s name" ||
          val === "trainers name" ||
          val === "coach" ||
          val === "coaches" ||
          val === "name" ||
          val === "tl" ||
          val === "staff" ||
          val === "agent" ||
          val.includes("trainer") ||
          val.includes("coach") ||
          val.includes("staff") ||
          val.includes("name of")
        ) {
          hasTrainerCell = true;
        }
        if (
          val.includes("completed") ||
          val.includes("closed") ||
          val.includes("done") ||
          val.includes("ticket") ||
          val.includes("count") ||
          val.includes("total")
        ) {
          hasCompletedCell = true;
        }
      });
      
      if (hasTimingCell || (hasTrainerCell && hasCompletedCell)) {
        isHeader = true;
      }
      
      if (isHeader) {
        headerIndices.push(rIdx);
      }
    });

    if (headerIndices.length === 0) {
      // Fallback if not found: find first non-empty row or default to 0
      let fallback = rows.findIndex(row => row && row.length > 0);
      if (fallback === -1) {
        fallback = 0;
      }
      headerIndices.push(fallback);
    }

    const globalTrainersSet = new Set<string>();
    const globalTrainersList: string[] = [];
    const addGlobalTrainer = (name: string) => {
      const trimmed = name.trim();
      const upper = trimmed.toUpperCase();
      if (upper && !globalTrainersSet.has(upper)) {
        globalTrainersSet.add(upper);
        globalTrainersList.push(trimmed);
      }
    };

    const getCanonicalTrainerName = (name: string): string => {
      const trimmed = name.trim();
      const upper = trimmed.toUpperCase();
      for (const t of globalTrainersList) {
        if (t.toUpperCase() === upper) {
          return t;
        }
      }
      return trimmed;
    };

    const timingRowsMap = new Map<string, { [trainerName: string]: { value: string; isCompleted: boolean; isSpecial: boolean; isScheduled?: boolean } }>();
    const orderedTimingKeys: string[] = [];

    // Parse subtable blocks sequentially
    for (let i = 0; i < headerIndices.length; i++) {
      const blockStart = headerIndices[i];
      const blockEnd = (i + 1 < headerIndices.length) ? headerIndices[i + 1] : rows.length;
      
      const blockRows = rows.slice(blockStart, blockEnd);
      if (blockRows.length === 0) continue;

      const blockHeader = blockRows[0];
      
      // Determine trainer columns inside this specific block's header
      const trainerNameColIndices: number[] = [];
      blockHeader.forEach((cell, idx) => {
        const norm = (cell || "").toLowerCase().trim().replace(/[:\s]+/g, " ");
        const normClean = norm.replace(/[^a-z0-9]/g, "");
        if (
          norm === "trainer" ||
          norm === "trainers" ||
          norm === "coach" ||
          norm === "coaches" ||
          norm === "name" ||
          norm === "tl" ||
          norm === "agent" ||
          norm === "staff" ||
          norm.includes("trainer") ||
          norm.includes("coach") ||
          norm.includes("staff") ||
          normClean.includes("trainer") ||
          normClean.includes("coach") ||
          normClean.includes("staff") ||
          normClean.includes("name")
        ) {
          trainerNameColIndices.push(idx);
        }
      });

      // Semantic Column Identification fallback
      if (trainerNameColIndices.length === 0) {
        const timingPattern = /\b(am|pm|am\s*-|pm\s*-|\d{1,2}\s*:\s*\d{2})\b/i;
        const numberPattern = /^\d+$/;
        
        for (let colIdx = 1; colIdx < blockHeader.length; colIdx++) {
          let nameLikeCount = 0;
          let rowCountWithData = 0;
          
          for (let r = 1; r < blockRows.length; r++) {
            const row = blockRows[r];
            if (!row || row.length <= colIdx) continue;
            const val = (row[colIdx] || "").trim();
            const normVal = val.toLowerCase();
            
            if (val !== "" && val !== "—" && val !== "-") {
              rowCountWithData++;
              if (
                !numberPattern.test(val) &&
                !timingPattern.test(val) &&
                val.length >= 2 &&
                val.length <= 30 &&
                !normVal.includes("total") &&
                !normVal.includes("timing") &&
                !normVal.includes("completed") &&
                !normVal.includes("ticket") &&
                !normVal.includes("closed") &&
                !normVal.includes("available") &&
                !normVal.includes("schedule")
              ) {
                nameLikeCount++;
              }
            }
          }
          
          if (nameLikeCount >= 2 || (rowCountWithData > 0 && nameLikeCount === rowCountWithData)) {
            trainerNameColIndices.push(colIdx);
          }
        }
      }

      if (trainerNameColIndices.length > 1) {
        // ==========================================
        // LAYOUT 1: MULTI-COLUMN SIDE-BY-SIDE BLOCK LAYOUT (Per block context)
        // ==========================================
        const trainerNamesAtBlock = new Map<number, string>(); // colIndex -> canonical trainer name
        
        trainerNameColIndices.forEach(colIdx => {
          // Find first trainer name featured on this column index within the block scope
          for (let r = 1; r < blockRows.length; r++) {
            const val = (blockRows[r]?.[colIdx] || "").trim();
            const normVal = val.toLowerCase();
            if (
              val && 
              val !== "" && 
              val !== "—" &&
              val !== "-" &&
              !normVal.includes("grand total") && 
              !normVal.includes("total") &&
              !normVal.includes("timing") &&
              !normVal.includes("trainer name") &&
              normVal !== "trainer" &&
              !normVal.includes("ticket assigned") &&
              !normVal.includes("training completed")
            ) {
              addGlobalTrainer(val);
              const canonicalName = getCanonicalTrainerName(val);
              trainerNamesAtBlock.set(colIdx, canonicalName);
              break;
            }
          }
        });

        // Use Timing values in this block
        for (let r = 1; r < blockRows.length; r++) {
          const row = blockRows[r];
          if (!row || row.length === 0) continue;

          const timingVal = (row[0] || "").trim();
          const normTiming = timingVal.toLowerCase();
          if (
            !timingVal || 
            normTiming.includes("grand total") || 
            normTiming.includes("total") ||
            normTiming.includes("timing") ||
            normTiming.includes("trainer name") ||
            normTiming.includes("training completed") ||
            normTiming.includes("available")
          ) {
            continue;
          }

          if (!timingRowsMap.has(timingVal)) {
            timingRowsMap.set(timingVal, {});
            orderedTimingKeys.push(timingVal);
          }

          const cells = timingRowsMap.get(timingVal)!;

          trainerNameColIndices.forEach(colIdx => {
            const trainerName = trainerNamesAtBlock.get(colIdx);
            if (!trainerName) return;

            // Find Training Completed index for this block
            let completedColIdx = -1;
            for (let c = colIdx + 1; c < blockHeader.length; c++) {
              const normHeader = (blockHeader[c] || "").toLowerCase().trim();
              if (normHeader.includes("trainer name") || normHeader === "trainer") {
                break;
              }
              if (normHeader.includes("completed")) {
                completedColIdx = c;
                break;
              }
            }

            if (completedColIdx === -1) {
              const isCompletedHeader2 = blockHeader[colIdx + 2]?.toLowerCase().includes("completed");
              completedColIdx = isCompletedHeader2 ? colIdx + 2 : colIdx + 1;
            }

            const rawCompleted = (row[completedColIdx] || "").trim();
            const trainerNameInCell = (row[colIdx] || "").trim();
            const hasTrainerName = trainerNameInCell !== "" && trainerNameInCell !== "—" && trainerNameInCell.toLowerCase() === trainerName.toLowerCase();
            
            let isCompleted = false;
            let isSpecial = false;
            let isScheduled = hasTrainerName;

            if (rawCompleted !== "" && rawCompleted !== "—") {
              isScheduled = true;
              if (rawCompleted !== "0") {
                isCompleted = true;
              }
              if (rawCompleted.includes("✓") || rawCompleted.startsWith("✓")) {
                isSpecial = true;
              }
            }

            if (!cells[trainerName] || !cells[trainerName].isCompleted || (cells[trainerName].isCompleted && isCompleted)) {
              cells[trainerName] = {
                value: rawCompleted !== "" ? rawCompleted : "—",
                isCompleted,
                isSpecial,
                isScheduled
              };
            }
          });
        }

      } else if (trainerNameColIndices.length === 1) {
        // ==========================================
        // LAYOUT 2: SINGLE-COLUMN FLAT LAYOUT (Per block context)
        // ==========================================
        const trainerColIdx = trainerNameColIndices[0];
        
        let completedColIdx = -1;
        for (let c = 0; c < blockHeader.length; c++) {
          if ((blockHeader[c] || "").toLowerCase().trim().includes("completed")) {
            completedColIdx = c;
            break;
          }
        }
        if (completedColIdx === -1) {
          completedColIdx = trainerColIdx + 1;
        }

        // Gather unique trainer names inside this block
        const blockTrainersSet = new Set<string>();
        for (let r = 1; r < blockRows.length; r++) {
          const row = blockRows[r];
          if (!row) continue;
          const timingVal = (row[0] || "").trim();
          const normTiming = timingVal.toLowerCase();
          if (
            !timingVal || 
            normTiming.includes("grand total") || 
            normTiming.includes("total") ||
            normTiming.includes("timing") ||
            normTiming.includes("trainer name") ||
            normTiming.includes("training completed") ||
            normTiming.includes("available")
          ) {
            continue;
          }

          const val = (row[trainerColIdx] || "").trim();
          const normVal = val.toLowerCase();
          if (
            val && 
            val !== "" && 
            val !== "—" &&
            !normVal.includes("grand total") && 
            !normVal.includes("total") &&
            normVal !== "trainer" &&
            normVal !== "trainer name" &&
            normVal !== "trainer's name" &&
            normVal !== "trainers" &&
            !normVal.includes("completed") &&
            !normVal.includes("ticket")
          ) {
            addGlobalTrainer(val);
            const canonical = getCanonicalTrainerName(val);
            blockTrainersSet.add(canonical);
          }
        }
        const blockTrainersList = Array.from(blockTrainersSet);

        // Build the pivot data
        for (let r = 1; r < blockRows.length; r++) {
          const row = blockRows[r];
          if (!row || row.length === 0) continue;

          const timingVal = (row[0] || "").trim();
          const normTiming = timingVal.toLowerCase();
          if (
            !timingVal || 
            normTiming.includes("grand total") || 
            normTiming.includes("total") ||
            normTiming.includes("timing") ||
            normTiming.includes("trainer name") ||
            normTiming.includes("training completed") ||
            normTiming.includes("available")
          ) {
            continue;
          }

          const rawTrainerName = (row[trainerColIdx] || "").trim();
          if (!rawTrainerName || rawTrainerName === "" || rawTrainerName === "—") continue;
          const trainerName = getCanonicalTrainerName(rawTrainerName);
          if (!blockTrainersList.includes(trainerName)) continue;

          const rawCompleted = (row[completedColIdx] || "").trim();
          
          let isCompleted = false;
          let isSpecial = false;
          let isScheduled = true;

          if (rawCompleted !== "" && rawCompleted !== "—") {
            if (rawCompleted !== "0") {
              isCompleted = true;
            }
            if (rawCompleted.includes("✓") || rawCompleted.startsWith("✓")) {
              isSpecial = true;
            }
          }

          if (!timingRowsMap.has(timingVal)) {
            timingRowsMap.set(timingVal, {});
            orderedTimingKeys.push(timingVal);
          }

          const cells = timingRowsMap.get(timingVal)!;
          
          if (!cells[trainerName] || !cells[trainerName].isCompleted || (cells[trainerName].isCompleted && isCompleted)) {
            cells[trainerName] = {
              value: rawCompleted !== "" ? rawCompleted : "—",
              isCompleted,
              isSpecial,
              isScheduled,
            };
          }
        }

      } else {
        // ==========================================
        // LAYOUT 3: DEFAULT SIMPLE PIVOT TABLE LAYOUT (Per block context)
        // ==========================================
        const blockTrainers: string[] = [];
        const colToTrainerMap = new Map<number, string>();
        for (let i = 1; i < blockHeader.length; i++) {
          const cellVal = (blockHeader[i] || "").trim();
          const normVal = cellVal.toLowerCase();
          if (
            cellVal !== "" && 
            !normVal.includes("grand total") && 
            !normVal.includes("total") &&
            !normVal.includes("timing") &&
            !normVal.includes("completed") &&
            !normVal.includes("trainer name") &&
            !normVal.includes("ticket")
          ) {
            addGlobalTrainer(cellVal);
            const canonical = getCanonicalTrainerName(cellVal);
            blockTrainers.push(canonical);
            colToTrainerMap.set(i, canonical);
          }
        }

        // Group and merge by timing in this block
        for (let r = 1; r < blockRows.length; r++) {
          const row = blockRows[r];
          if (!row || row.length === 0) continue;
          const timingVal = (row[0] || "").trim();
          const normTiming = timingVal.toLowerCase();
          if (
            !timingVal || 
            normTiming.includes("grand total") || 
            normTiming.includes("total") ||
            normTiming.includes("timing") ||
            normTiming.includes("trainer name") ||
            normTiming.includes("training completed") ||
            normTiming.includes("available")
          ) {
            continue;
          }

          if (!timingRowsMap.has(timingVal)) {
            timingRowsMap.set(timingVal, {});
            orderedTimingKeys.push(timingVal);
          }

          const cells = timingRowsMap.get(timingVal)!;

          colToTrainerMap.forEach((trainerName, colIdx) => {
            const rawVal = row[colIdx] || "";
            const cleanVal = rawVal.trim();
            
            let isCompleted = false;
            let isSpecial = false;
            let isScheduled = false;

            if (cleanVal !== "" && cleanVal !== "—") {
              isScheduled = true;
              if (cleanVal !== "0") {
                isCompleted = true;
              }
              if (cleanVal.includes("✓") || cleanVal.startsWith("✓")) {
                isSpecial = true;
              }

              if (!cells[trainerName] || !cells[trainerName].isCompleted || (cells[trainerName].isCompleted && isCompleted)) {
                cells[trainerName] = {
                  value: cleanVal,
                  isCompleted,
                  isSpecial,
                  isScheduled,
                };
              }
            }
          });
        }
      }
    }

    if (globalTrainersList.length === 0) {
      // Fallback: If no trainers were found, it means our layout detection was too strict or misidentified columns.
      // Let's fallback to treating it as a standard simple pivot table (Layout 3) on the first block.
      const fallbackBlockStart = headerIndices[0] || 0;
      const fallbackBlockRows = rows.slice(fallbackBlockStart);
      if (fallbackBlockRows.length > 0) {
        const fallbackHeader = fallbackBlockRows[0];
        const blockTrainers: string[] = [];
        const colToTrainerMap = new Map<number, string>();
        
        for (let i = 1; i < fallbackHeader.length; i++) {
          const cellVal = (fallbackHeader[i] || "").trim();
          const normVal = cellVal.toLowerCase();
          if (
            cellVal !== "" && 
            !normVal.includes("grand total") && 
            !normVal.includes("total") &&
            !normVal.includes("timing") &&
            !normVal.includes("completed") &&
            !normVal.includes("trainer name") &&
            !normVal.includes("ticket")
          ) {
            addGlobalTrainer(cellVal);
            const canonical = getCanonicalTrainerName(cellVal);
            blockTrainers.push(canonical);
            colToTrainerMap.set(i, canonical);
          }
        }

        // Group and merge by timing in this block
        for (let r = 1; r < fallbackBlockRows.length; r++) {
          const row = fallbackBlockRows[r];
          if (!row || row.length === 0) continue;
          const timingVal = (row[0] || "").trim();
          const normTiming = timingVal.toLowerCase();
          if (
            !timingVal || 
            normTiming.includes("grand total") || 
            normTiming.includes("total") ||
            normTiming.includes("timing") ||
            normTiming.includes("trainer name") ||
            normTiming.includes("training completed") ||
            normTiming.includes("available")
          ) {
            continue;
          }

          if (!timingRowsMap.has(timingVal)) {
            timingRowsMap.set(timingVal, {});
            orderedTimingKeys.push(timingVal);
          }

          const cells = timingRowsMap.get(timingVal)!;

          colToTrainerMap.forEach((trainerName, colIdx) => {
            const rawVal = row[colIdx] || "";
            const cleanVal = rawVal.trim();
            
            let isCompleted = false;
            let isSpecial = false;
            let isScheduled = false;

            if (cleanVal !== "" && cleanVal !== "—") {
              isScheduled = true;
              if (cleanVal !== "0") {
                isCompleted = true;
              }
              if (cleanVal.includes("✓") || cleanVal.startsWith("✓")) {
                isSpecial = true;
              }

              if (!cells[trainerName] || !cells[trainerName].isCompleted || (cells[trainerName].isCompleted && isCompleted)) {
                cells[trainerName] = {
                  value: cleanVal,
                  isCompleted,
                  isSpecial,
                  isScheduled,
                };
              }
            }
          });
        }
      }
    }

    if (globalTrainersList.length === 0) {
      // Ultimate absolute fallback: Create a placeholder trainer so the app never crashes
      addGlobalTrainer("Default Trainer");
    }

    let grandTotalCompleted = 0;
    const timingRows = orderedTimingKeys.map(timing => {
      const cells = timingRowsMap.get(timing)!;
      globalTrainersList.forEach(trainerName => {
        if (!cells[trainerName]) {
          cells[trainerName] = { value: "—", isCompleted: false, isSpecial: false };
        }
        const cell = cells[trainerName];
        if (cell && cell.isCompleted) {
          const numeric = parseInt(cell.value.replace(/[^\d]/g, ""), 10) || 1;
          grandTotalCompleted += numeric;
        }
      });
      return {
        timing,
        cells
      };
    });

    return {
      teamName,
      trainers: globalTrainersList,
      trainerCount: globalTrainersList.length,
      totalCompleted: grandTotalCompleted,
      timingRows,
    };

  } catch (error: any) {
    console.error(`Error parsing sheets:`, error);
    return {
      teamName,
      trainers: [],
      trainerCount: 0,
      totalCompleted: 0,
      timingRows: [],
      error: error.message || String(error)
    };
  }
}

export interface TrainerPerformanceRow {
  tl: string;
  trainer: string;
  physicalVisit: number;
  virtual: number;
  outOfStation: number;
  totalTraining: number;
  workingDays: number;
  productivityDay: number;
  productivityPct: string;
  region?: string;
}

export interface WestZonePerformanceData {
  rows: TrainerPerformanceRow[];
  totals: {
    physicalVisit: number;
    virtual: number;
    outOfStation: number;
    totalTraining: number;
  };
  error?: string;
  rawCsvRows?: any[][];
}

export async function fetchWestZonePerformanceData(
  spreadsheetIdOrUrl: string,
  sheetName: string = "Trainer Wise Performance"
): Promise<WestZonePerformanceData> {
  try {
    const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
    if (!spreadsheetId) {
      throw new Error("Invalid Spreadsheet ID or URL provided.");
    }

    // Build public CSV export URL for the specific sheet (prefer GID if present)
    const gid = extractGid(spreadsheetIdOrUrl);
    const csvUrl = gid
      ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`
      : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

    const res = await fetch(csvUrl);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Spreadsheet not found. Please double-check the URL.");
      }
      throw new Error(`HTTP ${res.status}: Unable to export Google Sheet. Please make sure the sheet is shared as "Anyone with the link can view".`);
    }

    const csvText = await res.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      throw new Error("Sheet needs a header row and content rows.");
    }

    const header = rows[0].map(h => h.toLowerCase().trim());
    const hasPreAggregatedColumns = header.includes("productivity %") || 
                                    header.includes("working days") || 
                                    header.includes("total training") || 
                                    header.includes("physical visit") ||
                                    header.some(h => h.includes("productivity") || h.includes("working days") || h.includes("total training"));
    const isRawTransactions = !hasPreAggregatedColumns && (
                              header.includes("activity created on") || 
                              header.includes("createdby") || 
                              header.includes("created by") || 
                              header.includes("trainer") || 
                              header.some(h => h.includes("createdby") || h.includes("created by") || h.includes("trainer") || h.includes("activity created") || h === "date" || h.includes("date") || h.includes("timestamp"))
                            );

    if (isRawTransactions) {
      // Aggregate raw transaction rows
      const trainerIdx = header.findIndex(h => h === "createdby" || h.includes("trainer") || h === "created by");
      const tlIdx = header.findIndex(h => h === "tl" || h.includes("team leader") || h.includes("lead"));
      const modeIdx = header.findIndex(h => 
        h === "mode" || 
        h.includes("mode") || 
        h === "type" || 
        h.includes("type of training") || 
        h.includes("training type") || 
        h.includes("session type") ||
        h.includes("delivery") ||
        h.includes("visit")
      );
      const regionIdx = header.findIndex(h => h === "region" || h.includes("zone") || h.includes("city") || h.includes("branch"));
      const dateIdx = header.findIndex(h => {
        const val = h.toLowerCase().trim();
        return val === "date" || 
          val.includes("date") || 
          val === "timestamp" || 
          val.includes("timestamp") || 
          val === "created" || 
          val === "day" ||
          val.includes("created on") ||
          val.includes("created_on") ||
          val.includes("createdat") ||
          val.includes("created_at") ||
          val.includes("activity created on");
      });

      interface TrainerAgg {
        originalTrainerName: string;
        tl: string;
        region: string;
        physicalVisit: number;
        virtual: number;
        outOfStation: number;
        dates: Set<string>;
      }
      const aggMap = new Map<string, TrainerAgg>();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[0]) continue;

        const rawTrainerName = trainerIdx !== -1 && row[trainerIdx] ? row[trainerIdx].trim() : "";
        if (!rawTrainerName) continue;

        const normTrainer = rawTrainerName.toUpperCase();
        const tlName = tlIdx !== -1 && row[tlIdx] ? row[tlIdx].trim() : "";
        const mode = modeIdx !== -1 && row[modeIdx] ? row[modeIdx].trim() : "";
        const region = regionIdx !== -1 && row[regionIdx] ? row[regionIdx].trim() : "";
        let dateVal = dateIdx !== -1 && row[dateIdx] ? row[dateIdx].trim() : "";
        if (!dateVal && row[0]) {
          dateVal = row[0].trim();
        }

        if (!aggMap.has(normTrainer)) {
          aggMap.set(normTrainer, {
            originalTrainerName: rawTrainerName,
            tl: tlName || "Other",
            region: region || "Other",
            physicalVisit: 0,
            virtual: 0,
            outOfStation: 0,
            dates: new Set<string>(),
          });
        }

        const agg = aggMap.get(normTrainer)!;
        if (tlName) agg.tl = tlName;
        if (region) agg.region = region;

        const lowerMode = mode.toLowerCase();
        if (
          lowerMode.includes("physical") || 
          lowerMode.includes("visit") || 
          lowerMode.includes("onsite") || 
          lowerMode.includes("site") || 
          lowerMode.includes("person") || 
          lowerMode.includes("field")
        ) {
          agg.physicalVisit++;
        } else if (
          lowerMode.includes("virtual") || 
          lowerMode.includes("online") || 
          lowerMode.includes("remote") || 
          lowerMode.includes("zoom") || 
          lowerMode.includes("call") || 
          lowerMode.includes("meet") || 
          lowerMode.includes("desk")
        ) {
          agg.virtual++;
        } else if (
          lowerMode.includes("station") || 
          lowerMode.includes("oos") || 
          lowerMode.includes("travel") ||
          lowerMode.includes("out of station")
        ) {
          agg.outOfStation++;
        } else {
          agg.virtual++;
        }

        if (dateVal) {
          const parsed = parseTransactionDate(dateVal, i);
          if (parsed) {
            const dateOnlyStr = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, "0")}-${parsed.getDate().toString().padStart(2, "0")}`;
            agg.dates.add(dateOnlyStr);
          } else {
            agg.dates.add(dateVal);
          }
        }
      }

      const parsedRows: TrainerPerformanceRow[] = [];
      const totals = {
        physicalVisit: 0,
        virtual: 0,
        outOfStation: 0,
        totalTraining: 0,
      };

      aggMap.forEach((agg) => {
        const totalTraining = agg.physicalVisit + agg.virtual + agg.outOfStation;
        const workingDays = agg.dates.size || 1;
        const productivityDay = (agg.physicalVisit / 3) + (agg.virtual / 7) + agg.outOfStation;
        const prodPctVal = (productivityDay / workingDays) * 100;
        const productivityPct = `${prodPctVal.toFixed(2)}%`;

        let regionVal = "Other";
        const rawRegionLower = agg.region.toLowerCase().trim();
        if (rawRegionLower.includes("mumbai") || rawRegionLower === "mum") {
          regionVal = "Mumbai";
        } else if (rawRegionLower.includes("pune") || rawRegionLower === "pun") {
          regionVal = "Pune";
        } else if (
          rawRegionLower.includes("rom") ||
          rawRegionLower.includes("goa") ||
          rawRegionLower.includes("r.o.m") ||
          rawRegionLower.includes("rom & goa") ||
          rawRegionLower.includes("rom &goa") ||
          rawRegionLower.includes("rom&goa")
        ) {
          regionVal = "ROM & Goa";
        } else if (agg.region) {
          regionVal = agg.region;
        }

        parsedRows.push({
          tl: agg.tl,
          trainer: agg.originalTrainerName,
          physicalVisit: agg.physicalVisit,
          virtual: agg.virtual,
          outOfStation: agg.outOfStation,
          totalTraining,
          workingDays,
          productivityDay: Number(productivityDay.toFixed(1)),
          productivityPct,
          region: regionVal,
        });

        totals.physicalVisit += agg.physicalVisit;
        totals.virtual += agg.virtual;
        totals.outOfStation += agg.outOfStation;
        totals.totalTraining += totalTraining;
      });

      return {
        rows: parsedRows,
        totals,
        rawCsvRows: rows,
      };
    }

    // We expect the columns to match roughly: TL, Trainer, Physical Visit, Virtual, Out of station, Total training, Working Days, Productivity Day, Productivity %
    const tlIdx = header.findIndex(h => h.includes("tl"));
    const trainerIdx = header.findIndex(h => h.includes("trainer"));
    const physicalIdx = header.findIndex(h => h === "physical visit" || h.includes("physical"));
    const virtualIdx = header.findIndex(h => h === "virtual" || h.includes("virtual"));
    const oosIdx = header.findIndex(h => h.includes("out of station") || h.includes("station"));
    const totalTrainingIdx = header.findIndex(h => h.includes("total training") || h.includes("total"));
    const workingDaysIdx = header.findIndex(h => h.includes("working"));
    const prodDayIdx = header.findIndex(h => h.includes("productivity day") || h.includes("productivity d"));
    const prodPctIdx = header.findIndex(h => h.includes("productivity %") || (h.includes("productivity") && !h.includes("day") && !h.includes(" d")));
    // Auto-detect region column by scanning the first 15 data rows if not found via header name
    let autoRegionIdx = -1;
    for (let r = 1; r < Math.min(rows.length, 16); r++) {
      if (autoRegionIdx !== -1) break;
      const rCells = rows[r];
      if (!rCells) continue;
      for (let c = 0; c < rCells.length; c++) {
        const val = (rCells[c] || "").toLowerCase().trim();
        if (
          val === "mumbai" || val === "pune" || val === "rom & goa" || val === "rom&goa" || 
          val === "rom" || val === "goa" || val === "r.o.m" || val.includes("rom &") || val === "mum" || val === "pun"
        ) {
          autoRegionIdx = c;
          break;
        }
      }
    }

    const regionIdx = header.findIndex(h => h.includes("region") || h.includes("zone") || h.includes("city") || h.includes("branch") || h.includes("location") || h.includes("team"));

    // Safe fallbacks for column indices if not found exactly by substring
    const colTL = tlIdx !== -1 ? tlIdx : 0;
    const colTrainer = trainerIdx !== -1 ? trainerIdx : 1;
    const colPhysical = physicalIdx !== -1 ? physicalIdx : 2;
    const colVirtual = virtualIdx !== -1 ? virtualIdx : 3;
    const colOOS = oosIdx !== -1 ? oosIdx : 4;
    const colTotalTraining = totalTrainingIdx !== -1 ? totalTrainingIdx : 5;
    const colWorkingDays = workingDaysIdx !== -1 ? workingDaysIdx : 6;
    const colProdDay = prodDayIdx !== -1 ? prodDayIdx : 7;
    const colProdPct = prodPctIdx !== -1 ? prodPctIdx : 8;
    const colRegion = regionIdx !== -1 ? regionIdx : (autoRegionIdx !== -1 ? autoRegionIdx : -1);

    const parsedRows: TrainerPerformanceRow[] = [];
    let totals = {
      physicalVisit: 0,
      virtual: 0,
      outOfStation: 0,
      totalTraining: 0,
    };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const trainerName = (row[colTrainer] || "").trim();
      const tlName = (row[colTL] || "").trim();
      const lowerTrainer = trainerName.toLowerCase();
      const lowerTl = tlName.toLowerCase();

      // STRICT SKIPPING OF SUB-TOTALS & GRAND TOTALS TO PREVENT DOUBLE COUNTING
      if (
        lowerTrainer.includes("total") ||
        lowerTl.includes("total") ||
        lowerTrainer.includes("subtotal") ||
        lowerTl.includes("subtotal") ||
        lowerTrainer === "grand total" ||
        lowerTrainer === "all" ||
        lowerTrainer.includes("sum of") ||
        lowerTrainer === "trainer" ||
        lowerTrainer === "name" ||
        lowerTrainer === "name of trainer"
      ) {
        // If it's the official grand total, we can extract the values
        if (lowerTrainer === "grand total" || lowerTrainer === "total" || (!tlName && lowerTrainer.includes("total"))) {
          totals.physicalVisit = parseInt((row[colPhysical] || "").replace(/[^\d]/g, "")) || totals.physicalVisit;
          totals.virtual = parseInt((row[colVirtual] || "").replace(/[^\d]/g, "")) || totals.virtual;
          totals.outOfStation = parseInt((row[colOOS] || "").replace(/[^\d]/g, "")) || totals.outOfStation;
          totals.totalTraining = parseInt((row[colTotalTraining] || "").replace(/[^\d]/g, "")) || totals.totalTraining;
        }
        continue;
      }

      if (!trainerName || trainerName === "") continue;

      const physicalVal = parseInt((row[colPhysical] || "").replace(/[^\d]/g, "")) || 0;
      const virtualVal = parseInt((row[colVirtual] || "").replace(/[^\d]/g, "")) || 0;
      const oosVal = parseInt((row[colOOS] || "").replace(/[^\d]/g, "")) || 0;
      const totalTrainingVal = parseInt((row[colTotalTraining] || "").replace(/[^\d]/g, "")) || 0;
      const workingDaysVal = parseInt((row[colWorkingDays] || "").replace(/[^\d]/g, "")) || 0;

      // Always calculate productivity day and productivity % dynamically using the exact formula:
      // (1 Out of station) + (Physical /3) + (Virtual/7)
      const computedProdDay = oosVal + (physicalVal / 3) + (virtualVal / 7);
      const prodDayVal = Number(computedProdDay.toFixed(1));
      const workingDaysNum = workingDaysVal || 1;
      const prodPctVal = `${((computedProdDay / workingDaysNum) * 100).toFixed(2)}%`;

      // Robust cell-based region parsing
      let rawRegion = colRegion !== -1 ? (row[colRegion] || "").trim() : "";
      
      // Dynamic fallback: scan all cells in this row to see if one contains a region name
      if (!rawRegion) {
        for (let c = 0; c < row.length; c++) {
          const val = (row[c] || "").toLowerCase().trim();
          if (
            val === "mumbai" || val === "pune" || val === "rom" || val === "goa" ||
            val === "rom & goa" || val === "rom&goa" || val === "r.o.m" || val.includes("rom &") ||
            val === "mum" || val === "pun"
          ) {
            rawRegion = row[c];
            break;
          }
        }
      }

      // Normalize region name explicitly
      let regionVal = "Other";
      const rawRegionLower = rawRegion.toLowerCase().trim();
      if (rawRegionLower.includes("mumbai") || rawRegionLower === "mum") {
        regionVal = "Mumbai";
      } else if (rawRegionLower.includes("pune") || rawRegionLower === "pun") {
        regionVal = "Pune";
      } else if (
        rawRegionLower.includes("rom") ||
        rawRegionLower.includes("goa") ||
        rawRegionLower.includes("r.o.m") ||
        rawRegionLower.includes("rom & goa") ||
        rawRegionLower.includes("rom &goa") ||
        rawRegionLower.includes("rom&goa")
      ) {
        regionVal = "ROM & Goa";
      } else if (rawRegionLower) {
        // Keep any other explicitly stated region
        regionVal = rawRegion;
      }

      parsedRows.push({
        tl: tlName,
        trainer: trainerName,
        physicalVisit: physicalVal,
        virtual: virtualVal,
        outOfStation: oosVal,
        totalTraining: totalTrainingVal,
        workingDays: workingDaysVal,
        productivityDay: prodDayVal,
        productivityPct: prodPctVal,
        region: regionVal,
      });
    }

    // If totals are still 0, we can calculate them dynamically
    if (totals.totalTraining === 0) {
      parsedRows.forEach(r => {
        totals.physicalVisit += r.physicalVisit;
        totals.virtual += r.virtual;
        totals.outOfStation += r.outOfStation;
        totals.totalTraining += r.totalTraining;
      });
    }

    return {
      rows: parsedRows,
      totals,
      rawCsvRows: rows,
    };
  } catch (error: any) {
    console.error(`Error parsing West Zone sheets:`, error);
    return {
      rows: [],
      totals: { physicalVisit: 0, virtual: 0, outOfStation: 0, totalTraining: 0 },
      error: error.message || String(error),
    };
  }
}

export interface ProductTransaction {
  date: string | null;
  region: "mumbaiCount" | "puneCount" | "romCount" | "otherCount";
  mode: "Physical" | "Virtual" | "Out of Station";
  rowIndex?: number;
}

export interface ProductTypeCount {
  product: string;
  mumbaiCount: number;
  puneCount: number;
  romCount: number;
  otherCount: number;
  count: number;
  
  mumbaiPhysical: number;
  mumbaiVirtual: number;
  mumbaiOos: number;

  punePhysical: number;
  puneVirtual: number;
  puneOos: number;

  romPhysical: number;
  romVirtual: number;
  romOos: number;

  otherPhysical: number;
  otherVirtual: number;
  otherOos: number;

  physicalCount: number;
  virtualCount: number;
  oosCount: number;

  transactions?: ProductTransaction[];
}

export async function fetchProductTypeData(
  analyticsUrl: string
): Promise<ProductTypeCount[]> {
  try {
    const spreadsheetId = extractSpreadsheetId(analyticsUrl);
    if (!spreadsheetId) {
      return [];
    }

    // Try to extract gid from the URL, default to 590056654 if not present
    let gid = "590056654";
    const gidMatch = analyticsUrl.match(/[?&]gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(csvUrl);
    if (!res.ok) {
      console.warn(`Failed to fetch analytics sheet: HTTP ${res.status}`);
      return [];
    }

    const csvText = await res.text();
    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return [];
    }

    const header = rows[0].map(h => h.toLowerCase().trim());
    const productIdx = header.findIndex(h => h === "product" || h.includes("product"));
    const colProduct = productIdx !== -1 ? productIdx : 8; // fallback to index 8

    const regionIdx = header.findIndex(h => h === "region" || h.includes("region"));
    const colRegion = regionIdx !== -1 ? regionIdx : 11; // fallback to index 11

    const modeIdx = header.findIndex(h => 
      h === "mode" || 
      h.includes("mode") || 
      h === "type" || 
      h.includes("type of training") || 
      h.includes("training type") || 
      h.includes("session type") ||
      h.includes("delivery") ||
      h.includes("visit")
    );
    const colMode = modeIdx !== -1 ? modeIdx : -1;

    const dateIdx = header.findIndex(h => {
      const val = h.toLowerCase().trim();
      return val === "date" || 
        val.includes("date") || 
        val === "timestamp" || 
        val.includes("timestamp") || 
        val === "created" || 
        val === "day" ||
        val.includes("created on") ||
        val.includes("created_on") ||
        val.includes("createdat") ||
        val.includes("created_at") ||
        val.includes("activity created on");
    });
    const colDate = dateIdx;

    const counts: {
      [product: string]: {
        mumbaiCount: number;
        puneCount: number;
        romCount: number;
        otherCount: number;
        count: number;

        mumbaiPhysical: number;
        mumbaiVirtual: number;
        mumbaiOos: number;

        punePhysical: number;
        puneVirtual: number;
        puneOos: number;

        romPhysical: number;
        romVirtual: number;
        romOos: number;

        otherPhysical: number;
        otherVirtual: number;
        otherOos: number;

        physicalCount: number;
        virtualCount: number;
        oosCount: number;

        transactions: ProductTransaction[];
      }
    } = {};

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length <= colProduct) continue;
      const productVal = (row[colProduct] || "").trim();
      if (!productVal) continue;

      const regionValRaw = row.length > colRegion ? (row[colRegion] || "").trim() : "";
      const regionLower = regionValRaw.toLowerCase();

      let regionKey: "mumbaiCount" | "puneCount" | "romCount" | "otherCount" = "otherCount";
      if (regionLower.includes("mumbai")) {
        regionKey = "mumbaiCount";
      } else if (regionLower.includes("pune")) {
        regionKey = "puneCount";
      } else if (regionLower.includes("rom") || regionLower.includes("goa")) {
        regionKey = "romCount";
      }

      if (!counts[productVal]) {
        counts[productVal] = {
          mumbaiCount: 0,
          puneCount: 0,
          romCount: 0,
          otherCount: 0,
          count: 0,

          mumbaiPhysical: 0,
          mumbaiVirtual: 0,
          mumbaiOos: 0,

          punePhysical: 0,
          puneVirtual: 0,
          puneOos: 0,

          romPhysical: 0,
          romVirtual: 0,
          romOos: 0,

          otherPhysical: 0,
          otherVirtual: 0,
          otherOos: 0,

          physicalCount: 0,
          virtualCount: 0,
          oosCount: 0,

          transactions: [],
        };
      }

      let modeKey: "Physical" | "Virtual" | "Out of Station" = "Virtual"; // default fallback
      if (colMode !== -1 && row.length > colMode) {
        const rawMode = (row[colMode] || "").trim().toLowerCase();
        if (
          rawMode.includes("physical") || 
          rawMode.includes("visit") || 
          rawMode.includes("onsite") || 
          rawMode.includes("site") || 
          rawMode.includes("person") || 
          rawMode.includes("field")
        ) {
          modeKey = "Physical";
        } else if (
          rawMode.includes("virtual") || 
          rawMode.includes("online") || 
          rawMode.includes("remote") || 
          rawMode.includes("zoom") || 
          rawMode.includes("call") || 
          rawMode.includes("meet") || 
          rawMode.includes("desk")
        ) {
          modeKey = "Virtual";
        } else if (
          rawMode.includes("station") || 
          rawMode.includes("oos") || 
          rawMode.includes("travel")
        ) {
          modeKey = "Out of Station";
        }
      }

      counts[productVal][regionKey]++;
      counts[productVal].count++;

      if (modeKey === "Physical") {
        counts[productVal].physicalCount++;
        if (regionKey === "mumbaiCount") counts[productVal].mumbaiPhysical++;
        else if (regionKey === "puneCount") counts[productVal].punePhysical++;
        else if (regionKey === "romCount") counts[productVal].romPhysical++;
        else counts[productVal].otherPhysical++;
      } else if (modeKey === "Virtual") {
        counts[productVal].virtualCount++;
        if (regionKey === "mumbaiCount") counts[productVal].mumbaiVirtual++;
        else if (regionKey === "puneCount") counts[productVal].puneVirtual++;
        else if (regionKey === "romCount") counts[productVal].romVirtual++;
        else counts[productVal].otherVirtual++;
      } else if (modeKey === "Out of Station") {
        counts[productVal].oosCount++;
        if (regionKey === "mumbaiCount") counts[productVal].mumbaiOos++;
        else if (regionKey === "puneCount") counts[productVal].puneOos++;
        else if (regionKey === "romCount") counts[productVal].romOos++;
        else counts[productVal].otherOos++;
      }

      let dateVal = colDate !== -1 && row.length > colDate ? (row[colDate] || "").trim() : null;
      if (!dateVal && row[0]) {
        dateVal = row[0].trim();
      }
      counts[productVal].transactions.push({
        date: dateVal,
        region: regionKey,
        mode: modeKey,
        rowIndex: r,
      });
    }

    const list = Object.entries(counts).map(([product, data]) => ({
      product,
      ...data,
    }));

    // Sort descending by count
    list.sort((a, b) => b.count - a.count);
    return list;
  } catch (error) {
    console.error("Error fetching product type data:", error);
    return [];
  }
}

export async function fetchRawSheetRows(url: string): Promise<string[][]> {
  try {
    const spreadsheetId = extractSpreadsheetId(url);
    if (!spreadsheetId) {
      return [];
    }
    const gid = extractGid(url) || "590056654";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(csvUrl);
    if (!res.ok) {
      console.warn(`Failed to fetch raw sheet rows: HTTP ${res.status}`);
      return [];
    }
    const csvText = await res.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Error fetching raw sheet rows:", error);
    return [];
  }
}



