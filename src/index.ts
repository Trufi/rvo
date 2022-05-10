import { render } from './render';
import { createObj, update } from './simulation';

const objects = [createObj('A', [-50, -50], [10, 10], 30), createObj('B', [-50, 50], [10, 0], 30)];

// let now = 0;

const dt = 1;

document.addEventListener('keypress', (ev) => {
    if (ev.code === 'Space') {
        update(objects, dt);
        render(objects, dt);
    }
});

render(objects, dt);
