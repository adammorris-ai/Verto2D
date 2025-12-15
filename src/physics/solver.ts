/**
 * Collision resolution using impulse-based solver
 */

import { Vec2 } from '../core/math/vec2';
import { RigidBody } from './rigidBody';
import { CollisionManifold } from './narrowphase';

/**
 * Resolve collision using impulse method
 */
export function resolveCollision(
  manifold: CollisionManifold,
  bodyA: RigidBody,
  bodyB: RigidBody,
  positionA: Vec2,
  positionB: Vec2
): void {
  if (bodyA.type === 'static' && bodyB.type === 'static') {
    return; // Both static, no resolution needed
  }

  const normal = manifold.normal;
  const penetration = manifold.penetration;

  // Separate bodies
  if (penetration > 0) {
    const separation = normal.clone().mulScalar(penetration);
    
    if (bodyA.type === 'static') {
      // Only move B
      positionB.add(separation);
    } else if (bodyB.type === 'static') {
      // Only move A
      positionA.sub(separation);
    } else {
      // Move both proportionally to inverse mass
      const totalInvMass = bodyA.invMass + bodyB.invMass;
      const ratioA = bodyA.invMass / totalInvMass;
      const ratioB = bodyB.invMass / totalInvMass;

      positionA.sub(separation.clone().mulScalar(ratioA));
      positionB.add(separation.clone().mulScalar(ratioB));
    }
  }

  // Calculate relative velocity
  const relativeVelocity = bodyB.velocity.clone();
  relativeVelocity.sub(bodyA.velocity);

  // Calculate relative velocity along normal
  const velocityAlongNormal = relativeVelocity.dot(normal);

  // Don't resolve if velocities are separating
  if (velocityAlongNormal > 0) {
    return;
  }

  // Calculate restitution (bounciness)
  const restitution = Math.min(bodyA.restitution, bodyB.restitution);

  // Calculate impulse scalar
  const totalInvMass = bodyA.invMass + bodyB.invMass;
  if (totalInvMass === 0) {
    return; // Both static
  }

  let impulseScalar = -(1 + restitution) * velocityAlongNormal;
  impulseScalar /= totalInvMass;

  // Apply impulse
  const impulse = normal.clone().mulScalar(impulseScalar);

  if (bodyA.type !== 'static') {
    const velocityChangeA = impulse.clone().mulScalar(bodyA.invMass);
    bodyA.velocity.sub(velocityChangeA);
  }

  if (bodyB.type !== 'static') {
    const velocityChangeB = impulse.clone().mulScalar(bodyB.invMass);
    bodyB.velocity.add(velocityChangeB);
  }

  // Friction (simplified)
  const friction = Math.sqrt(bodyA.friction * bodyB.friction);
  const tangent = relativeVelocity.clone();
  tangent.sub(normal.clone().mulScalar(relativeVelocity.dot(normal)));
  tangent.normalize();

  const frictionImpulseScalar = -relativeVelocity.dot(tangent);
  const frictionImpulse = tangent.clone().mulScalar(frictionImpulseScalar * friction / totalInvMass);

  if (bodyA.type !== 'static') {
    bodyA.velocity.sub(frictionImpulse.clone().mulScalar(bodyA.invMass));
  }

  if (bodyB.type !== 'static') {
    bodyB.velocity.add(frictionImpulse.clone().mulScalar(bodyB.invMass));
  }
}

/**
 * Apply damping to bodies
 */
export function applyDamping(body: RigidBody, deltaTime: number): void {
  if (body.type === 'static') {
    return;
  }

  // Linear damping
  body.velocity.mulScalar(1 - body.linearDamping * deltaTime);

  // Angular damping
  body.angularVelocity *= 1 - body.angularDamping * deltaTime;
}

/**
 * Integrate velocity to position
 */
export function integrate(body: RigidBody, position: Vec2, deltaTime: number): void {
  if (body.type === 'static') {
    return;
  }

  // Update position based on velocity
  const displacement = body.velocity.clone().mulScalar(deltaTime);
  position.add(displacement);
}
