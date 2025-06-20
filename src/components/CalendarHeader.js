import React from "react";
import "../styles/calendar.css";

function CalendarHeader({ month, year, onPrev, onNext }) {
  return (
    <div className="calendar-header">
      <button onClick={onPrev}>‹</button>
      <h2>{month} {year}</h2>
      <button onClick={onNext}>›</button>
    </div>
  );
}

export default CalendarHeader;