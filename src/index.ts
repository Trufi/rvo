import { GUI } from 'dat.gui';
import { render } from './render';
import { createObj, Obj, simulate } from './simulation';

const scenarios: { [key: string]: () => Obj[] } = {
    '2 diagonal': () => [
        createObj('A', [-50, -50], 10, [250, 250], 30),
        createObj('B', [-70, 50], 10, [250, 50], 30),
    ],
    '2 opposite': () => [
        createObj('A', [-150, 0], 10, [150, 0], 30),
        createObj('B', [150, 0], 10, [-150, 0], 30),
    ],
    '3': () => [
        createObj('A', [-150, 0], 10, [150, 0], 30),
        createObj('B', [150, 0], 10, [-150, 0], 30),
        createObj('C', [0, -70], 10, [0, 70], 30),
    ],
    circles: () => {
        const objects: Obj[] = [];
        const n = 10;
        const r = 250;
        for (let i = 0; i < n; i++) {
            const angle = ((Math.PI * 2) / n) * i;
            const position = [r * Math.cos(angle), r * Math.sin(angle)];
            const targetPosition = [-r * Math.cos(angle), -r * Math.sin(angle)];
            objects.push(createObj(`${i}`, position, 10, targetPosition, 30));
        }
        return objects;
    },
    'two small - one big': () => [
        createObj('A', [-150, 30], 10, [150, 0], 30),
        createObj('B', [-150, -30], 10, [230, 0], 30),
        createObj('C', [150, 0], 10, [-150, 0], 100),
    ],
};

const config = {
    // Algorithm
    lookAtNewVelocity: true,
    visionRadius: 160,

    // Demo
    scenario: '2 opposite',
    autoUpdate: true,
    fixedTimeStep: true,
};
export type Config = typeof config;

const debug = document.querySelector('.debug') as HTMLDivElement;
let requestedFrame = 0;
let restartTimer = 0;

function start() {
    cancelAnimationFrame(requestedFrame);

    const objects = scenarios[config.scenario]();

    let iteration = 0;
    debug.innerHTML = `iteration: ${iteration}`;

    function update(dt: number) {
        iteration++;
        simulate(objects, dt, config);
        render(objects, dt, config);
        debug.innerHTML = `iteration: ${iteration}`;
    }

    document.onkeydown = () => update(1);

    render(objects, 0, config);

    if (config.autoUpdate) {
        let prevTime = Date.now();
        function loop() {
            requestedFrame = requestAnimationFrame(loop);
            const time = Date.now();
            const dt = config.fixedTimeStep ? ((time - prevTime) / 1000) * 20 : 0.2;
            update(dt);

            if (checkFinish(objects)) {
                cancelAnimationFrame(requestedFrame);
                restartTimer = setTimeout(start, 1000);
            } else {
                clearTimeout(restartTimer);
            }

            prevTime = time;
        }
        requestedFrame = requestAnimationFrame(loop);
    }
}
start();

function checkFinish(objects: Obj[]) {
    return objects.every((obj) => obj.velocity[0] === 0 && obj.velocity[1] === 0);
}

const gui = new GUI();

const algorithm = gui.addFolder('Algorithm');
algorithm.open();
algorithm.add(config, 'lookAtNewVelocity').onChange(start);
algorithm.add(config, 'visionRadius', 60, 1000).onChange(start);

const demo = gui.addFolder('Demo');
demo.open();
demo.add(config, 'scenario', Object.keys(scenarios)).onChange(start);
demo.add(config, 'autoUpdate').onChange(start);
demo.add(config, 'fixedTimeStep').onChange(start);
demo.add({ restart: () => start() }, 'restart');
