import THREE from 'three';

const frameSize = { x:512, y:512 };

export default class Step02 {

    constructor () {

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1000;
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
 
        document.body.appendChild( this.renderer.domElement );

        this.mesh = this.newMesh();
        this.scene.add( this.mesh );

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

        this.animate();

    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        let scaleWidth = window.innerWidth/frameSize.x;
        let scaleHeight = window.innerHeight/frameSize.y;

        if ( scaleWidth < scaleHeight )
            this.camera.position.z = frameSize.x / this.camera.aspect / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));
        else
            this.camera.position.z = frameSize.y / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));             

    }
        
    newMesh () {
        let geometry = new THREE.PlaneBufferGeometry( frameSize.x, frameSize.y );
        let material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        return new THREE.Mesh( geometry, material );
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );
     
        this.renderer.render( this.scene, this.camera );
    }

};
