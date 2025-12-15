/**
 * Rigid body component for physics simulation
 */

import { Vec2 } from '../core/math/vec2';

export enum BodyType {
  Static = 'static',
  Dynamic = 'dynamic',
  Kinematic = 'kinematic',
}

export interface RigidBody {
  type: BodyType;
  velocity: Vec2;
  angularVelocity: number;
  mass: number;
  invMass: number; // Inverse mass for calculations
  restitution: number; // Bounciness (0-1)
  friction: number; // Friction coefficient (0-1)
  linearDamping: number; // Velocity damping (0-1)
  angularDamping: number; // Angular velocity damping (0-1)
  fixedRotation: boolean;
  enabled: boolean;
}

export function createRigidBody(type: BodyType = BodyType.Dynamic): RigidBody {
  const mass = type === BodyType.Static ? 0 : 1;
  return {
    type,
    velocity: Vec2.zero(),
    angularVelocity: 0,
    mass,
    invMass: mass > 0 ? 1 / mass : 0,
    restitution: 0.2,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    fixedRotation: false,
    enabled: true,
  };
}

export function setMass(body: RigidBody, mass: number): void {
  body.mass = mass;
  body.invMass = mass > 0 ? 1 / mass : 0;
}
