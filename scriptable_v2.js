// Formula 1 2025 Schedule Widget
// Fetches schedule from a GitHub repo and displays the next upcoming Grand Prix with all sessions.

const GITHUB_RAW_URL = "https://raw.githubusercontent.com/abhiyt/f12025/main/f1_schedule.json";

// Fetch JSON schedule from GitHub
async function fetchSchedule() {
  let request = new Request(GITHUB_RAW_URL);
  return await request.loadJSON();
}

// Get current time
const now = new Date();

// Parse custom DD-MMM-YYYY and HH:MM to a Date object
function parseDateTime(dateStr, timeStr) {
  const [day, monthStr, year] = dateStr.split("-");
  const monthMap = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };
  const [hour, minute] = timeStr.split(":").map(Number);
  const month = monthMap[monthStr.toUpperCase()];
  return new Date(Number(year), month, Number(day), hour, minute);
}

// Find the next upcoming Grand Prix and session
async function getNextRace() {
  let schedule = await fetchSchedule();
  let upcomingRace = null;
  let nextSession = null;

  for (const race of schedule) {
    for (const session of race.sessions) {
      let sessionDate = parseDateTime(session.date, session.time);
      if (sessionDate > now) {
        upcomingRace = race;
        nextSession = { gp: race.gp, ...session, dateTime: sessionDate };
        break;
      }
    }
    if (upcomingRace) break;
  }

  return { upcomingRace, nextSession };
}

// Countdown Timer
function getCountdown(targetDate) {
  const diff = targetDate - now;
  if (diff <= 0) return "Live Now!";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

// Widget Setup
async function createWidget() {
  let { upcomingRace, nextSession } = await getNextRace();
  let widget = new ListWidget();
  widget.setPadding(15, 15, 15, 15);
  widget.backgroundColor = new Color("#000000");

  // Title
  let title = widget.addText("🏁 Formula 1 2025");
  title.font = Font.boldSystemFont(16);
  title.textColor = Color.white();
  widget.addSpacer(5);

  if (upcomingRace) {
    let gpText = widget.addText(upcomingRace.gp);
    gpText.font = Font.boldSystemFont(18);
    gpText.textColor = Color.white();
    widget.addSpacer(3);

    if (nextSession) {
      let countdownText = widget.addText(getCountdown(nextSession.dateTime));
      countdownText.font = Font.mediumSystemFont(14);
      countdownText.textColor = Color.red();
      widget.addSpacer(3);
    }

    for (const session of upcomingRace.sessions) {
      let sessionText = widget.addText(`${session.name}: ${session.date} - ${session.time}`);
      sessionText.font = Font.mediumSystemFont(14);
      sessionText.textColor = Color.blue();
    }
  } else {
    let noEventText = widget.addText("No upcoming races");
    noEventText.font = Font.mediumSystemFont(16);
    noEventText.textColor = Color.gray();
  }

  return widget;
}

// Run Widget
let widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
