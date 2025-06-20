import React, { useState, useEffect } from "react";
import dayjs from "dayjs"; // Lightweight date library
import CalendarHeader from "./CalendarHeader"; // Component for Month/Year navigation
import DayCell from "./DayCell"; // Component representing each day box
import "../styles/calendar.css"; // Styling

function Calendar() {
  // State for current visible date (month/week)
  const [date, setDate] = useState(dayjs());

  // Stores all events (static + dynamic)
  const [events, setEvents] = useState([]);

  // Used to track currently selected event
  const [selectedEvent, setSelectedEvent] = useState(null);

  // If true, user is editing; else, adding
  const [editMode, setEditMode] = useState(false);

  // Modal visibility toggle
  const [showModal, setShowModal] = useState(false);

  // Display alert message (reminder popup)
  const [alertMessage, setAlertMessage] = useState("");

  // Toggle between monthly and weekly view
  const [view, setView] = useState("month");

  // Current time for comparison
  const now = dayjs();

  // Event model for form
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: dayjs().format("YYYY-MM-DD"),
    time: "",
    duration: "",
    color: "#4caf50",
    repeat: "" // "weekly" or ""
  });

  // Ask for notification permission on first load
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Load events from localStorage and public/events.json
  useEffect(() => {
    const loadEvents = async () => {
      const stored = JSON.parse(localStorage.getItem("calendarEvents") || "[]");

      try {
        const res = await fetch("/events.json");
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

  // Save only dynamic events (user-added) to localStorage
  useEffect(() => {
    const dynamicOnly = events.filter(e => !e.static);
    localStorage.setItem("calendarEvents", JSON.stringify(dynamicOnly));
  }, [events]);

  // Schedule in-browser notifications before event time
  useEffect(() => {
    const notified = new Set(); // Prevent duplicate alerts

    const schedule = () => {
      if (Notification.permission !== "granted") return;

      const now = dayjs();

      events.forEach(event => {
        const eventTime = dayjs(`${event.date}T${event.time}`);
        const diff = eventTime.diff(now, "minute");
        const id = `${event.title}-${event.date}-${event.time}`;

        if (diff >= 0 && diff <= 1 && !notified.has(id)) {
          notified.add(id);

          setTimeout(() => {
            setAlertMessage(`⏰ Reminder: ${event.title} at ${event.time}`);
            setTimeout(() => setAlertMessage(""), 5000); // clear message

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

  // Toggle between month and week view
  const toggleView = () => setView(view === "month" ? "week" : "month");

  // Navigation functions
  const changeMonth = (offset) => setDate(prev => prev.add(offset, "month"));
  const changeWeek = (offset) => setDate(prev => prev.add(offset, "week"));

  // Open modal in add mode
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

  // Open modal in edit mode
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEditMode(true);
    setShowModal(true);
    setNewEvent({ ...event });
  };

  // Add a new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    setEvents([...events, newEvent]);
    resetModal();
  };

  // Update an existing event
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

  // Delete an event
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents(events.filter(e =>
      !(e.title === selectedEvent.title &&
        e.date === selectedEvent.date &&
        e.time === selectedEvent.time)
    ));
    resetModal();
  };

  // Reset modal states
  const resetModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedEvent(null);
  };

  // Drag-and-drop handler to move an event to another day
  const handleDropEvent = (eventData, newDate) => {
    const updatedEvent = { ...eventData, date: newDate };
    setEvents(events.map(e =>
      e.title === eventData.title &&
      e.date === eventData.date &&
      e.time === eventData.time ? updatedEvent : e
    ));
  };

  // Get events for the day (including recurring ones)
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

  // Generate grid days (month or week)
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
      {/* 🔝 Top header with title and controls */}
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

      {/* 🔔 Top alert popup */}
      {alertMessage && <div className="alert-box">{alertMessage}</div>}

      {/* ⬅️➡️ Calendar month/week navigation */}
      <CalendarHeader
        month={date.format("MMMM")}
        year={date.year()}
        onPrev={() => view === "month" ? changeMonth(-1) : changeWeek(-1)}
        onNext={() => view === "month" ? changeMonth(1) : changeWeek(1)}
      />

      {/* 📅 Day Grid */}
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

      {/* 🧾 Modal for event input */}
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
