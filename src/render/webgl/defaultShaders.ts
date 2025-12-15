/**
 * Default shaders for sprite rendering
 */

export const DEFAULT_SPRITE_VERTEX = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
in vec4 a_color;

uniform mat4 u_viewProjection;
uniform mat4 u_transform;

out vec2 v_uv;
out vec4 v_color;

void main() {
    vec4 pos = vec4(a_position, 0.0, 1.0);
    pos = u_transform * pos;
    gl_Position = u_viewProjection * pos;
    v_uv = a_uv;
    v_color = a_color;
}
`;

export const DEFAULT_SPRITE_FRAGMENT = `#version 300 es
precision mediump float;

in vec2 v_uv;
in vec4 v_color;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec4 u_tint;
uniform vec4 u_uvRect;

out vec4 fragColor;

void main() {
    vec2 uv = mix(vec2(u_uvRect.x, u_uvRect.y), vec2(u_uvRect.z, u_uvRect.w), v_uv);
    vec4 texColor = texture(u_texture, uv);
    fragColor = texColor * u_color * v_color * u_tint;
}
`;
