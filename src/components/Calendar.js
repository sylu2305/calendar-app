import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import CalendarHeader from "./CalendarHeader";
import DayCell from "./DayCell";
import "../styles/calendar.css";

function Calendar() {
  const [date, setDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [view, setView] = useState("month");
  const now = dayjs();

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: dayjs().format("YYYY-MM-DD"),
    time: "",
    duration: "",
    color: "#4caf50",
    repeat: ""
  });

  // Request notification permission on load
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Load static and dynamic events
  useEffect(() => {
    const loadEvents = async () => {
      const stored = JSON.parse(localStorage.getItem("calendarEvents") || "[]");

      try {
        // ✅ Correct fetch path for GitHub Pages
        const res = await fetch(process.env.PUBLIC_URL + "/events.json");
        const staticEventsRaw = await res.json();
        const staticEvents = staticEventsRaw.map(ev => ({ ...ev, static: true }));
        setEvents([...staticEvents, ...stored]);
      } catch (err) {
        console.error("Failed to load static events:", err);
        setEvents(stored);
      }
    };

    loadEvents();
  }, []);

  // Save only dynamic events
  useEffect(() => {
    const dynamicOnly = events.filter(e => !e.static);
    localStorage.setItem("calendarEvents", JSON.stringify(dynamicOnly));
  }, [events]);

  // In-browser reminders
  useEffect(() => {
    const notified = new Set();
    const now = dayjs();

    const schedule = () => {
      if (Notification.permission !== "granted") return;

      events.forEach(event => {
        const eventTime = dayjs(`${event.date}T${event.time}`);
        const diff = eventTime.diff(now, "minute");
        const id = `${event.title}-${event.date}-${event.time}`;

        if (diff >= 0 && diff <= 1 && !notified.has(id)) {
          notified.add(id);

          setTimeout(() => {
            setAlertMessage(`⏰ Reminder: ${event.title} at ${event.time}`);
            setTimeout(() => setAlertMessage(""), 5000);

            new Notification(`⏰ Reminder: ${event.title}`, {
              body: `${event.time} (${event.duration || "event"})`,
              icon: "/calendar-icon.png"
            });
          }, diff * 60 * 1000);
        }
      });
    };

    schedule();
  }, [events]);

  const toggleView = () => setView(view === "month" ? "week" : "month");
  const changeMonth = (offset) => setDate(prev => prev.add(offset, "month"));
  const changeWeek = (offset) => setDate(prev => prev.add(offset, "week"));

  const handleAddClick = () => {
    setEditMode(false);
    setShowModal(true);
    setNewEvent({
      title: "",
      date: dayjs().format("YYYY-MM-DD"),
      time: "",
      duration: "",
      color: "#4caf50",
      repeat: ""
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEditMode(true);
    setShowModal(true);
    setNewEvent({ ...event });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    setEvents([...events, newEvent]);
    resetModal();
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    setEvents(prev =>
      prev.map(ev =>
        ev.title === selectedEvent.title &&
        ev.date === selectedEvent.date &&
        ev.time === selectedEvent.time
          ? newEvent
          : ev
      )
    );
    resetModal();
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents(events.filter(e =>
      !(e.title === selectedEvent.title &&
        e.date === selectedEvent.date &&
        e.time === selectedEvent.time)
    ));
    resetModal();
  };

  const resetModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedEvent(null);
  };

  const handleDropEvent = (eventData, newDate) => {
    const updatedEvent = { ...eventData, date: newDate };
    setEvents(events.map(e =>
      e.title === eventData.title &&
      e.date === eventData.date &&
      e.time === eventData.time ? updatedEvent : e
    ));
  };

  const eventsForDay = (day) =>
    events
      .filter(e => {
        const same = dayjs(e.date).isSame(day, "day");
        const repeat = e.repeat === "weekly" &&
          dayjs(e.date).day() === day.day() &&
          dayjs(e.date).isBefore(day);
        return same || repeat;
      })
      .map(e => ({
        ...e,
        completed: now.isAfter(dayjs(`${day.format("YYYY-MM-DD")}T${e.time}`))
      }));

  const days = [];
  if (view === "month") {
    for (let i = 0; i < date.startOf("month").day(); i++) days.push(null);
    for (let i = 1; i <= date.endOf("month").date(); i++) {
      days.push(dayjs(date).date(i));
    }
  } else {
    const startOfWeek = date.startOf("week");
    for (let i = 0; i < 7; i++) days.push(startOfWeek.add(i, "day"));
  }

  return (
    <>
      {/* Top Section */}
      <div className="calendar-header-top">
        <div className="calendar-header-line">
          <h1 className="calendar-title">
            <span className="calendar-icon">📅</span> Calendar
          </h1>
        </div>

        <div className="calendar-actions">
          <button
            className="action-btn"
            onClick={() => document.body.classList.toggle("dark")}
          >
            {document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button className="action-btn" onClick={handleAddClick}>➕ Add Event</button>

          <button className="action-btn" onClick={toggleView}>
            {view === "month" ? "🗓️ Weekly View" : "📆 Monthly View"}
          </button>
        </div>

        <p className="view-label">{view === "month" ? "Monthly View" : "Weekly View"}</p>
      </div>

      {/* In-browser Reminder Box */}
      {alertMessage && <div className="alert-box">{alertMessage}</div>}

      {/* Calendar Header */}
      <CalendarHeader
        month={date.format("MMMM")}
        year={date.year()}
        onPrev={() => view === "month" ? changeMonth(-1) : changeWeek(-1)}
        onNext={() => view === "month" ? changeMonth(1) : changeWeek(1)}
      />

      {/* Grid View */}
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div className="day-name" key={d}>{d}</div>
        ))}
        {days.map((d, i) => (
          <DayCell
            key={i}
            day={d}
            isToday={d && dayjs().isSame(d, "day")}
            events={d ? eventsForDay(d) : []}
            onEventClick={handleEventClick}
            onEventDrop={handleDropEvent}
          />
        ))}
      </div>

      {/* Modal for Add/Update/Delete */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editMode ? "Edit Event" : "Add Event"}</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
              <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
              <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} required />
              <input type="text" placeholder="Duration" value={newEvent.duration} onChange={e => setNewEvent({ ...newEvent, duration: e.target.value })} />
              <input type="color" value={newEvent.color} onChange={e => setNewEvent({ ...newEvent, color: e.target.value })} />
              <select value={newEvent.repeat} onChange={e => setNewEvent({ ...newEvent, repeat: e.target.value })}>
                <option value="">No Repeat</option>
                <option value="weekly">Repeat Weekly</option>
              </select>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={handleAddEvent}>Add</button>
                <button type="button" onClick={handleUpdateEvent}>Update</button>
                <button type="button" onClick={handleDeleteEvent}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Calendar;
