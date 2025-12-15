import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationClip, SpriteAnimation } from '../animation/spriteAnimation';
import { Timeline } from '../animation/timeline';
import { Animator } from '../animation/animator';

describe('AnimationClip', () => {
  let clip: AnimationClip;

  beforeEach(() => {
    const animation: SpriteAnimation = {
      name: 'walk',
      frames: [
        { spriteIndex: 0, duration: 0.1 },
        { spriteIndex: 1, duration: 0.1 },
        { spriteIndex: 2, duration: 0.1 },
      ],
      loop: true,
      speed: 1.0,
    };
    clip = new AnimationClip(animation);
  });

  it('should create animation clip', () => {
    expect(clip.getName()).toBe('walk');
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(0);
  });

  it('should play animation', () => {
    clip.play();
    expect(clip.isAnimationPlaying()).toBe(true);
  });

  it('should update animation frames', () => {
    clip.play();
    clip.update(0.05);
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(0); // Still on first frame

    clip.update(0.1); // Total 0.15, should advance
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(1);
  });

  it('should loop animation', () => {
    clip.play();
    
    // Advance through all frames (3 frames, each 0.1s duration)
    clip.update(0.1); // frame 0 -> frame 1
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(1);
    
    clip.update(0.1); // frame 1 -> frame 2
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(2);
    
    clip.update(0.1); // frame 2 -> should loop to frame 0
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(0);
  });

  it('should stop at end when not looping', () => {
    const nonLoopAnimation: SpriteAnimation = {
      name: 'once',
      frames: [
        { spriteIndex: 0, duration: 0.1 },
        { spriteIndex: 1, duration: 0.1 },
      ],
      loop: false,
      speed: 1.0,
    };
    const nonLoopClip = new AnimationClip(nonLoopAnimation);
    nonLoopClip.play();

    nonLoopClip.update(0.1);
    nonLoopClip.update(0.1);
    expect(nonLoopClip.isAnimationPlaying()).toBe(false);
    expect(nonLoopClip.getCurrentFrame()?.spriteIndex).toBe(1);
  });

  it('should set playback speed', () => {
    clip.setSpeed(2.0);
    expect(clip.getSpeed()).toBe(2.0);

    clip.play();
    clip.update(0.05); // Should advance faster
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(1);
  });

  it('should pause and resume', () => {
    clip.play();
    clip.update(0.05);
    const frameBefore = clip.getCurrentFrame()?.spriteIndex;

    clip.pause();
    clip.update(0.1); // Should not advance
    expect(clip.getCurrentFrame()?.spriteIndex).toBe(frameBefore);

    clip.resume();
    clip.update(0.1);
    expect(clip.getCurrentFrame()?.spriteIndex).toBeGreaterThan(frameBefore!);
  });
});

describe('Timeline', () => {
  let timeline: Timeline<number>;

  beforeEach(() => {
    timeline = new Timeline<number>();
  });

  it('should add keyframes', () => {
    timeline.addKeyframe(0, 0);
    timeline.addKeyframe(1, 100);
    
    expect(timeline.getValue()).toBe(0);
    expect(timeline.getDuration()).toBe(1);
  });

  it('should interpolate between keyframes', () => {
    timeline.addKeyframe(0, 0);
    timeline.addKeyframe(1, 100);
    
    timeline.setTime(0.5);
    const value = timeline.getValue();
    expect(value).toBeCloseTo(50, 1);
  });

  it('should update timeline', () => {
    timeline.addKeyframe(0, 0);
    timeline.addKeyframe(1, 100);
    
    timeline.play();
    timeline.update(0.5);
    
    expect(timeline.getTime()).toBe(0.5);
    expect(timeline.getValue()).toBeCloseTo(50, 1);
  });

  it('should loop timeline', () => {
    timeline.addKeyframe(0, 0);
    timeline.addKeyframe(1, 100);
    timeline.setLoop(true);
    
    timeline.play();
    timeline.update(1.5);
    
    expect(timeline.getTime()).toBeCloseTo(0.5, 1);
    expect(timeline.isTimelinePlaying()).toBe(true);
  });

  it('should stop at end when not looping', () => {
    timeline.addKeyframe(0, 0);
    timeline.addKeyframe(1, 100);
    timeline.setLoop(false);
    
    timeline.play();
    timeline.update(1.5);
    
    expect(timeline.getTime()).toBe(1);
    expect(timeline.isTimelinePlaying()).toBe(false);
  });
});

describe('Animator', () => {
  let animator: Animator;

  beforeEach(() => {
    animator = new Animator();

    const idleAnimation: SpriteAnimation = {
      name: 'idle',
      frames: [{ spriteIndex: 0, duration: 0.5 }],
      loop: true,
      speed: 1.0,
    };

    const walkAnimation: SpriteAnimation = {
      name: 'walk',
      frames: [
        { spriteIndex: 1, duration: 0.1 },
        { spriteIndex: 2, duration: 0.1 },
      ],
      loop: true,
      speed: 1.0,
    };

    animator.addState('idle', new AnimationClip(idleAnimation));
    animator.addState('walk', new AnimationClip(walkAnimation), [
      { toState: 'idle', trigger: 'stop' },
    ]);
    animator.setDefaultState('idle');
  });

  it('should set default state', () => {
    animator.play();
    expect(animator.getCurrentState()).toBe('idle');
  });

  it('should transition between states', () => {
    animator.setState('walk');
    expect(animator.getCurrentState()).toBe('walk');
    
    const clip = animator.getCurrentClip();
    expect(clip?.getName()).toBe('walk');
  });

  it('should trigger transition', () => {
    animator.setState('walk');
    animator.trigger('stop');
    expect(animator.getCurrentState()).toBe('idle');
  });

  it('should update current animation', () => {
    animator.play();
    animator.update(0.1);
    
    const clip = animator.getCurrentClip();
    expect(clip).not.toBeNull();
  });

  it('should stop animation', () => {
    animator.play();
    animator.stop();
    
    const clip = animator.getCurrentClip();
    expect(clip?.isAnimationPlaying()).toBe(false);
  });
});
