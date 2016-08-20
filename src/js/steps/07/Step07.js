import THREE from 'three';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';
import OrbitControls from 'three-orbit-controls';
import randomColor from 'randomcolor';
import RTT from './RTT';

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

export default class Step07 {

    constructor () {

        this.clock = new THREE.Clock;

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
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.appendChild( this.renderer.domElement );

        this.rtt = new RTT( frameSize.x, frameSize.y );
        
        // lights
        let ambientLight = new THREE.AmbientLight( 0x333333 );
        this.scene.add( ambientLight );

        this.sun = new THREE.PointLight( 0xffff99, 2, 50000 );
        this.sun.add( new THREE.Mesh(  new THREE.SphereGeometry(2, 16, 16), new THREE.MeshBasicMaterial( { color: this.sun.color } ) ) );
        this.scene.add( this.sun );
        this.sun.castShadow = true;

        this.meshes = [];
        for ( var i=0, l=planets.length; i<l; i++ ) {
            this.meshes.push( this.newMesh( randomColor(), planets[i].radius ) );
            this.scene.add( this.meshes[i] );
        }

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
    
    newMesh ( color, radius ) {

        let geometry = new THREE.SphereGeometry(radius, 12,  12);
        let material = new THREE.MeshPhongMaterial( { 
            color: color, 
            map: this.rtt.texture.texture,
            shininess: 10,
            specular: 0x333333,
        });

        let mesh = new THREE.Mesh( geometry, material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
        let time = Date.now() * 0.0005;
      
        for ( var i=0,l=this.meshes.length; i<l; i++ ) {
            let mesh = this.meshes[i];  
            mesh.position.x = Math.sin( time * planets[i].speed * .1 ) * planets[i].distance;
            mesh.position.z = Math.cos( time * planets[i].speed * .1 ) * planets[i].distance;
        }    

        this.rtt.render( this.renderer, delta);
        this.renderer.render( this.scene, this.camera );
    }

};
