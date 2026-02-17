"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const MONTHS_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface CalendarProps {
  selectedDates?: string[];
  markedDates?: string[];
  onDateClick?: (dateKey: string) => void;
  minDate?: string;
  className?: string;
}

export function Calendar({ selectedDates = [], markedDates = [], onDateClick, minDate, className = "" }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayKey = toDateKey(today);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = startOfMonth(viewYear, viewMonth);
  // Monday = 0 ... Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad end
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedSet = new Set(selectedDates);
  const markedSet = new Set(markedDates);

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {MONTHS_PL[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAYS_PL.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="aspect-square" />;
          }

          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedSet.has(dateKey);
          const isMarked = markedSet.has(dateKey);
          const isToday = dateKey === todayKey;
          const isPast = minDate ? dateKey < minDate : dateKey < todayKey;

          return (
            <button
              key={dateKey}
              onClick={() => !isPast && onDateClick?.(dateKey)}
              disabled={isPast}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-all
                ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
                ${isSelected ? "bg-orange-500 text-white hover:bg-orange-600 font-semibold" : ""}
                ${isToday && !isSelected ? "ring-1 ring-orange-300 font-semibold text-orange-600" : ""}
                ${!isSelected && !isPast && !isToday ? "text-gray-700" : ""}
              `}
            >
              <span className="leading-none">{day}</span>
              {isMarked && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />
              )}
              {isMarked && isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
