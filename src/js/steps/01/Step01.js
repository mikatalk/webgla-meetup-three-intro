import THREE from 'three';


export default class Step01 {

    constructor () {

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1000;
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
 
        document.body.appendChild( this.renderer.domElement );

        this.mesh = this.newMesh();
        this.scene.add( this.mesh );

        this.animate();

    }

    newMesh () {
        let geometry = new THREE.SphereGeometry( 500, 16, 16 );
        let material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        return new THREE.Mesh( geometry, material );
    }

    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );
     
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
     
        this.renderer.render( this.scene, this.camera );
    }

};
