import React from "react";
import "../styles/calendar.css";

function DayCell({ day, events, isToday, onEventClick, onEventDrop }) {
  if (!day) return <div className="day-cell empty"></div>;

  const isWeekend = [0, 6].includes(day.day());
  const holidays = ["2025-01-01", "2025-08-15", "2025-10-02", "2025-12-25"];
  const isHoliday = holidays.includes(day.format("YYYY-MM-DD"));

  return (
    <div
      className={`day-cell ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""} ${isHoliday ? "holiday" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        const eventData = JSON.parse(data);
        onEventDrop(eventData, day.format("YYYY-MM-DD"));
      }}
    >
      <div className="day-header">
        <span className="day-number">{day.date()}</span>
        {events.length > 0 && <span className="event-count">{events.length}</span>}
      </div>
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
              ev.stopPropagation();
              onEventClick(e);
            }}
            style={{ "--color": e.color || "#9c27b0" }}
          >
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
