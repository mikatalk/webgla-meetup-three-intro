import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import OrbitControls from 'three-orbit-controls';
import randomColor from 'randomcolor';
import Horizon from './Horizon';
import GPGPUPatrticles from './GPGPUPatrticles';
import BrightnessShader from './BrightnessShader';

import 'shaders/BlendShader';
import 'shaders/CopyShader';
import 'shaders/HorizontalBlurShader';
import 'shaders/VerticalBlurShader';
import 'shaders/FXAAShader';
import 'postprocessing/EffectComposer';
import 'postprocessing/MaskPass';
import 'postprocessing/RenderPass';
import 'postprocessing/SavePass';
import 'postprocessing/ShaderPass';
import 'postprocessing/TexturePass';
import * as dat from 'libs/utils/dat.gui.min';

import 'utils/GPUParticleSystem';

export default class Step14 {

    constructor () {


        this.options = {
            brightness: 1.3,
            blending: .8,
            speed: .01,
            spacing: 3.3,
        }

        this.clock = new THREE.Clock;

        // this.stats = new Stats();
        // this.stats.domElement.style.position = 'absolute';
        // this.stats.domElement.style.top = '0px';
        // document.body.appendChild( this.stats.domElement );

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog( 0x000000, 0, 160 );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000 );
        this.camera.position.z = 160;
        this.camera.position.y = 10;
        this.camera.lookAt( new THREE.Vector3(0,0,0) );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio || 1 );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.autoClear = false;

        document.body.appendChild( this.renderer.domElement );
        
        this.horizon = new Horizon( this.scene );

        this.particles = new GPGPUPatrticles(this.scene, this.renderer, this.camera);

        this.controls = new (OrbitControls(THREE))( this.camera, this.renderer.domElement );
        this.controls.enableZoom = true;
        // this.controls.minDistance = 10;
        // this.controls.maxDistance = 260;

        this.rttParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: true,
        };

        this.effectSave = new THREE.SavePass( new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.rttParams ) );
        
        this.effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
        this.effectBlend.uniforms[ 'tDiffuse2' ].value = this.effectSave.renderTarget.texture;
        this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;

        this.effectBrightness = new THREE.ShaderPass( new BrightnessShader );
        this.effectBrightness.uniforms[ 'brightness' ].value = this.options.brightness;
        this.effectBrightness.renderToScreen = true;

        this.effectCopy = new THREE.ShaderPass( THREE.CopyShader );

        this.renderPass = new THREE.RenderPass( this.scene, this.camera );
        
        this.composer = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget(  window.innerWidth, window.innerHeight, this.rttParams ) );
        
        this.composer.addPass( this.renderPass );
        this.composer.addPass( this.effectBlend );
        this.composer.addPass( this.effectSave );
        this.composer.addPass( this.effectBrightness );


        this.gui = new dat.dat.GUI();
        this.gui.add(this.options, 'brightness', 0, 10).step(0.1).onChange(function(){
            this.effectBrightness.uniforms[ 'brightness' ].value = this.options.brightness;
        }.bind(this));
        this.gui.add(this.options, 'blending', 0, 1).step(0.01).onChange(function(){
            this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;
        }.bind(this));
        this.gui.add(this.options, 'speed', 0, .5).step(0.01);
        this.gui.add(this.options, 'spacing', 0, 15).step(0.01);

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.composer.setSize( window.innerWidth, window.innerHeight );
    }
    

    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        // this.stats.update();

        let delta = this.clock.getDelta();
      
        this.horizon.update( this.clock.elapsedTime );

        this.particles.update( delta,
            this.clock.elapsedTime, 
            this.options.speed,
            this.options.spacing );

        this.composer.render( delta );

        this.renderer.render( this.scene, this.camera );
    }


};
