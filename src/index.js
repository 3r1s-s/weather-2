const app = document.getElementById("app");
export const title = document.querySelector(".titlebar .title");

import "./components/eui-button.js";
import "./components/eui-input.js";
import "./components/eui-icon.js";
import "./components/eui-edge-scroll-blur.js";

import { WEATHER_CODES, formatHour, getWeekday, formatMoonPhase, formatWindDirection } from "./scripts/formatWeather.js";
import { getWeather, searchPlaces, getMoonPhase, reverseGeocode } from "./scripts/weatherAPI.js";
import { drawMoon, angleMoon } from "./scripts/moon.js";

import { openAlert, closeAlert } from "./scripts/modals.js"
import { storage, settings } from "./scripts/storage.js";

const main = document.querySelector(".main");
const contentOuter = document.querySelector(".content-outer");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
if (isCollapsed) {
    app.classList.add("collapsed");
}

sidebarToggle.addEventListener("click", () => {
    app.classList.toggle("collapsed");
    localStorage.setItem("sidebar-collapsed", app.classList.contains("collapsed"));
});

contentOuter.addEventListener("scroll", () => {
    if (contentOuter.scrollTop > 30) {
        app.querySelector(".titlebar").classList.remove("hide");
    } else {
        app.querySelector(".titlebar").classList.add("hide");
    }
})

const searchInput = document.querySelector(".search-input input");
const searchResults = document.querySelector(".search-results");

let searchTimeout;
let currentFocus = -1;

searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;

    if (!query) {
        closeAllLists();
        return;
    }

    searchTimeout = setTimeout(async () => {
        const results = await searchPlaces(query);
        renderResults(results);
    }, 300);
});

searchInput.addEventListener("keydown", (e) => {
    const items = searchResults.querySelectorAll(".search-result-item");
    if (e.key === "ArrowDown") {
        event.preventDefault();
        currentFocus++;
        addActive(items);
    } else if (e.key === "ArrowUp") {
        event.preventDefault();
        currentFocus--;
        addActive(items);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1) {
            if (items) items[currentFocus].click();
        } else if (items.length > 0) {
            items[0].click();
        }
    } else if (e.key === "Escape") {
        closeAllLists();
    }
});

function addActive(items) {
    if (!items || items.length === 0) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("active");
    items[currentFocus].scrollIntoView({ block: "nearest" });
}

function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("active");
    }
}

function closeAllLists() {
    searchResults.innerHTML = "";
    currentFocus = -1;
}

function renderResults(results) {
    closeAllLists();
    if (!results.length) return;

    results.forEach((result) => {
        const div = document.createElement("div");
        div.classList.add("search-result-item");

        const details = [result.admin1, result.country].filter(Boolean).join(", ");

        div.innerHTML = `
            <span class="place-name">${result.name}</span>
            <span class="place-detail">${details}</span>
        `;
        div.addEventListener("click", () => {
            weatherPage(result);
            closeAllLists();
            searchInput.value = "";
        });
        searchResults.appendChild(div);
    });
}

document.addEventListener("click", (e) => {
    if (e.target !== searchInput && !searchResults.contains(e.target)) {
        closeAllLists();
    }
});

let currentDisplayedPlace = null;
let savedPlaces = storage.get('places') || [];
let savedCurrentLocation = storage.get('currentLocation');

let renderId = 0;

