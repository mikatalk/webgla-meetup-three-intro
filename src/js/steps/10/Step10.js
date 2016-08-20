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

import 'utils/GPUParticleSystem';

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

export default class Step10 {

    constructor () {


        this.options = {
            blending:.82,
            blurX: .15,
            blurY: .15,
            speed: .6,
            animate: true,
            shadows: false
        }


        this.particleSunOptions = {
            position: new THREE.Vector3(),
            positionRandomness: 17,
            velocity: new THREE.Vector3(),
            velocityRandomness: .5,
            color: 0xffee88,
            colorRandomness: 0.4,//.2,
            turbulence: .0,
            lifetime: 1,
            size:22,
            sizeRandomness: 1
        };

        this.particlePlanetOptions = {
            position: new THREE.Vector3(),
            positionRandomness: 7,
            velocity: new THREE.Vector3(),
            velocityRandomness: .5,
            color: 0x666666,
            colorRandomness: 0.4,//.2,
            turbulence: .0,
            lifetime: 1,
            size:12,
            sizeRandomness: 1
        };

        this.particleStarsOptions = {
            position: new THREE.Vector3(),
            positionRandomness: 4000,
            velocity: new THREE.Vector3(),
            velocityRandomness: .5,
            color: 0xaa88ff,
            colorRandomness: 0.4,//.2,
            turbulence: .2,
            lifetime: 12,
            size:12,
            sizeRandomness: 1
        };

console.log( 'Particles planets:', this.particlePlanetOptions );
console.log( 'Particles stars:', this.particleStarsOptions );

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
        this.renderer.shadowMap.enabled = this.options.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.autoClear = false;
        // this.renderer.gammaInput = true;
        // this.renderer.gammaOutput = true;

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

        this.particleSystem = new THREE.GPUParticleSystem({
            maxParticles: 250000
        });
        this.scene.add( this.particleSystem);

        // Effects:

        this.effectSave = new THREE.SavePass( new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.rttParams ) );
        this.effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
        this.effectBlend.uniforms[ 'tDiffuse2' ].value = this.effectSave.renderTarget.texture;
        this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;

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

        // this.gui = new dat.dat.GUI();
        // this.gui.add( this.options, 'blending', 0.0, .99, 0.8 ).onChange( function(){
        //     this.effectBlend.uniforms[ 'mixRatio' ].value = this.options.blending;
        // }.bind(this) );
        // this.gui.add( this.options, 'blurX', 0.0, 1, 1 ).onChange( function(){
        //     this.effectHBlur.uniforms[ 'h' ].value = 2 / ( window.innerWidth / 2 ) * this.options.blurX;
        // }.bind(this) );
        // this.gui.add( this.options, 'blurY', 0.0, 1, 1 ).onChange( function(){
        //     this.effectVBlur.uniforms[ 'v' ].value = 2 / ( window.innerHeight / 2 ) * this.options.blurY;
        // }.bind(this) );
        // this.gui.add( this.options, 'speed', 0.0, 2, this.options.speed );
        // this.gui.add( this.options, 'animate', false, true, this.options.animate );
        // this.gui.add( this.options, 'shadows', false, true, this.options.shadows ).onChange( function(){
        //     this.renderer.shadowMap.enabled = this.options.shadows;
        // }.bind(this) );

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

        let geometry = new THREE.SphereGeometry(radius, 12,  12);
        let material = new THREE.MeshPhongMaterial( { 
            color: color, 
            map: this.rtt.texture.texture,
            shininess: 9,
            specular: 0x333333,
            shading: THREE.SmoothShading,
            blending: THREE.AdditiveBlending,
        });

        let mesh = new THREE.Mesh( geometry, material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
console.log('color:', material.color, color)
        return mesh;
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
        let time = Date.now() * 0.0005;
        
        this.particleSystem.update(this.clock.elapsedTime);

        if ( this.options.animate ) {
            for ( var i=0,l=this.meshes.length; i<l; i++ ) {
                let mesh = this.meshes[i];
                mesh.position.x = Math.sin( time * planets[i].speed * this.options.speed ) * planets[i].distance;
                mesh.position.z = Math.cos( time * planets[i].speed * this.options.speed ) * planets[i].distance;
        
                // this.particleOptions.color = (''+ this.componentToHex(mesh.material.color.r) 
                //  + this.componentToHex(mesh.material.color.g)
                //  + this.componentToHex(mesh.material.color.b) );//.toString(16);


                for ( var p=0; p<2; p++) {
                    this.particlePlanetOptions.position.x = mesh.position.x;
                    this.particlePlanetOptions.position.y = mesh.position.y;
                    this.particlePlanetOptions.position.z = mesh.position.z;
                    this.particleSystem.spawnParticle(this.particlePlanetOptions);
                }
            }
        }

        for ( var p=0; p<2; p++) {
            // this.particleStarsOptions.position.x = 0;// * Math.sin( Math.random() * 6.28 );
            // this.particleStarsOptions.position.y = 0;// * Math.sin( Math.random() * 6.28 );
            // // this.particleStarsOptions.position.y = 40 * Math.random();
            // this.particleStarsOptions.position.z = 0;//400 * Math.sin( Math.random() * 6.28 );
            // this.particleOptions.position.z = 40 * Math.random();
            this.particleSystem.spawnParticle(this.particleStarsOptions);
        }
        for ( var p=0; p<12; p++) {
            this.particleSystem.spawnParticle(this.particleSunOptions);
        }

        this.sun.rays.lookAt( this.camera.position );
        this.sun.update( this.clock.elapsedTime );

        this.rtt.render( this.renderer, delta);

        this.composer.render( delta );
   }

};
