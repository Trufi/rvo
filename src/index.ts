import { render } from './render';
import { createObj, update } from './simulation';

const objects = [
    createObj('A', [-50, -50], 10, [250, 250], 30),
    createObj('B', [-30, 50], 10, [250, 50], 30),
];

// const objects = [
//     createObj('A', [-150, 0], 10, [150, 0], 30),
//     createObj('B', [150, 0], 10, [-150, 0], 30),
//     createObj('C', [0, -70], 10, [0, 70], 30),
// ];

const dt = 1;

let iteration = 0;
const debug = document.querySelector('.debug') as HTMLDivElement;

document.addEventListener('keypress', (ev) => {
    if (ev.code === 'Space') {
        iteration++;
        update(objects, dt);
        render(objects, dt);
        debug.innerHTML = `iteration: ${iteration}`;
    }
});

render(objects, dt);
