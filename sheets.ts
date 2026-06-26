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
      
      // Look for the word "timing" or "time" in the first 3 columns
      for (let c = 0; c < Math.min(row.length, 3); c++) {
        const val = (row[c] || "").toLowerCase().trim();
        if (val === "timing" || val.includes("timing") || val === "time" || val === "timings") {
          isHeader = true;
          break;
        }
      }
      
      // Or check if the row has "trainer name" / "trainer" and "completed" headers
      if (!isHeader) {
        let trainerColCount = 0;
        let hasCompletedHeader = false;
        row.forEach(cell => {
          const norm = (cell || "").toLowerCase().trim().replace(/[:\s]+/g, " ");
          if (
            norm === "trainer" ||
            norm === "trainers" ||
            norm === "trainer name" ||
            norm === "trainer s name" ||
            norm === "trainers name" ||
            norm === "coach" ||
            norm === "coaches" ||
            norm.includes("trainer name") ||
            norm.includes("trainer's name") ||
            norm.includes("trainers name")
          ) {
            trainerColCount++;
          }
          if (norm.includes("completed")) {
            hasCompletedHeader = true;
          }
        });
        
        if (trainerColCount >= 2 || (trainerColCount >= 1 && hasCompletedHeader)) {
          isHeader = true;
        }
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
        if (
          norm === "trainer" ||
          norm === "trainers" ||
          norm === "trainer name" ||
          norm === "trainer s name" ||
          norm === "trainers name" ||
          norm === "coach" ||
          norm === "coaches" ||
          norm.includes("trainer name") ||
          norm.includes("trainer's name") ||
          norm.includes("trainers name")
        ) {
          trainerNameColIndices.push(idx);
        }
      });

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
            
            let isCompleted = false;
            let isSpecial = false;
            let isScheduled = false;

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
          let isScheduled = false;

          if (rawCompleted !== "" && rawCompleted !== "—") {
            isScheduled = true;
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
      throw new Error("No trainers identified in the sheet.");
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

    // Build public CSV export URL for the specific sheet by name
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

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

    // We expect the columns to match roughly: TL, Trainer, Physical Visit, Virtual, Out of station, Total training, Working Days, Productivity Day, Productivity %
    const header = rows[0].map(h => h.toLowerCase().trim());
    const tlIdx = header.findIndex(h => h.includes("tl"));
    const trainerIdx = header.findIndex(h => h.includes("trainer"));
    const physicalIdx = header.findIndex(h => h === "physical visit" || h.includes("physical"));
    const virtualIdx = header.findIndex(h => h === "virtual" || h.includes("virtual"));
    const oosIdx = header.findIndex(h => h.includes("out of station") || h.includes("station"));
    const totalTrainingIdx = header.findIndex(h => h.includes("total training") || h.includes("total"));
    const workingDaysIdx = header.findIndex(h => h.includes("working"));
    const prodDayIdx = header.findIndex(h => h.includes("productivity day") || h.includes("productivity d"));
    const prodPctIdx = header.findIndex(h => h.includes("productivity %") || (h.includes("productivity") && !h.includes("day") && !h.includes(" d")));

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

      // Check if this is the Grand Total row
      if (trainerName.toLowerCase() === "grand total" || (!tlName && trainerName.toLowerCase().includes("total"))) {
        totals.physicalVisit = parseInt((row[colPhysical] || "").replace(/[^\d]/g, "")) || totals.physicalVisit;
        totals.virtual = parseInt((row[colVirtual] || "").replace(/[^\d]/g, "")) || totals.virtual;
        totals.outOfStation = parseInt((row[colOOS] || "").replace(/[^\d]/g, "")) || totals.outOfStation;
        totals.totalTraining = parseInt((row[colTotalTraining] || "").replace(/[^\d]/g, "")) || totals.totalTraining;
        continue;
      }

      if (!trainerName || trainerName === "") continue;

      const physicalVal = parseInt((row[colPhysical] || "").replace(/[^\d]/g, "")) || 0;
      const virtualVal = parseInt((row[colVirtual] || "").replace(/[^\d]/g, "")) || 0;
      const oosVal = parseInt((row[colOOS] || "").replace(/[^\d]/g, "")) || 0;
      const totalTrainingVal = parseInt((row[colTotalTraining] || "").replace(/[^\d]/g, "")) || 0;
      const workingDaysVal = parseInt((row[colWorkingDays] || "").replace(/[^\d]/g, "")) || 0;
      const prodDayVal = parseFloat((row[colProdDay] || "").replace(/[^\d.]/g, "")) || 0;
      const prodPctVal = (row[colProdPct] || "").trim();

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

