  import { useState, useEffect, useRef, useCallback } from "react";

  // ── helpers ──────────────────────────────────────────────────────────────────
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const HOLIDAYS = {
  // Fixed National Holidays
  "1-26": "Republic Day 🇮🇳",
  "8-15": "Independence Day 🇮🇳",
  "10-2": "Gandhi Jayanti", 

  // Fixed Popular Observances
  "1-1": "New Year's Day",
  "5-1": "Labour Day",
  "6-21": "International Yoga Day",

  // Regionally Common Fixed Days
  "1-14": "Pongal",
  "4-14": "Ambedkar Jayanti / Tamil New Year / Baisakhi",
  "12-25": "Christmas",
};

  const MONTH_IMAGES = [
    "https://picsum.photos/seed/jan-snow/900/300",      // Jan
    "https://picsum.photos/seed/feb-frost/900/300",     // Feb
    "https://picsum.photos/seed/mar-bloom/900/300",     // Mar
    "https://picsum.photos/seed/apr-flowers/900/300",   // Apr
    "https://picsum.photos/seed/may-fields/900/300",    // May
    "https://picsum.photos/seed/jun-beach/900/300",     // Jun
    "https://picsum.photos/seed/jul-lake/900/300",      // Jul
    "https://picsum.photos/seed/aug-sunset/900/300",    // Aug
    "https://picsum.photos/seed/sep-autumn/900/300",    // Sep
    "https://picsum.photos/seed/oct-forest/900/300",    // Oct
    "https://picsum.photos/seed/nov-trees/900/300",     // Nov
    "https://picsum.photos/seed/dec-winter/900/300",    // Dec
  ];

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function getFirstDayOfMonth(year, month) {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday = 0
  }
  function sameDay(a, b) {
    return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
  }
  function isBetween(cell, start, end) {
    if (!start || !end) return false;
    const toN = (d) => d.year * 10000 + d.month * 100 + d.day;
    const [lo, hi] = toN(start) <= toN(end) ? [start, end] : [end, start];
    const n = toN(cell);
    return n > toN(lo) && n < toN(hi);
  }

  // ── subcomponents ─────────────────────────────────────────────────────────────
  function SpiralBinding() {
    return (
      <div className="absolute -top-5 left-0 right-0 h-8 flex items-center justify-center z-20" style={{ gap: '0.5px' }}>
        {/* Hanging hook */}
        <div className="absolute -top-2 rounded-t-full shrink-0" style={{
          width: 20,
          height: 16,
          border: "3px solid #8a9299",
          background: "linear-gradient(135deg,#d8dfe6 30%,#8a9299 100%)",
          boxShadow: "0 2px 4px #0003, inset 0 1px 2px #fff8",
          left: "50%",
          transform: "translateX(-50%)",
        }} />
        
        {/* Spiral coils */}
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} className="w-3 h-3 rounded-full shrink-0" style={{
            border:"2px solid #a0a8b1",
            background:"linear-gradient(135deg,#d8dfe6 20%,#8a9299 80%)",
            boxShadow:"0 1px 3px #0003, inset 0 0.5px 1px #fff9",
            opacity: 0.7 + (i / 40) * 0.3,
          }}/>
        ))}
      </div>
    );
  }

  function HolidayBadge({ label, fullLabel, note }) {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
      <span
        className="absolute top-0.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap font-bold tracking-wider z-5"
        style={{
          fontSize: '7px',
          fontFamily: "'DM Sans',sans-serif",
          letterSpacing: '.3px',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {label}
        {showTooltip && (
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white text-black text-xs rounded shadow-lg p-2 min-w-30 max-w-55 border border-gray-200"
            style={{
              top: '100%',
              whiteSpace: 'pre-line',
              zIndex: 100,
              fontSize: '11px',
              pointerEvents: 'auto',
            }}
          >
            <div className="font-bold mb-1" style={{color:'#c00'}}>{fullLabel}</div>
            {note && <div className="mt-1 text-gray-700">📝 {note}</div>}
          </div>
        )}
      </span>
    );
  }

  // ── main component ────────────────────────────────────────────────────────────
  export default function WallCalendar() {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [rangeStart, setRangeStart] = useState(null);
    const [rangeEnd, setRangeEnd] = useState(null);
    const [hoverDay, setHoverDay] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [notes, setNotes] = useState({});          // { "2025-4-12": "text" }
    const [noteInput, setNoteInput] = useState("");
    const [activeNoteKey, setActiveNoteKey] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [flipping, setFlipping] = useState(false);
    const [flipDir, setFlipDir] = useState(1);
    const [imgLoaded, setImgLoaded] = useState(false);
    const imgRef = useRef(null);

    // Load notes from localStorage
    useEffect(() => {
      try {
        const saved = localStorage.getItem("cal_notes");
        if (saved) setNotes(JSON.parse(saved));
      } catch(_) {}
    }, []);

    const saveNotes = useCallback((n) => {
      setNotes(n);
      try { localStorage.setItem("cal_notes", JSON.stringify(n));
        clearSelection()
       } catch(_) {}
    }, []);

    const navigate = (dir) => {
      if (flipping) return;
      setFlipDir(dir);
      setFlipping(true);
      setImgLoaded(false);
      setTimeout(() => {
        setViewMonth(prev => {
          let nm = prev + dir;
          if (nm < 0) { setViewYear(y => y - 1); return 11; }
          if (nm > 11) { setViewYear(y => y + 1); return 0; }
          return nm;
        });
        setFlipping(false);
      }, 420);
    };

    // Build calendar grid
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const prevDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const cells = Array.from({ length: totalCells }, (_, i) => {
      if (i < firstDay) return { day: prevDays - firstDay + i + 1, type: "prev" };
      if (i >= firstDay + daysInMonth) return { day: i - firstDay - daysInMonth + 1, type: "next" };
      return { day: i - firstDay + 1, type: "cur" };
    });

    const handleDayClick = (cell) => {
      if (cell.type !== "cur") return;
      const d = { year: viewYear, month: viewMonth, day: cell.day };
      const key = `${viewYear}-${viewMonth}-${cell.day}`;

      if (!selecting || !rangeStart) {
        setRangeStart(d); setRangeEnd(null); setSelecting(true);
        setActiveNoteKey(key);
        setNoteInput(notes[key] || "");
      } else {
        const toN = (x) => x.year * 10000 + x.month * 100 + x.day;
        const [s, e] = toN(d) >= toN(rangeStart) ? [rangeStart, d] : [d, rangeStart];
        setRangeStart(s); setRangeEnd(e); setSelecting(false);
        const rKey = `range-${s.day}-${s.month}-${s.year} to ${e.day}-${e.month}-${e.year}`;
        setActiveNoteKey(rKey);
        setNoteInput(notes[rKey] || "");
      }
    };

    const saveNote = () => {
      if (!activeNoteKey) return;
      const n = { ...notes, [activeNoteKey]: noteInput };
      saveNotes(n);

    };

    const clearSelection = () => {
      setRangeStart(null); setRangeEnd(null); setSelecting(false);
      setActiveNoteKey(null); setNoteInput("");
    };

    const deleteNote = (key) => {
      const n = { ...notes };
      delete n[key];
      saveNotes(n);
    };

    const editNote = (key, value) => {
      setActiveNoteKey(key);
      setNoteInput(value);
    };

    const imgSrc = MONTH_IMAGES[viewMonth];

    // ── theme ──────────────────────────────────────────────────────────────────
    const bg      = darkMode ? "#12151a" : "#f0f2f5";
    const cardBg  = darkMode ? "#1c2029" : "#ffffff";
    const imgBg   = darkMode ? "#0d1117" : "#e8eaed";
    const text     = darkMode ? "#e8edf4" : "#1a1e26";
    const muted    = darkMode ? "#5a6478" : "#9aa3b0";
    const accent   = "#1e9de0";
    const accentSat= "#ff6b6b";
    const accentSun= "#1e9de0";
    const rangeBg  = darkMode ? "#1e4a6e44" : "#e0f2fe";
    const startBg  = accent;
    const endBg    = "#ff6b6b";
    const border   = darkMode ? "#2a3042" : "#e2e6ed";

    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors" style={{
        background: bg,
        fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
          * { box-sizing: border-box; }
          .day-cell:hover { transform: scale(1.08); }
          .nav-btn:hover { opacity:.75; transform:scale(1.1); }
          .note-save:hover { background: #1580bd !important; }
          .theme-btn:hover { opacity:.8; }
          @keyframes flipIn {
            from { opacity:0; transform: rotateX(-15deg) translateY(-8px); }
            to   { opacity:1; transform: rotateX(0deg) translateY(0); }
          }
          @keyframes shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .calendar-body { animation: flipIn .42s cubic-bezier(.22,1,.36,1) both; }
          .shimmer {
            background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
            background-size: 400px 100%;
            animation: shimmer 1.2s infinite;
          }
          textarea { resize:none; }
          textarea:focus { outline:none; }
          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-track { background:transparent; }
          ::-webkit-scrollbar-thumb { background:#ccc; border-radius:4px; }
          .text-stroke{
            -webkit-text-stroke: 1px white;
          }
        `}</style>

        <div className="w-full max-w-3xl rounded-3xl overflow-hidden relative transition-all" style={{
          background:cardBg,
          boxShadow: darkMode
            ? "0 32px 80px #0008, 0 8px 24px #0005"
            : "0 24px 64px #0001a, 0 4px 16px #0002",
        }}>

          {/* spiral */}
          <SpiralBinding />

          {/* ── HERO IMAGE ───────────────────────────────────────────────────── */}
          <div className="relative h-60 overflow-hidden" style={{ background: imgBg }}>
            {!imgLoaded && (
              <div className="shimmer absolute inset-0"/>
            )}
            <img
              ref={imgRef}
              src={imgSrc}
              alt={MONTHS[viewMonth]}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover" style={{
                display: imgLoaded ? "block" : "none",
                transition:"opacity .5s",
              }}
            />
            {/* Wave mask */}
            <svg viewBox="0 0 900 60" preserveAspectRatio="none" className="absolute -bottom-0.5 left-0 right-0 w-full h-15">
              <path d={`M0,0 L0,60 L900,60 L900,0 
                C750,60 600,20 450,40 C300,58 150,10 0,30 Z`}
                fill={cardBg}/>
            </svg>

            {/* Month label */}
            <div className="absolute bottom-6 right-7 text-right pointer-events-none">
              <div className="text-5xl font-black leading-none -tracking-wider text-blue-400 text-stroke" style={{
                fontFamily:"'Playfair Display',serif",
                textShadow:"0 2px 16px #0009",
              }}>{MONTHS[viewMonth].toUpperCase()}</div>
              <div className="text-2xl font-extrabold tracking-widest mt-0.5 text-blue-400" style={{
                textShadow:"0 1px 8px #0007",
              }}>{viewYear}</div>
            </div>

            {/* Nav arrows */}
            <button className="nav-btn absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-50 border-none rounded-full w-9 h-9 cursor-pointer text-gray-500 text-lg flex items-center justify-center backdrop-blur-sm transition-all hover:opacity-75 hover:scale-110" onClick={() => navigate(-1)}>‹</button>
            <button className="nav-btn absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-50 border-none rounded-full w-9 h-9 cursor-pointer text-gray-500 text-lg flex items-center justify-center backdrop-blur-sm transition-all hover:opacity-75 hover:scale-110" onClick={() => navigate(1)}>›</button>

            {/* Theme toggle */}
            <button className="theme-btn absolute top-3.5 right-3.5 bg-white bg-opacity-80 border-none rounded-full px-3 py-1.5 cursor-pointer text-gray-500 text-xs font-semibold backdrop-blur-sm transition-all hover:opacity-80" onClick={() => setDarkMode(d=>!d)}>{darkMode ? "☀ Light" : "☽ Dark"}</button>
          </div>

          {/* ── BODY ─────────────────────────────────────────────────────────── */}
          <div className={`flex flex-col md:flex-row gap-0 ${flipping ? "" : "calendar-body"}`} style={{
            opacity: flipping ? 0 : 1,
            transition:"opacity .2s",
          }}>

            {/* ── NOTES PANEL ─────────────────────────────────────────────── */}
            <div className="w-full md:max-w-xs border-b md:border-r md:border-b-0 flex flex-col gap-3.5 p-6 min-w-0 transition-colors order-2 md:order-1" style={{
              borderColor: border,
            }}>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: muted }}>Notes</div>

                {rangeStart && (
                  <div className="text-xs font-semibold mb-2" style={{ color: accent }}>
                    {rangeEnd
                      ? `${rangeStart.day} ${MONTHS[rangeStart.month].slice(0,3)} – ${rangeEnd.day} ${MONTHS[viewMonth].slice(0,3)}`
                      : `${rangeStart.day} ${MONTHS[viewMonth].slice(0,3)} ${viewYear}`
                    }
                  </div>
                )}

                <textarea
                  placeholder={rangeStart
                    ? "Add a note for this selection…"
                    : activeNoteKey
                    ? "Edit this note…"
                    : "Select a date to add a note…"}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  disabled={!rangeStart && !activeNoteKey}
                  rows={6}
                  className="w-full border rounded-xl p-3 text-xs resize-none focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{
                    borderColor: border,
                    color: text,
                    background: darkMode ? "#242836" : "#f8f9fb",
                    lineHeight: 1.7,
                    cursor: (rangeStart || activeNoteKey) ? "text" : "not-allowed",
                    opacity: (rangeStart || activeNoteKey) ? 1 : 0.5,
                  }}
                />

                <div className="flex gap-2 mt-2">
                  <button className="note-save flex-1 bg-blue-500 text-white border-none rounded-lg py-1.5 text-xs font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:bg-blue-600" onClick={saveNote}
                    disabled={(!rangeStart && !activeNoteKey) || !noteInput}
                    >{activeNoteKey && !rangeStart ? "Update" : "Save"}</button>
                  {(rangeStart || activeNoteKey) && (
                    <button onClick={clearSelection} className="flex-1 bg-transparent text-gray-500 border rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition-all" style={{
                      color: muted,
                      borderColor: border,
                    }}>Clear</button>
                  )}
                </div>
              </div>

              {/* Saved notes list */}
              {Object.keys(notes).length > 0 && (
                <div className="overflow-auto max-h-40">
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: muted }}>Saved</div>
                  {Object.entries(notes).map(([k, v]) => v && (
                    <div key={k} className="text-xs p-2.5 rounded-lg mb-1.5 border-l-4 leading-relaxed" style={{
                      color: text,
                      background: darkMode ? "#242836" : "#f4f6f8",
                      borderLeftColor: accent,
                    }}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <span className="block text-xs font-semibold mb-1 uppercase tracking-widest" style={{
                            color: muted,
                          }}>{k.replace("range-","").replace(/-/g," / ")}</span>
                          <p className="text-xs whitespace-pre-wrap\">{v}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => editNote(k, v)}
                            className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                            title="Edit"
                            style={{ background: darkMode ? "#1a2332" : undefined }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteNote(k)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                            style={{ background: darkMode ? "#2a1a1a" : undefined }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── CALENDAR GRID ────────────────────────────────────────────── */}
            <div className="flex-1 p-6 min-w-0 w-full md:w-auto order-1 md:order-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d,i) => (
                  <div key={d} className="text-center text-xs font-bold tracking-wider" style={{
                    color: i === 5 ? accentSat : i === 6 ? accentSun : muted,
                    padding: "1px 0",
                  }}>{d}</div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, idx) => {
                  const isCur = cell.type === "cur";
                  const cellD = { year: viewYear, month: viewMonth, day: cell.day };
                  const isStart = sameDay(cellD, rangeStart);
                  const isEnd = sameDay(cellD, rangeEnd);
                  const isHoverEnd = selecting && sameDay(cellD, hoverDay);
                  const inRange = isBetween(cellD, rangeStart, rangeEnd)
                    || (selecting && isBetween(cellD, rangeStart, hoverDay));
                  const isToday = isCur
                    && cell.day === today.getDate()
                    && viewMonth === today.getMonth()
                    && viewYear === today.getFullYear();
                  const holidayKey = `${viewMonth+1}-${cell.day}`;
                  const holiday = isCur ? HOLIDAYS[holidayKey] : null;
                  const noteKey = `${viewYear}-${viewMonth}-${cell.day}`;
                  const hasNote = isCur && !!notes[noteKey];
                  const noteText = hasNote ? notes[noteKey] : null;
                  const dow = idx % 7; // 0=Mon

                  let cellBg = "transparent";
                  let cellColor = isCur
                    ? (dow === 5 ? accentSat : dow === 6 ? accentSun : text)
                    : muted;
                  if (!isCur) cellColor = darkMode ? "#333" : "#d0d4dc";
                  if (isCur && inRange) { cellBg = rangeBg; }
                  if (isCur && isStart) { cellBg = startBg; cellColor = "#fff"; }
                  if (isCur && isEnd) { cellBg = endBg; cellColor = "#fff"; }
                  if (isCur && isHoverEnd && !isEnd) { cellBg = endBg + "88"; cellColor = "#fff"; }

                  return (
                    <div key={idx}
                      className={`relative h-12 flex flex-col items-center justify-center rounded-xl transition-all user-select-none ${isCur ? "day-cell cursor-pointer" : "cursor-default"}`}
                      onMouseEnter={() => isCur && selecting && setHoverDay(cellD)}
                      onMouseLeave={() => setHoverDay(null)}
                      onClick={() => handleDayClick(cell)}
                      style={{
                        background: cellBg,
                      }}
                    >
                      {isToday && !isStart && !isEnd && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: accent }} />
                      )}
                      {holiday && (
                        <HolidayBadge
                          label={holiday.split(" ")[0]}
                          fullLabel={holiday}
                          note={noteText}
                        />
                      )}
                      <span className={`text-sm leading-tight ${isToday||isStart||isEnd ? "font-bold" : "font-normal"}`} style={{
                        color: cellColor,
                        marginTop: holiday ? 10 : 0,
                      }}>{cell.day}</span>
                      {hasNote && !isStart && !isEnd && (
                        <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: accentSat }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 flex-wrap mt-5 border-t pt-3.5" style={{
                borderTopColor: border,
              }}>
                {[
                  { color:accent, label:"Start date" },
                  { color:accentSat, label:"End date" },
                  { color:rangeBg, label:"In range", border:`1px solid ${accent}44` },
                  { color:"transparent", dot:accent, label:"Today" },
                  { color:"transparent", dot:accentSat, label:"Has note" },
                ].map(({ color, dot, label, border:b }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: muted }}>
                    <div className="w-3.5 h-3.5 rounded" style={{
                      background: color,
                      border: b || "none",
                      position: "relative",
                    }}>
                      {dot && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: dot }} />}
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }