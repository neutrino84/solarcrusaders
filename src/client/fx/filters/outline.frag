varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 color;
uniform vec4 filterArea;
uniform vec4 filterClamp;
vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);

void main(void) {
    const float PI = 3.14159265358979323846264;
    vec4 ownColor = texture2D(uSampler, vTextureCoord);
    vec4 curColor;
    float a = 0.0;
    vec2 displaced;
    for(float angle=0.0; angle<=PI*2.0; angle+=0.5) {//%SIZE%) {
      displaced.x = vTextureCoord.x + %SIZE% * px.x * cos(angle);
      displaced.y = vTextureCoord.y + %SIZE% * px.y * sin(angle);
      curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));
      a = max(a, curColor.a);
    }
    a = min(1.0-ownColor.a, a);
    gl_FragColor = vec4(color.r * a, color.g * a, color.b * a, a);
}