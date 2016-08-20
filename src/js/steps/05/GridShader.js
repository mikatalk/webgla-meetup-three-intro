import THREE from 'three';
import randomcolor from 'randomcolor';


export default {

    uniforms: {
        time:  { type:"f", value: 0 },
        color: { type: "c", value: new THREE.Color( randomcolor() ) }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }
    `,

    fragmentShader: `

        precision mediump float;

        uniform float time;

        uniform vec3 color;
        
        varying vec2 vUv;

        void main () {
            gl_FragColor = vec4( color.rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time*4.0)), 1.0);
        }

    `
};
