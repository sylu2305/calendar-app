<!-- 🏷️ Project Title -->
# 📅 Advanced Calendar App

<!-- 🔍 Short Project Summary -->
A responsive, interactive calendar built using **React** and **Vanilla CSS**, inspired by Google Calendar.  
This app supports custom events, recurring events, tooltips, dark/light themes, and real-time reminders.

<!-- 🌐 Live Demo & GitHub Links -->
> 🔗 **Live Demo**: [https://sylu2305.github.io/calendar-app](https://sylu2305.github.io/calendar-app)  
> 📁 **Code Repository**: [https://github.com/sylu2305/calendar-app](https://github.com/sylu2305/calendar-app)

---

<!-- ✅ Key Features -->
## 🚀 Features

- ✅ Add, update, and delete events
- ✅ View in **monthly** or **weekly** layouts
- ✅ Supports **recurring weekly events**
- ✅ Events saved in **localStorage**
- ✅ Loads initial events from `events.json`
- ✅ Toggle between **dark** and **light** mode
- ✅ Popup **reminder 1 minute before** an event
- ✅ Completed events are **struck through**
- ✅ Highlight **weekends and holidays**
- ✅ **Tooltips** on event hover
- ✅ Smooth **modal transitions**
- ✅ Fully responsive on all screen sizes

---

<!-- 🛠️ Technologies Used -->
## 🛠 Tech Stack

- ⚛️ React (CRA)
- 🎨 Vanilla CSS (no Bootstrap or Tailwind)
- 📅 dayjs for date/time manipulation
- 💾 localStorage + static JSON
- 🚀 GitHub Pages (for deployment)

---

<!-- ⚙️ Setup Instructions -->
## 📦 Getting Started

### Clone the repository
git clone https://github.com/sylu2305/calendar-app.git
cd calendar-app


### Install dependencies
npm install

### Start the development server
npm start


📁 Folder Structure

calendar-app/
├── public/
│   ├── index.html
│   ├── events.json         # static default events
│   └── calendar-icon.png   # optional for notifications
├── src/
│   ├── components/
│   │   ├── Calendar.js
│   │   ├── CalendarHeader.js
│   │   └── DayCell.js
│   ├── styles/
│   │   └── calendar.css
│   ├── App.js
│   └── index.js
├── README.md
├── package.json
