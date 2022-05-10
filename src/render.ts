import type { Config } from '.';
import type { Obj } from './simulation';

const canvas = document.createElement('canvas');

const size = [700, 700];
canvas.width = size[0];
canvas.height = size[1];
canvas.style.width = `${size[0] / window.devicePixelRatio}px`;
canvas.style.height = `${size[1] / window.devicePixelRatio}px`;
canvas.style.border = `1px solid`;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export function render(objects: Obj[], dt: number, config: Config) {
    ctx.clearRect(0, 0, size[0], size[1]);

    ctx.fillStyle = '#000000';
    point(size[0] / 2, size[1] / 2, 3);

    for (const obj of objects) {
        drawObj(obj, dt, config);
    }
}

function drawObj(obj: Obj, dt: number, config: Config) {
    const x = obj.position[0] + size[0] / 2;
    const y = obj.position[1] + size[1] / 2;

    ctx.strokeStyle = '#aaa';
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.arc(x, y, config.visionRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const c of obj.checkedVelocities) {
        ctx.fillStyle = c.ok ? '#00ff00' : '#ff0000';
        point(x + c.velocity[0] * dt, y + c.velocity[1], 2);
    }

    ctx.strokeStyle = '#666';
    ctx.beginPath();
    ctx.arc(x, y, obj.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0000ff';
    ctx.fillText(obj.name, x - 2, y - 10);

    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + obj.velocity[0] * dt, y + obj.velocity[1] * dt);
    ctx.stroke();

    const tp = [obj.targetPosition[0] + size[0] / 2, obj.targetPosition[1] + size[1] / 2];
    point(tp[0], tp[1], 2);
    ctx.fillText(obj.name, tp[0] - 2, tp[1] - 10);
}

function point(x: number, y: number, r: number) {
    ctx.fillRect(x - r / 2, y - r / 2, r, r);
}
