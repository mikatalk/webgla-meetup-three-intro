import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import randomColor from 'randomcolor';
import BrightnessShader from './BrightnessShader';
import 'postprocessing/EffectComposer';
import 'postprocessing/RenderPass';

import * as dat from 'libs/utils/dat.gui.min';



const vertexShader = `

   precision mediump float;

    void main() {
        gl_Position = vec4( position, 1.0 );
    }
    
`;

const fragmentShader = `
   
    precision mediump float;
   
    #define PI 3.1415926535
    #define PI2 6.283185307
    #define GR 1. / 1.61803399

    #define TAU 6.28318530718
    #define MAX_ITER 3

    uniform vec2 resolution;
    uniform float time;

    void main() {

        vec2 uv = gl_FragCoord.xy / resolution.xy;
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
        color = clamp(color + vec3(0.6, 0.35, 0.8), 0.0, 1.0);
        gl_FragColor = vec4(color, 1.0);
      
    }
`;

export default class Step04 {

    constructor () {


        this.options = {
            brightness: .8,
        }

        this.clock = new THREE.Clock;

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );

        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();

             
        let geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        let material = new THREE.ShaderMaterial( {
            uniforms: {
                time:       { value: 1.0 },
                resolution: { value: new THREE.Vector2() }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        } );
        this.plane = new THREE.Mesh( geometry, material );
        this.scene.add( this.plane );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio || 1 );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.autoClear = false;

        this.effectBrightness = new THREE.ShaderPass( new BrightnessShader );
        this.effectBrightness.uniforms[ 'brightness' ].value = this.options.brightness;
        this.effectBrightness.renderToScreen = true;
   
        this.composer = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget(  window.innerWidth, window.innerHeight, this.rttParams ) );
        
        this.renderPass = new THREE.RenderPass( this.scene, this.camera );
        
        this.composer.addPass( this.renderPass );
        this.composer.addPass( this.effectBrightness );

        this.gui = new dat.dat.GUI();
        this.gui.add(this.options, 'brightness', 0, 4).step(0.1).onChange(function(){
            this.effectBrightness.uniforms[ 'brightness' ].value = this.options.brightness;
        }.bind(this));

        document.body.appendChild( this.renderer.domElement );

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.plane.material.uniforms.resolution.value.x = window.innerWidth;// this.renderer.domElement.width;
        this.plane.material.uniforms.resolution.value.y = window.innerHeight;// this.renderer.domElement.height;

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.composer.setSize( window.innerWidth, window.innerHeight );
    }
    

    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
    
        this.plane.material.uniforms.time.value += delta;

        this.composer.render( delta );
    }

};
