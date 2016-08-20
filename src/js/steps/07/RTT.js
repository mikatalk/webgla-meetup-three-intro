import THREE from 'three';
import randomcolor from 'randomcolor';

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

    uniform float time;
    
    varying vec2 vUv;

    void main () {
        gl_FragColor = vec4( vec3(1.0).rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time)), 1.0);
    }

`;


export default class RTT {

    constructor (width, height) {

        this.lifetime = 1;

        this.camera = new THREE.OrthographicCamera( 
            width / -2,   width / 2,
            height / 2,    height / - 2, -10000, 10000 );

        this.scene = new THREE.Scene();

        this.texture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, 
            { 
                minFilter: THREE.LinearFilter, 
                magFilter: THREE.NearestFilter, 
                format: THREE.RGBFormat 
            });

        let geometry = new THREE.PlaneBufferGeometry( width, height );
        let material = new THREE.ShaderMaterial( {
            uniforms: { 
                time: { type:"f", value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.quad = new THREE.Mesh( geometry, material );
        this.scene.add( this.quad );

    }

    render (renderer, delta) {

        this.lifetime += delta * 10;

        this.quad.material.uniforms.time.value = this.lifetime;

        renderer.render( this.scene, this.camera, this.texture, true );
    }
}