async function renderSidebar() {
    const currentId = ++renderId;
    const placesContainer = document.querySelector(".places");
    // Don't clear immediately to avoid flickering/empty state during fetch
    // placesContainer.innerHTML = ""; 

    const placesToRender = [];

    if (savedCurrentLocation) {
        placesToRender.push({ ...savedCurrentLocation, isCurrentLocation: true });
    }

    placesToRender.push(...savedPlaces);

    try {
        // Fetch all weather data in parallel
        const weatherPromises = placesToRender.map(place =>
            getWeather({ latitude: place.lat, longitude: place.lon, name: place.name })
                .then(data => ({ place, data }))
                .catch(error => {
                    console.error("Failed to fetch weather for sidebar place:", place, error);
                    return null;
                })
        );

        const results = await Promise.all(weatherPromises);

        // Check if a new render has started since we began
        if (currentId !== renderId) return;

        placesContainer.innerHTML = "";
        const fragment = document.createDocumentFragment();

        results.forEach((result, index) => {
            if (!result) return; // Skip failed fetches
            const { place, data } = result;
            const weather = data.current;
            const daily = data.daily;

            const high = daily.max ? Math.round(daily.max[0]) : '--';
            const low = daily.min ? Math.round(daily.min[0]) : '--';
            const currentTemp = Math.round(weather.temp);
            const weatherType = WEATHER_CODES[weather.code] || "Unknown";

            const timeStr = new Date(weather.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

            const isLatMatch = currentDisplayedPlace && Math.abs(parseFloat(place.lat) - parseFloat(currentDisplayedPlace.lat)) < 0.001;
            const isLonMatch = currentDisplayedPlace && Math.abs(parseFloat(place.lon) - parseFloat(currentDisplayedPlace.lon)) < 0.001;
            const isActive = isLatMatch && isLonMatch;

            const div = document.createElement("div");
            div.className = "place-outer";
            div.innerHTML = `
                <div class="place ${isActive ? 'active' : ''}" data-lat="${place.lat}" data-lon="${place.lon}">
                    <div class="place-info">
                        <div>
                            <span class="place-title">${place.isCurrentLocation ? 'Current Location' : place.name}</span>
                            <span class="place-time plus">${timeStr}</span>
                        </div>
                        <div class="place-weather-outer">
                            <span class="place-weather">${weatherType}</span>
                        </div>
                    </div>
                    <div class="place-temp">
                        <span class="place-temp-title">
                            <span class="degrees">${currentTemp}</span>
                            <span>°</span>
                        </span>
                        <div class="place-temp-high-low">
                            <span class="place-temp-high">H: ${high}º</span>
                            <span class="place-temp-low">L: ${low}º</span>
                        </div>
                    </div>
                </div>
                ${!place.isCurrentLocation ? `
                <div class="place-remove">
                    <eui-icon name="delete"></eui-icon>
                </div>` : ''}
            `;

            const placeInner = div.querySelector(".place");
            placeInner.addEventListener("click", () => {
                weatherPage(place);
            });

            if (!place.isCurrentLocation) {
                const removeBtn = div.querySelector(".place-remove");
                removeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    removePlace(index - (savedCurrentLocation ? 1 : 0));
                });
            }

            fragment.appendChild(div);
        });

        placesContainer.appendChild(fragment);

    } catch (error) {
        console.error("Error rendering sidebar:", error);
    }
}

