import { vec2angle, vec2create, vec2dist, vec2length, vec2sub } from '@trufi/utils';

type Vec = number[];

export interface Obj {
    position: Vec;
    velocity: Vec;
    radius: number;
    name: string;

    chosedVelocity: Vec;
}

export function createObj(name: string, position: Vec, velocity: Vec, radius: number): Obj {
    return { name, position, velocity, radius, chosedVelocity: [0, 0] };
}

export function update(objects: Obj[], dt: number) {
    for (const a of objects) {
        updateObj(a, objects, dt);
    }
}

function updateObj(a: Obj, objects: Obj[], dt: number) {
    // updatePosition(a, a.velocity, dt);
    // return;

    const velocities = velocitiesSample(a);

    // a.chosedVelocity = velocities[0];

    for (const b of objects) {
        if (a === b) {
            continue;
        }

        for (const potentialVelocity of velocities) {
            if (!inRVO(potentialVelocity, a, b)) {
                a.chosedVelocity = potentialVelocity;
                updatePosition(a, potentialVelocity, dt);
                return;
            }
        }
    }
}

function updatePosition(a: Obj, finalVelocity: Vec, dt: number) {
    a.position[0] = a.position[0] + finalVelocity[0] * dt;
    a.position[1] = a.position[1] + finalVelocity[1] * dt;
}

function velocitiesSample(a: Obj) {
    const n = 8;
    const rn = 3;

    const maxVelocity = vec2length(a.velocity);
    const direction = vec2angle(a.velocity);

    const result: number[][] = [];

    for (let i = 0; i < n; i++) {
        const angle = direction + ((Math.PI * 2) / n) * i;
        for (let r = rn; r > 0; r--) {
            const radius = (maxVelocity * r) / rn;
            const position = [radius * Math.cos(angle), radius * Math.sin(angle)];
            result.push(position);
        }
    }
    return result;
}

function inRVO(potentialVelocityA: Vec, a: Obj, b: Obj) {
    const radius = a.radius + b.radius;

    const dirAtoB = vec2create();
    vec2sub(dirAtoB, b.position, a.position);

    const dist = vec2dist(a.position, b.position);
    const maxAngle = Math.abs(Math.asin(radius / dist));

    const relativeVelocity = [0, 0];
    vec2sub(relativeVelocity, potentialVelocityA, b.velocity);

    const alpha = Math.abs(angle(relativeVelocity, dirAtoB));

    return alpha < maxAngle;
}

function angle(a: number[], b: number[]) {
    let x1 = a[0];
    let y1 = a[1];
    let x2 = b[0];
    let y2 = b[1];
    // mag is the product of the magnitudes of a and b
    let mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2));
    // mag &&.. short circuits if mag == 0
    let cosine = mag && (x1 * x2 + y1 * y2) / mag;
    // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
