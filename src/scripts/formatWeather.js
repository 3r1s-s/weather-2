export const WEATHER_CODES = {
    0: "Clear",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Rime Fog",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rain",
    63: "Rain",
    65: "Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Rain",
    81: "Moderate Rain",
    82: "Heavy Rain",
    85: "Light Snow",
    86: "Heavy Snow",
    95: "Thunderstorm",
    96: "Hail",
    99: "Hail",
};

export function formatHour(ts) {
    const d = new Date(ts);
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";

    // convert 0 → 12 and 13..23 → 1..11
    h = h % 12;
    if (h === 0) h = 12;

    return `${h}${ampm}`;
}

export function getWeekday(ts) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Split YYYY-MM-DD to use local time constructor, avoiding UTC midnight shift
    const parts = ts.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return days[d.getDay()];
}

export function formatWindDirection(deg) {
    if (deg > 337.5 || deg <= 22.5) return "N";
    if (deg > 22.5 && deg <= 67.5) return "NE";
    if (deg > 67.5 && deg <= 112.5) return "E";
    if (deg > 112.5 && deg <= 157.5) return "SE";
    if (deg > 157.5 && deg <= 202.5) return "S";
    if (deg > 202.5 && deg <= 247.5) return "SW";
    if (deg > 247.5 && deg <= 292.5) return "W";
    if (deg > 292.5 && deg <= 337.5) return "NW";
    return "";
}

export function formatMoonPhase(phase) {
    if (phase < 0.03 || phase >= 0.97) return "New Moon";
    if (phase < 0.22) return "Waxing Crescent";
    if (phase < 0.28) return "First Quarter";
    if (phase < 0.47) return "Waxing Gibbous";
    if (phase < 0.53) return "Full Moon";
    if (phase < 0.72) return "Waning Gibbous";
    if (phase < 0.78) return "Last Quarter";
    if (phase < 0.97) return "Waning Crescent";
    return "Unknown Phase";
}
