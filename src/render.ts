import { Obj } from './simulation';

const canvas = document.createElement('canvas');

const size = [700, 700];
canvas.width = size[0];
canvas.height = size[1];
canvas.style.width = `${size[0]}px`;
canvas.style.height = `${size[1]}px`;
canvas.style.border = `1px solid`;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export function render(objects: Obj[], dt: number) {
    ctx.clearRect(0, 0, size[0], size[1]);
    for (const obj of objects) {
        drawObj(obj, dt);
    }
}

function drawObj(obj: Obj, dt: number) {
    const x = obj.position[0] + size[0] / 2;
    const y = obj.position[1] + size[1] / 2;

    const r = obj.radius;

    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + obj.chosedVelocity[0] * dt, y + obj.chosedVelocity[1] * dt);
    ctx.stroke();

    ctx.strokeStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + obj.velocity[0] * dt, y + obj.velocity[1] * dt);
    ctx.stroke();

    ctx.fillText(obj.name, x - 2, y - 10);
}

// function drawObj(obj: Obj) {
//     const x = obj.position[0] + size[0] / 2;
//     const y = obj.position[1] + size[1] / 2;

//     const r = obj.radius;
//     ctx.fillRect(x - r / 2, y - r / 2, r, r);

//     ctx.fillText(obj.name, x, y);
// }
