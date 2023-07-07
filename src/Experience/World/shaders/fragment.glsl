uniform float u_Time;
uniform float u_Switch;

varying vec2 v_uv;

#define PI 3.1415926535897932384626433832795

vec4 sRGBToLinear( vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

float random(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

void main()
{
    vec2 rotated_uv = rotate(v_uv, u_Time * 0.6, vec2(0.5));
    float scanMono = -atan(rotated_uv.x - 0.5 , rotated_uv.y - 0.5) + PI * 0.8;
    scanMono = pow(3.0, scanMono) * 0.002;


    float movingUvY = v_uv.y - u_Time * 0.06;
    float gridSize = 12.0;

    float spots = abs(mod(v_uv.x * gridSize, 1.0) - 0.5) + abs(mod(movingUvY * gridSize, 1.0) - 0.5) - 0.3;

    vec2 gridUV = vec2(
        round(v_uv.x * gridSize) / gridSize, 
        round(movingUvY * gridSize) / gridSize
    );
    float spotsCull = random(gridUV);
    spotsCull = step(0.9, spotsCull);
    spots = max(0.0,spotsCull * spots);

    float disPow = 0.5 / pow(3.0, distance(v_uv, vec2(0.5)) * 2.0);
    float wave = sin((disPow + u_Time * 0.03) * 120.0) * 3.0 - 2.0;
    wave = max(0.0,wave - 0.6);

    float centerSpot = 0.03 / distance(v_uv, vec2(0.5)) -0.1;

    float finalMix = scanMono + spots + wave + centerSpot;
    vec3 rgb = mix(vec3(0.0), vec3(0.1,1.0,0.1), finalMix);

    rgb *= u_Switch;

    
    gl_FragColor = sRGBToLinear(vec4(rgb, 1.0));    
}