import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import OrbitControls from 'three-orbit-controls';
import randomColor from 'randomcolor';
import RTT from './RTT';
import Sun from './Sun';
import 'shaders/BlendShader';
import 'shaders/CopyShader';
import 'shaders/HorizontalBlurShader';
import 'shaders/VerticalBlurShader';
import 'postprocessing/EffectComposer';
import 'postprocessing/MaskPass';
import 'postprocessing/RenderPass';
import 'postprocessing/SavePass';
import 'postprocessing/ShaderPass';
import 'postprocessing/TexturePass';
import * as dat from 'libs/utils/dat.gui.min';

const frameSize = { x:128, y:128 };

const planets = [
    { radius: 7, distance: 22, speed:9.6 },
    { radius: 9, distance: 42, speed:8.3 },
    { radius: 6, distance: 60, speed:11 },
    { radius: 13, distance: 82, speed:12},
    { radius: 8, distance: 106, speed:5 },
    { radius: 10, distance: 130, speed:5.5 },
    { radius: 9, distance: 155, speed:6.7 },
    { radius: 7, distance: 178, speed:4.2 },
    { radius: 8, distance: 200, speed:3 },
];

export default class Step09 {

    constructor () {


        this.options = {
            blending:.82,
            blurX: .15,
            blurY: .15,
            speed: 1.2,
            animate: true,
        }

        this.rttParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: true,
        };

        this.clock = new THREE.Clock;

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 40;
        this.camera.position.y = 50;
        this.camera.lookAt( new THREE.Vector3(0,0,0) );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.autoClear = false;

        document.body.appendChild( this.renderer.domElement );

        this.rtt = new RTT( frameSize.x, frameSize.y );
        this.rtt.render( this.renderer, 0);
        
        // lights
        let ambientLight = new THREE.AmbientLight( 0x333333 );
        this.scene.add( ambientLight );

        this.sun = new Sun( this.scene );

        this.meshes = [];
        for ( var i=0, l=planets.length; i<l; i++ ) {
            this.meshes.push( this.newMesh( randomColor(), planets[i].radius ) );
            this.scene.add( this.meshes[i] );
        }

        // Effects:

        this.effectSave = new THREE.SavePass( new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.rttParams ) );
        this.effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
        this.effectBlend.uniforms[ 'tDiffuse2' ].value = this.effectSave.renderTarget.texture;
        this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;

        this.effectCopyFront = new THREE.ShaderPass( THREE.CopyShader );
        this.effectCopy = new THREE.ShaderPass( THREE.CopyShader );
        this.effectCopy.renderToScreen = true;

        this.effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
        this.effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
        this.effectHBlur.uniforms[ 'h' ].value = 2 / ( window.innerWidth / 2 ) * this.options.blurX;
        this.effectVBlur.uniforms[ 'v' ].value = 2 / ( window.innerHeight / 2 ) * this.options.blurY;

        this.clearMask = new THREE.ClearMaskPass();
        this.renderMask = new THREE.MaskPass( this.scene, this.camera );
        this.renderMaskInverse = new THREE.MaskPass( this.scene, this.camera );
        this.renderMaskInverse.inverse = true;

        this.renderPass = new THREE.RenderPass( this.scene, this.camera );
        this.renderPass.clear = true;
        this.renderPass.alpha = true;
        this.renderPass.transparent = true;
        this.renderPass.premultipliedAlpha = true;

        this.composer = new THREE.EffectComposer( this.renderer, new THREE.WebGLRenderTarget(  window.innerWidth, window.innerHeight, this.rttParams ) );
        this.composer.autoClear = true;

        this.rttPass = new THREE.TexturePass( this.composer.renderTarget2.texture );
               
        this.rttPass.uniforms.tDiffuse.value.format = THREE.RGBAFormat;
        this.rttPass.material.transparent = true;

        this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

        this.composer.addPass( this.renderPass );

        this.composer.addPass( this.renderMaskInverse );
        this.composer.addPass( this.effectHBlur );
        this.composer.addPass( this.effectVBlur );
        this.composer.addPass( this.clearMask );

        this.composer.addPass( this.effectBlend );
        this.composer.addPass( this.effectSave );
        this.composer.addPass( this.effectCopy );

        this.controls = new (OrbitControls(THREE))( this.camera, this.renderer.domElement );
        this.controls.enableZoom = true;

        this.gui = new dat.dat.GUI();
        this.gui.add( this.options, 'blending', 0.0, .99, 0.8 ).onChange( function(){
            this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;
        }.bind(this) );
        this.gui.add( this.options, 'blurX', 0.0, 1, 1 ).onChange( function(){
            this.effectHBlur.uniforms[ 'h' ].value = 2 / ( window.innerWidth / 2 ) * this.options.blurX;
        }.bind(this) );
        this.gui.add( this.options, 'blurY', 0.0, 1, 1 ).onChange( function(){
            this.effectVBlur.uniforms[ 'v' ].value = 2 / ( window.innerHeight / 2 ) * this.options.blurY;
        }.bind(this) );
        this.gui.add( this.options, 'speed', 0.0, 2, this.options.speed );
        this.gui.add( this.options, 'animate', false, true, this.options.animate );

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.composer.setSize( window.innerWidth, window.innerHeight );
        this.rttPass.uniforms[ "tDiffuse" ].value = this.composer.renderTarget2.texture;
        this.rttPass.uniforms[ "tDiffuse" ].value = this.composer.renderTarget2.texture
    }
    
    newMesh ( color, radius ) {


        let geometry = new THREE.IcosahedronGeometry(radius, 1);
        // let geometry = new THREE.SphereGeometry(radius, 12,  12);
        let material = new THREE.MeshPhongMaterial( { 
            color: color, 
            map: this.rtt.texture.texture,
            shininess: 9,
            specular: 0x333333,
            shading: THREE.SmoothShading
        });

        let mesh = new THREE.Mesh( geometry, material );
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        return mesh;
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
        let time = Date.now() * 0.0005;
      
        if ( this.options.animate ) {
            for ( var i=0,l=this.meshes.length; i<l; i++ ) {
                let mesh = this.meshes[i];
                mesh.position.x = Math.sin( time * planets[i].speed * this.options.speed ) * planets[i].distance;
                mesh.position.z = Math.cos( time * planets[i].speed * this.options.speed ) * planets[i].distance;
            }
        }

        this.sun.rays.lookAt( this.camera.position );
        this.sun.update( this.clock.elapsedTime );

        this.rtt.render( this.renderer, delta);

        this.composer.render( delta );
   }

};
