import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import OrbitControls from 'three-orbit-controls';
import randomColor from 'randomcolor';
import RTT from './RTT';

const frameSize = { x:512, y:512 };

export default class Step06 {

    constructor () {

        this.clock = new THREE.Clock;

        this.textureLoader = new THREE.TextureLoader();

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1000;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor( 0x000000 );

                
        document.body.appendChild( this.renderer.domElement );

        this.rtts = [
            new RTT( frameSize.x, frameSize.y ),
            new RTT( frameSize.x, frameSize.y )
        ]
        
        // lights
        let ambientLight = new THREE.AmbientLight( 0x010101 );
        this.scene.add( ambientLight );

        this.lights = [];
        for ( var i=0; i<10; i++ ) {
            this.lights[i] = new THREE.PointLight( randomColor(), 1, 5000 );
            this.lights[i].add( new THREE.Mesh(  new THREE.SphereGeometry(12, 8, 8), new THREE.MeshBasicMaterial( { color: this.lights[i].color } ) ) );
            this.scene.add( this.lights[i] );
        }


        this.mesh = this.newMesh( randomColor(), this.rtts[0] );
        this.scene.add( this.mesh );

        this.mesh2 = this.newMesh( randomColor(), this.rtts[1] );
        this.mesh2.position.set( 1100, 0, 0 );
        this.scene.add( this.mesh2 );

        this.controls = new (OrbitControls(THREE))( this.camera, this.renderer.domElement );
        this.controls.enableZoom = true;

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }
    
    newMesh ( color, rtt ) {

        let geometry = new THREE.SphereGeometry(500, 60, 60);
        let material = new THREE.MeshPhongMaterial( { 
            color: color, 
            map: rtt.texture.texture,
            // map: this.textureLoader.load('img/perlin-512.png'),
            shininess: 10,
            envMap: this.textureLoader.load('img/perlin-512.png'),
            specular: 0x666666,
            specularMap: rtt.texture.texture,
            // normalMap: rtt.texture.texture,
            // normalScale: new THREE.Vector2( 100, 100 ),
            side: THREE.DoubleSide
        });

        return new THREE.Mesh( geometry, material );
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
        var time = Date.now() * 0.0005;
        
        for ( var i=0,l=this.lights.length; i<l; i++ ) {
            this.lights[i].position.x = this.mesh.position.x + Math.sin( i * 500 + time * 7 ) * 900;
            this.lights[i].position.y = this.mesh.position.y + Math.cos( i * 500 + time * 5 ) * 900;
            this.lights[i].position.z = this.mesh.position.z + Math.cos( i * 500 + time * 3 ) * 900;
        }
        
        for ( let rtt of this.rtts ) {
            rtt.render( this.renderer, delta);
        }

        this.renderer.render( this.scene, this.camera );
    }

};
