import { vec2angle, vec2copy, vec2create, vec2dist, vec2rotation, vec2sub } from '@trufi/utils';
import type { Config } from '.';

type Vec = number[];

export interface Obj {
    position: Vec;
    maxVelocity: number;
    targetPosition: Vec;
    radius: number;
    name: string;
    velocity: Vec;
    finalVelocity: Vec;
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
        finalVelocity: [0, 0],
    };
}

export function simulate(objects: Obj[], dt: number, config: Config) {
    for (const a of objects) {
        a.potentialVelocities = [];
        a.checkedVelocities = [];
        a.finalVelocity = [0, 0];

        if (vec2dist(a.position, a.targetPosition) < a.maxVelocity * dt) {
            continue;
        }

        if (a.rvo) {
            updateObj(a, objects, config);
        } else {
            const velocities = velocitiesSample(a);
            a.potentialVelocities = velocities;
            a.velocity = velocities[0];
        }
    }

    for (const a of objects) {
        if (vec2dist(a.position, a.targetPosition) < a.maxVelocity * dt) {
            vec2copy(a.position, a.targetPosition);
            a.velocity = [0, 0];
        } else {
            a.velocity = a.finalVelocity;
            a.position[0] = a.position[0] + a.velocity[0] * dt;
            a.position[1] = a.position[1] + a.velocity[1] * dt;
        }
    }
}

function updateObj(a: Obj, objects: Obj[], config: Config) {
    const velocities = velocitiesSample(a);

    a.potentialVelocities = velocities;

    for (const potentialVelocity of velocities) {
        let ok = true;
        for (const b of objects) {
            if (a === b) {
                continue;
            }

            const dist = vec2dist(a.position, b.position);
            if (dist > config.visionRadius) {
                continue;
            }

            const withinRVO = inRVO(potentialVelocity, a, b);
            if (withinRVO) {
                ok = false;
                break;
            }
        }

        a.checkedVelocities.push({ velocity: potentialVelocity, ok });

        if (ok) {
            a.finalVelocity = potentialVelocity;
            if (config.lookAtNewVelocity) {
                a.velocity = a.finalVelocity;
            }
            break;
        }
    }
}

function velocitiesSample(a: Obj) {
    const n = 5;
    const rn = 2;

    const directionVec = vec2create();
    vec2sub(directionVec, a.targetPosition, a.position);
    const direction = vec2rotation(directionVec);
    const result: number[][] = [];

    for (let i = 0; i <= n; i++) {
        const angle = (Math.PI / n) * i;
        for (let r = rn; r > 0; r--) {
            const radius = (a.maxVelocity * r) / rn;

            const rightAngle = direction + angle;
            result.push([radius * Math.cos(rightAngle), radius * Math.sin(rightAngle)]);

            if (i !== 0 && i !== n) {
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

    const relativeVelocity = [0, 0];
    vec2sub(relativeVelocity, potentialVelocityA, b.velocity);
    const alpha = Math.abs(vec2angle(relativeVelocity, dirAtoB));

    const dist = vec2dist(a.position, b.position);

    const maxAngle = dist > radius ? Math.abs(Math.asin(radius / dist)) : Math.PI * 0.5;

    return alpha <= maxAngle;
}