function updateActiveSidebarItem() {
    if (!currentDisplayedPlace) return;

    const allPlaces = document.querySelectorAll(".sidebar .place");
    allPlaces.forEach(p => {
        const lat = parseFloat(p.dataset.lat);
        const lon = parseFloat(p.dataset.lon);
        const currentLat = parseFloat(currentDisplayedPlace.lat);
        const currentLon = parseFloat(currentDisplayedPlace.lon);

        if (Math.abs(lat - currentLat) < 0.001 && Math.abs(lon - currentLon) < 0.001) {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });
}

function addPlace() {
    if (!currentDisplayedPlace) return;

    const exists = savedPlaces.some(p => p.lat === currentDisplayedPlace.lat && p.lon === currentDisplayedPlace.lon);
    if (exists) return;

    if (savedCurrentLocation && savedCurrentLocation.lat === currentDisplayedPlace.lat && savedCurrentLocation.lon === currentDisplayedPlace.lon) return;

    savedPlaces.push({
        name: currentDisplayedPlace.name,
        lat: currentDisplayedPlace.lat,
        lon: currentDisplayedPlace.lon,
        admin1: currentDisplayedPlace.admin1,
        country: currentDisplayedPlace.country
    });
    storage.set('places', savedPlaces);
    renderSidebar();
}

function removePlace(index) {
    savedPlaces.splice(index, 1);
    storage.set('places', savedPlaces);
    renderSidebar();
}

document.querySelector(".add-place").addEventListener("click", addPlace);

function weatherPage(nameOrObj) {
    const g = document.querySelector(".content-outer");
    const t = document.querySelector(".titlebar");
    g.classList.add("out");
    t.classList.add("transition");

    if (typeof nameOrObj === 'object' && (nameOrObj.lat || nameOrObj.latitude)) {
        const tempPlace = {
            ...nameOrObj,
            lat: nameOrObj.lat || nameOrObj.latitude,
            lon: nameOrObj.lon || nameOrObj.longitude
        };
        currentDisplayedPlace = tempPlace;
        updateActiveSidebarItem();
    }

    getWeather(nameOrObj).then(data => {
        const result = data.results[0];
        currentDisplayedPlace = result;

        const weather = data.current;
        const daily = data.daily;
        const hourly = data.hourly;

        const wk = document.getElementById("week");
        wk.innerHTML = daily.time.map((day, i) => `
            <div class="forecast-day">
                <div>${getWeekday(day)}</div>
                <div>${WEATHER_CODES[daily.code[i]]}</div>
                <div>${daily.max[i]}° / ${daily.min[i]}°</div>
            </div>
        `).join("");

        const currentHourStr = weather.time.slice(0, 13);
        const startIndex = hourly.time.findIndex(t => t.slice(0, 13) === currentHourStr);

        const safeIndex = startIndex !== -1 ? startIndex : 0;
        const forecastHours = hourly.time.slice(safeIndex, safeIndex + 24);

        const forecast = document.getElementById("forecast");
        forecast.innerHTML = forecastHours.map((hour, i) => {
            const temp = hourly.temp[safeIndex + i];

            return `
            <div class="forecast-hour">
                <span class="forcast-temp">${Math.round(temp)}<span class="symbol">º</span></span>
                <span class="forecast-time">${formatHour(hour)}</span>
            </div>
        `}).join("");

        const currentTemp = weather.temp;
        document.getElementById("temperature").textContent = `${Math.round(currentTemp)}`;

        title.textContent = `${result.name}`;
        document.getElementById("placename-full").textContent = result.full;
        document.getElementById("place-title").textContent = result.name;

        const typeEl = document.getElementById("weather-flavor");
        const weatherType = WEATHER_CODES[weather.code] || "Unknown";
        if (typeEl) typeEl.textContent = weatherType;

        document.getElementById("pressure").innerHTML = `<span class="card-name">Pressure</span><span class="card-value">${Math.round(weather.pressure)}</span><span class="card-unit">hPa</span>`;
        document.getElementById("humidity").innerHTML = `<span class="card-name">Humidity</span><span class="card-value">${weather.humidity}%</span><span class="card-unit">Rh</span>`;
        document.getElementById("wind").innerHTML = `<span class="card-name">Wind</span><span class="card-value">${Math.round(weather.wind_speed)} ${formatWindDirection(weather.wind_dir)}</span><span class="card-unit">km/h</span>`;
        document.getElementById("visibility").innerHTML = `<span class="card-name">Visibility</span><span class="card-value">${(weather.visibility / 1000).toFixed(1)}</span><span class="card-unit">km</span>`;
        document.getElementById("precipitation").innerHTML = `<span class="card-name">Precipitation</span><span class="card-value">${weather.precipitation.toFixed(1)}</span><span class="card-unit">mm/h</span>`;
        document.getElementById("heat-index").innerHTML = `<span class="card-name">Feels like</span><span class="card-value">${Math.round(weather.feels_like)}<span class="symbol">º</span></span><span class="card-unit">C°</span>`;
        document.getElementById("dewpoint").innerHTML = `<span class="card-name">Dewpoint</span><span class="card-value">${Math.round(weather.dewpoint)}<span class="symbol">º</span></span><span class="card-unit">C°</span>`;

        const sunriseTime = daily.sunrise[0];
        const sunsetTime = daily.sunset[0];


        if (daily.max) {
            const high = Math.round(daily.max[0]);
            const low = Math.round(daily.min[0]);
            document.getElementById("high-low").innerHTML = `<span>H: <span class="high">${high}°</span></span><span>L: <span class="low">${low}°</span></span>`;
        }

        document.getElementById("sunrise").innerHTML = `<span class="card-name">Sunrise</span><span class="card-value">${formatHour(sunriseTime)}</span>`;
        document.getElementById("sunset").innerHTML = `<span class="card-name">Sunset</span><span class="card-value">${formatHour(sunsetTime)}</span>`;

        let moon = getMoonPhase(new Date());

        let illumination;
        if (moon <= 0.5) {
            illumination = moon * 2 * 100;
        } else {
            illumination = (1 - moon) * 2 * 100;
        }
        document.getElementById("moon").innerHTML = `
        <div class="info-half">
            <span class="card-name">Moon phase</span>
            <span class="card-value">${Math.round(illumination)}%</span>
            <span class="card-unit">${formatMoonPhase(moon)}</span>
        </div>
        <div class="icon-half">
            <canvas id="moonCanvas" width="500" height="500"></canvas>
        </div>
        `;

        drawMoon(moon);
        angleMoon(moon, result.lat);
        setBackground(weather.code, weather.time, daily.sunrise[0], daily.sunset[0]);
        g.classList.remove("out");
        setTimeout(() => {
            t.classList.remove("transition");
        }, 50);

        // Update sidebar active state
        updateActiveSidebarItem();
    })
}

function setBackground(code, currentTime, sunriseTime, sunsetTime) {
    const bg = document.querySelector(".background");

    const currentStyle = window.getComputedStyle(bg).backgroundImage;
    bg.style.setProperty("--old-background", currentStyle);

    bg.classList.add("switching");

    bg.offsetHeight;

    document.body.className = "";

    // if (code > 3) {
    //     bg.classList.remove("switching");
    //     return;
    // }

    const now = new Date(currentTime).getTime();
    const rise = new Date(sunriseTime).getTime();
    const set = new Date(sunsetTime).getTime();

    const minute = 60 * 1000;
    const dawnDuration = 45 * minute;
    const sunriseDuration = 30 * minute;
    const sunsetDuration = 45 * minute;
    const duskDuration = 45 * minute;

    if (now >= rise - dawnDuration && now < rise) {
        document.body.classList.add("dawn");
    }
    else if (now >= rise && now < rise + sunriseDuration) {
        document.body.classList.add("sunrise");
    }
    else if (now >= rise + sunriseDuration && now < set - sunsetDuration) {
        document.body.classList.add("day");
    }
    else if (now >= set - sunsetDuration && now < set) {
        document.body.classList.add("sunset");
    }
    else if (now >= set && now < set + duskDuration) {
        document.body.classList.add("dusk");
    }
    else {
        document.body.classList.add("night");
    }

    // 45 - 67
    if (code >= 45 && code <= 67) {
        document.body.classList.add("rain");
    }

    bg.classList.remove("switching");
}

function askForLocation() {
    openAlert({
        title: "Use your location",
        message: "Grant location access to see current weather conditions for your area. Your location will be saved.",
        buttons: [
            {
                text: "OK",
                action: async () => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const lat = position.coords.latitude;
                                const lon = position.coords.longitude;

                                let locationData = {
                                    name: "Current Location",
                                    lat: lat,
                                    lon: lon,
                                    admin1: "",
                                    country: ""
                                };

                                try {
                                    const reversed = await reverseGeocode(lat, lon);
                                    if (reversed) {
                                        locationData = {
                                            name: reversed.name,
                                            lat: reversed.latitude,
                                            lon: reversed.longitude,
                                            admin1: reversed.admin1,
                                            country: reversed.country
                                        };
                                    }
                                } catch (e) {
                                    console.error("Reverse geocoding failed", e);
                                }

                                savedCurrentLocation = locationData;
                                storage.set('currentLocation', savedCurrentLocation);
                                weatherPage(savedCurrentLocation);
                                renderSidebar();
                            },
                            (error) => {
                                console.error("Error getting location:", error);
                                closeAlert();
                                openAlert({
                                    title: "Error getting location",
                                    message: "Please try again later",
                                    type: "error"
                                })
                            }
                        );
                    }
                    closeAlert();
                }
            },
            {
                text: "Cancel",
                action: () => {
                    closeAlert();
                }
            }
        ],
        center: true
    });
}

// Initial load
if (savedCurrentLocation) {
    weatherPage(savedCurrentLocation);
} else {
    weatherPage("Phoenix");
    setTimeout(askForLocation, 1000);
}

renderSidebar();