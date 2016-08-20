import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import OrbitControls from 'three-orbit-controls';
import randomColor from 'randomcolor';
import Horizon from './Horizon';
import GPGPUPatrticles from './GPGPUPatrticles';

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

export default class Step11 {

    constructor () {


        this.options = {
            blending:.82,
            blurX: .15,
            blurY: .15,
            speed: .6,
        }

        this.clock = new THREE.Clock;

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog( 0x000000, 0, 160 );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000 );
        this.camera.position.z = 10;
        this.camera.position.y = 2;
        this.camera.lookAt( new THREE.Vector3(0,0,0) );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio || 1 );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.autoClear = false;

        document.body.appendChild( this.renderer.domElement );

        let ambientLight = new THREE.AmbientLight( 0x888888 );
        this.scene.add( ambientLight );

        
        this.horizon = new Horizon( this.scene );

     
        this.particles = new GPGPUPatrticles(this.scene, this.renderer, this.camera);

        this.controls = new (OrbitControls(THREE))( this.camera, this.renderer.domElement );
        this.controls.enableZoom = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 260;

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    

    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
      
        this.horizon.update( this.clock.elapsedTime );

        this.particles.update( delta );

        this.renderer.render( this.scene, this.camera );
    }

};
