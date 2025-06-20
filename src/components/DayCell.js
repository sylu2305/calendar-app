import React from "react";
import "../styles/calendar.css";

/**
 * 🗓️ DayCell Component
 * ---------------------
 * Represents a single day box in the calendar grid.
 * Handles rendering of:
 * - Date number
 * - Event count badge
 * - Events with tooltips
 * - Drag-and-drop support
 * - Highlights for today, weekends, and holidays
 *
 * Props:
 * - day: dayjs object for the current day
 * - events: array of events for this day
 * - isToday: boolean if this day is "today"
 * - onEventClick: function to open modal on event click
 * - onEventDrop: function to handle drag-and-drop of events
 */

function DayCell({ day, events, isToday, onEventClick, onEventDrop }) {
  // If cell is null (padding days in month view), render empty cell
  if (!day) return <div className="day-cell empty"></div>;

  // Check if the current day is weekend (0 = Sun, 6 = Sat)
  const isWeekend = [0, 6].includes(day.day());

  // Hardcoded list of public holidays (can be extended dynamically)
  const holidays = ["2025-01-01", "2025-08-15", "2025-10-02", "2025-12-25"];
  const isHoliday = holidays.includes(day.format("YYYY-MM-DD"));

  return (
    <div
      className={`day-cell ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""} ${isHoliday ? "holiday" : ""}`}
      
      // Allow drop target
      onDragOver={(e) => e.preventDefault()}
      
      // Handle event being dropped on this day cell
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        const eventData = JSON.parse(data);
        onEventDrop(eventData, day.format("YYYY-MM-DD"));
      }}
    >
      {/* Top part of the day cell: day number + badge */}
      <div className="day-header">
        <span className="day-number">{day.date()}</span>
        
        {/* If events exist for this day, show a badge count */}
        {events.length > 0 && (
          <span className="event-count">{events.length}</span>
        )}
      </div>

      {/* Render events for this day */}
      <div className="events">
        {events.map((e, i) => (
          <div
            key={i}
            className={`event ${e.completed ? "completed" : ""}`}
            draggable
            onDragStart={(ev) => {
              ev.dataTransfer.setData("text/plain", JSON.stringify(e));
            }}
            onClick={(ev) => {
              ev.stopPropagation(); // Prevent modal from closing if inside
              onEventClick(e); // Open modal for this event
            }}
            style={{ "--color": e.color || "#9c27b0" }} // Custom color
          >
            {/* Tooltip wrapper for event title */}
            <div className="tooltip">
              {e.title}
              <span className="tooltip-text">
                {e.title}<br />
                {e.time} – {e.duration || "event"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DayCell;
