import THREE from 'three';

const vertexShader = `

   precision mediump float;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    
`;

const fragmentShader = `
   
    precision mediump float;
   
    #define PI 3.1415926535
    #define PI2 6.283185307
    #define GR 1. / 1.61803399


    #define TAU 6.28318530718
    #define MAX_ITER 3

    varying vec2 vUv;

    uniform float time;

    void main() {

        vec2 uv = ((vUv * 2.0) - 1.0) * vec2(1.0, 1.0);

        //vec2 p = mod(uv*TAU*2.0, TAU)-250.0;//tilling
        vec2 p = mod(uv * TAU, TAU) - 250.0;
        vec2 i = vec2(p);
        float c = 3.0;
        float inten = .005;
        for (int n = 0; n < MAX_ITER; n++) 
        {
            float t = time * (1.0 - (3.5 / float(n + 1)));
            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
        }
        c /= float(MAX_ITER);
        c = 1.17 - pow(c, 1.4);
        vec3 color = vec3(pow(abs(c), 1.0));
        // color = clamp(color, 0.0, 1.0);
        color = clamp(color * vec3(0.15, 0.05, 0.2), 0.0, 1.0);
        // color = clamp(color + vec3(0.15, 0.05, 0.2), 0.0, 1.0);
       
        float a =  (abs( sin(vUv.y*PI) ) );
        gl_FragColor = vec4(color * a, a);
       
    }
`;

export default class Horizon {

    constructor ( scene ) {

        this.radius = 2200;

        this.mesh = new THREE.Mesh(  new THREE.SphereGeometry(this.radius, 16, 16), 
            new THREE.ShaderMaterial( {
                uniforms: {
                    time: { value: 1.0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                // transparent: true,
                // alphaTest: .1,
                side: THREE.BackSide,
                // side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                shading: THREE.SmoothShading,
            } )
        );

        scene.add( this.mesh );

    }

    update ( time ) {
        this.mesh.material.uniforms.time.value = time * .5;

        this.mesh.rotation.x = -time*.05;
    }
}
