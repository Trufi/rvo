import { vec2angle, vec2create, vec2dist, vec2sub } from '@trufi/utils';

type Vec = number[];

export interface Obj {
    position: Vec;
    maxVelocity: number;
    targetPosition: Vec;
    radius: number;
    name: string;
    velocity: Vec;
    potentialVelocities: number[][];
    checkedVelocities: Array<{ velocity: number[]; ok: boolean }>;
    rvo: boolean;
}

export function createObj(
    name: string,
    position: Vec,
    maxVelocity: number,
    targetPosition: Vec,
    radius: number,
    rvo = true,
): Obj {
    return {
        name,
        position,
        maxVelocity,
        targetPosition,
        radius,
        velocity: [0, 0],
        potentialVelocities: [],
        checkedVelocities: [],
        rvo,
    };
}

export function update(objects: Obj[], dt: number) {
    for (const a of objects) {
        if (a.rvo) {
            updateObj(a, objects);
        } else {
            const velocities = velocitiesSample(a);
            a.potentialVelocities = velocities;
            a.velocity = velocities[0];
        }
    }

    for (const a of objects) {
        updatePosition(a, dt);
    }
}

function updateObj(a: Obj, objects: Obj[]) {
    const velocities = velocitiesSample(a);
    a.potentialVelocities = velocities;

    a.checkedVelocities = [];

    for (const b of objects) {
        if (a === b) {
            continue;
        }

        for (const potentialVelocity of velocities) {
            const withinRVO = inRVO(potentialVelocity, a, b);

            a.checkedVelocities.push({ velocity: potentialVelocity, ok: !withinRVO });

            if (!withinRVO) {
                a.velocity = potentialVelocity;
                return;
            }
        }
    }
}

function updatePosition(a: Obj, dt: number) {
    a.position[0] = a.position[0] + a.velocity[0] * dt;
    a.position[1] = a.position[1] + a.velocity[1] * dt;
}

function velocitiesSample(a: Obj) {
    const n = 5;
    const rn = 2;

    const directionVec = vec2create();
    vec2sub(directionVec, a.targetPosition, a.position);
    const direction = vec2angle(directionVec);
    const result: number[][] = [];

    for (let i = 0; i < n; i++) {
        const angle = (Math.PI / n) * i;
        for (let r = rn; r > 0; r--) {
            const radius = (a.maxVelocity * r) / rn;

            const rightAngle = direction + angle;
            result.push([radius * Math.cos(rightAngle), radius * Math.sin(rightAngle)]);

            if (i > 0) {
                const leftAngle = direction - angle;
                result.push([radius * Math.cos(leftAngle), radius * Math.sin(leftAngle)]);
            }
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
