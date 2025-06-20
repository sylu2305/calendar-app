import React from "react";
import "../styles/calendar.css";

/**
 * 📅 CalendarHeader Component
 * ---------------------------
 * Displays the current month and year, and provides
 * buttons to navigate between months or weeks.
 *
 * Props:
 * - month (string): e.g., "June"
 * - year (number): e.g., 2025
 * - onPrev (function): handler for previous button
 * - onNext (function): handler for next button
 */

function CalendarHeader({ month, year, onPrev, onNext }) {
  return (
    <div className="calendar-header">
      {/* Navigate to previous month/week */}
      <button onClick={onPrev}>‹</button>

      {/* Display current month and year */}
      <h2>{month} {year}</h2>

      {/* Navigate to next month/week */}
      <button onClick={onNext}>›</button>
    </div>
  );
}

export default CalendarHeader;
