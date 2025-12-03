import { openModal } from "./modals.js";
import { settings } from "./storage.js";

export function openSettings() {
    const currentUnits = {
        temp: settings.get('unit_temp') || 'c',
        speed: settings.get('unit_speed') || 'kmh',
        dist: settings.get('unit_dist') || 'km',
        press: settings.get('unit_press') || 'hpa',
        precip: settings.get('unit_precip') || 'mm'
    };

    openModal({
        title: "Settings",
        body: `
            <span class="modal-subheader">Temperature</span>
            <div class="unit-toggle" id="unit-temperature">
                <div class="unit-toggle-button ${currentUnits.temp === 'c' ? 'enabled' : ''}" data-type="unit_temp" data-value="c">C°</div>
                <div class="unit-toggle-button ${currentUnits.temp === 'f' ? 'enabled' : ''}" data-type="unit_temp" data-value="f">F°</div>
            </div>

            <span class="modal-subheader">Wind Speed</span>
            <div class="unit-toggle" id="unit-speed">
                <div class="unit-toggle-button ${currentUnits.speed === 'kmh' ? 'enabled' : ''}" data-type="unit_speed" data-value="kmh">km/h</div>
                <div class="unit-toggle-button ${currentUnits.speed === 'mph' ? 'enabled' : ''}" data-type="unit_speed" data-value="mph">mph</div>
                <div class="unit-toggle-button ${currentUnits.speed === 'knots' ? 'enabled' : ''}" data-type="unit_speed" data-value="knots">knots</div>
            </div>

            <span class="modal-subheader">Distance</span>
            <div class="unit-toggle" id="unit-distance">
                <div class="unit-toggle-button ${currentUnits.dist === 'km' ? 'enabled' : ''}" data-type="unit_dist" data-value="km">km</div>
                <div class="unit-toggle-button ${currentUnits.dist === 'mi' ? 'enabled' : ''}" data-type="unit_dist" data-value="mi">mi</div>
            </div>

            <span class="modal-subheader">Pressure</span>
            <div class="unit-toggle" id="unit-pressure">
                <div class="unit-toggle-button ${currentUnits.press === 'hpa' ? 'enabled' : ''}" data-type="unit_press" data-value="hpa">hPa</div>
                <div class="unit-toggle-button ${currentUnits.press === 'inhg' ? 'enabled' : ''}" data-type="unit_press" data-value="inhg">inHg</div>
            </div>

            <span class="modal-subheader">Precipitation</span>
            <div class="unit-toggle" id="unit-precipitation">
                <div class="unit-toggle-button ${currentUnits.precip === 'mm' ? 'enabled' : ''}" data-type="unit_precip" data-value="mm">mm</div>
                <div class="unit-toggle-button ${currentUnits.precip === 'in' ? 'enabled' : ''}" data-type="unit_precip" data-value="in">in</div>
            </div>

            <div class="setting">
                <label for="fancy-animation">
                    <span class="setting-label">Fancy Animation</span>
                    <eui-switch id="fancy-animation" ${settings.get('fancy_animation') ? 'checked' : ''}></eui-switch>
                </label>
            </div>

        `,
        edge: true,
    });

    setTimeout(() => {
        const toggles = document.querySelectorAll('.unit-toggle-button');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const type = toggle.dataset.type;
                const value = toggle.dataset.value;

                settings.set(type, value);

                const siblings = toggle.parentElement.querySelectorAll('.unit-toggle-button');
                siblings.forEach(sib => sib.classList.remove('enabled'));
                toggle.classList.add('enabled');

                window.dispatchEvent(new CustomEvent('settings-changed'));
            });
        });
    }, 50);
}