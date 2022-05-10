import { vec2add } from '@trufi/utils';

const canvas = document.createElement('canvas');

const size = [700, 700];
canvas.width = size[0];
canvas.height = size[1];
canvas.style.width = `${size[0]}px`;
canvas.style.height = `${size[1]}px`;
canvas.style.border = `1px solid`;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

interface Circle {
    coords: number[];
    radius: number;
}

interface Box {
    coords: number[];
    w: number;
    h: number;
}

// const a: Box = {
//     coords: [100, -70],
//     w: 60,
//     h: 30,
// };

const a: Circle = {
    coords: [100, -70],
    radius: 30,
};

const b: Circle = {
    coords: [100, 70],
    radius: 30,
};
// const b: Box = {
//     coords: [100, 70],
//     w: 30,
//     h: 60,
// };

const aRevereted = revertFigure(a);

drawDot([0, 0]);

ctx.fillStyle = '#ff0000';
figureFor(a, drawDot);

ctx.fillStyle = '#00ff00';
figureFor(aRevereted, drawDot);

ctx.fillStyle = '#0000ff';
figureFor(b, drawDot);

ctx.fillStyle = '#ff00ff';
const sum = [0, 0];
figureFor(b, (coordsB) =>
    figureFor(aRevereted, (coordsAR) => {
        vec2add(sum, coordsB, coordsAR);
        drawDot(sum);
    }),
);

function drawDot(coords: number[]) {
    const r = 2;
    ctx.fillRect(
        coords[0] - r / 2 + 0.5 + size[0] / 2,
        size[1] - (coords[1] - r / 2 + 0.5 + size[1] / 2),
        r,
        r,
    );
}

function figureFor(f: Circle | Box, cb: (coords: number[]) => void) {
    if (isCircle(f)) {
        circleFor(f, cb);
    } else {
        boxFor(f, cb);
    }
}

function circleFor(c: Circle, cb: (coords: number[]) => void) {
    const n = 18;
    const rn = 3;
    for (let i = 0; i < n; i++) {
        const angle = ((Math.PI * 2) / n) * i;
        for (let r = 1; r <= rn; r++) {
            const radius = (c.radius * r) / rn;
            const coords = [
                c.coords[0] + radius * Math.cos(angle),
                c.coords[1] + radius * Math.sin(angle),
            ];
            cb(coords);
        }
    }
}

function boxFor(c: Box, cb: (coords: number[]) => void) {
    const n = 1;
    for (let x = 0; x <= n; x++) {
        for (let y = 0; y <= n; y++) {
            const coords = [c.coords[0] + (c.w / n) * x, c.coords[1] + (c.h / n) * y];
            cb(coords);
        }
    }
}

function revertFigure(f: Circle | Box) {
    const coords = [-f.coords[0], -f.coords[1]];
    if (isCircle(f)) {
        const c: Circle = {
            coords,
            radius: f.radius,
        };
        return c;
    }

    const b: Box = {
        coords,
        w: f.w,
        h: f.h,
    };
    return b;
}

function isCircle(f: Circle | Box): f is Circle {
    return 'radius' in f;
}
