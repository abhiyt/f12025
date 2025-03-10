const GITHUB_RAW_URL = "https://raw.githubusercontent.com/abhiyt/f12025/main/f1_schedule.json";

async function getNextSession() {
  const response = await fetch(GITHUB_RAW_URL);
  const schedule = await response.json();
  const now = new Date();
  let nextSession = null;

  for (const race of schedule) {
    for (const session of race.sessions) {
      let sessionDate = new Date(`${session.date}T${session.time}:00`);
      if (sessionDate > now) {
        nextSession = { gp: race.gp, ...session, dateTime: sessionDate };
        break;
      }
    }
    if (nextSession) break;
  }

  return {
    session: nextSession
      ? { 
          gp: nextSession.gp, 
          name: nextSession.name, 
          date: nextSession.date, 
          time: nextSession.time, 
          countdown: getCountdown(nextSession.dateTime)
        }
      : { message: "No upcoming events" },

    // UI Configuration
    ui: {
      title: "🏁 Formula 1 2025",
      backgroundColor: "#EFEFEF",
      fontColors: {
        title: "#000000",
        countdown: "#FF0000",
        gp: "#000000",
        session: "#0000FF",
        date: "#555555",
        noEvent: "#808080"
      },
      fontSizes: {
        title: 16,
        countdown: 14,
        gp: 18,
        session: 16,
        date: 14,
        noEvent: 16
      }
    }
  };
}

// Countdown Timer
function getCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return "Live Now!";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

// Expose as JSON response
(async () => {
  console.log(JSON.stringify(await getNextSession()));
})();
