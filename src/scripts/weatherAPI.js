const tempTitle = document.getElementById("temperature");
const placeTitle = document.getElementById("place-title");

export async function getWeather(location) {
    let result;
    if (typeof location === 'string') {
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
        const geo = await fetch(geoURL).then(r => r.json());

        if (!geo.results || geo.results.length === 0) {
            placeTitle.textContent = "Location not found";
            tempTitle.textContent = "";
            return;
        }
        result = geo.results[0];
    } else {
        result = location;
    }

    const lat = result.latitude || result.lat;
    const lon = result.longitude || result.lon;

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,is_day,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,dew_point_2m,visibility,precipitation` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
        `&timezone=auto&models=best_match`;

    const weather = await fetch(weatherURL).then(r => r.json());

    const wcode = weather.current.weather_code;

    const data = {
        current: {
            temp: weather.current.temperature_2m,
            code: weather.current.weather_code,
            precip: weather.current.precipitation_probability,
            time: weather.current.time,

            humidity: weather.current.relative_humidity_2m,
            feels_like: weather.current.apparent_temperature,
            pressure: weather.current.pressure_msl,
            wind_speed: weather.current.wind_speed_10m,
            wind_dir: weather.current.wind_direction_10m,
            dewpoint: weather.current.dew_point_2m,
            visibility: weather.current.visibility,
            precipitation: weather.current.precipitation,
        },
        hourly: {
            time: weather.hourly.time,
            temp: weather.hourly.temperature_2m,
            code: weather.hourly.weather_code,
            precip: weather.hourly.precipitation_probability
        },
        daily: {
            time: weather.daily.time,
            code: weather.daily.weather_code,
            max: weather.daily.temperature_2m_max,
            min: weather.daily.temperature_2m_min,
            sunrise: weather.daily.sunrise,
            sunset: weather.daily.sunset,
        },
        results: [
            {
                name: result.name,
                full: `${result.name}, ${result.admin1}, ${result.country}`,
                lat: result.latitude || result.lat,
                lon: result.longitude || result.lon,
                admin1: result.admin1,
                country: result.country
            }
        ]
    }

    return data;
}

export async function searchPlaces(query) {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
    const geo = await fetch(geoURL).then(r => r.json());
    return geo.results || [];
}

export async function reverseGeocode(lat, lon) {
    // Using OpenStreetMap Nominatim API
    const geoURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    try {
        const response = await fetch(geoURL, {
            headers: {
                'User-Agent': 'WeatherApp/1.0'
            }
        });
        const data = await response.json();

        if (data.address) {
            return {
                name: data.address.city || data.address.town || data.address.village || data.address.hamlet || "Unknown Location",
                country: data.address.country,
                admin1: data.address.state || data.address.region || "",
                latitude: parseFloat(data.lat),
                longitude: parseFloat(data.lon)
            };
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
}

export function getMoonPhase(date) {
    // Reference date: January 11, 2024
    const referenceDate = new Date('2024-01-11');

    const diffTime = date - referenceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const lunarCycle = 29.53059;

    const moonPhase = (diffDays % lunarCycle) / lunarCycle;

    return moonPhase;
}