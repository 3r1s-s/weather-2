export function drawMoon(phase) {
    const canvas = document.getElementById('moonCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = (w / 2) - 2;

    ctx.fillStyle = "#1e293b10";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Logic: 0 = New, 0.5 = Full, 1 = New
    ctx.fillStyle = "#fffffff6";
    ctx.beginPath();

    const terminatorWidth = r * Math.cos(phase * 2 * Math.PI);
    const anticlockwise = terminatorWidth > 0;

    if (phase < 0.5) {
        // WAXING (0 to 0.5) -> Light on Right
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(cx, cy, Math.abs(terminatorWidth), r, 0, Math.PI / 2, -Math.PI / 2, anticlockwise);
    } else {
        ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2);
        ctx.ellipse(cx, cy, Math.abs(terminatorWidth), r, 0, -Math.PI / 2, Math.PI / 2, anticlockwise);
    }

    ctx.fill();
}

export function angleMoon(moon, lat) {
    const phaseRad = moon * Math.PI * 2;
    const angle = Math.sin(phaseRad) * (lat * 0.5);

    const canvas = document.getElementById('moonCanvas');
    if (canvas) {
        canvas.style.transform = `rotate(${angle}deg)`;
    }
}