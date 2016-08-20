import THREE from 'three';
import randomcolor from 'randomcolor';
import Stats from '../../../../node_modules/three/examples/js/libs/stats.min.js';

const frameSize = { x:512, y:512 };

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

    uniform vec3 color;
    
    varying vec2 vUv;

    void main () {
        gl_FragColor = vec4( color.rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time*4.0)), 1.0);
    }

`;


// const fragmentShader = `
   
//     precision mediump float;

//     uniform float time;

//     varying vec2 vUv;

//     void main () {
//         vec4 color = vec4( 
//             mod( vUv.x+time, 1.0),
//             mod( vUv.y+time, 1.0),
//             mod( vUv.x+vUv.y+time, 1.0),
//             1.0);
//         gl_FragColor = color;
//     }

// `;


// const fragmentShader = `
    
//     // Awesome Shader from Nicolas barradeau (chladni patterns)
//     // http://thebookofshaders.com/edit.php?log=160601182629 

//     precision mediump float;
   
//     #define PI 3.1415926535897932384626433832795
//     #define GR 1. / 1.61803399

//     varying vec2 vUv;

//     uniform float time;

//     void main() {
        
//         vec2 st = vUv * 2.0;

//         float iteration = 20. + smoothstep( -1., 1., sin( PI * 2. * ( time * 0.1 ) ) ) * 20.;
//         st.y -= GR;
        
//         vec2 t = vec2( abs(sin( PI * time *0.1 ) ) );
        
//         float sqi = sqrt( iteration );
        
//         float a = sqi * sin( time * 0.01 );
//         float b = sqi * cos( time * 0.005 );
        
//         mat2 m = mat2(  cos( a * PI * st.x ), 
//                         cos( b * PI * st.y ), 
//                        -cos( b * PI * st.x ), 
//                         cos( a * PI * st.y ) );
        
//         st = t * m;
//         float len = length( st );
        
//         vec3 color = mix( vec3(0.92,0.83,0.60), vec3(1.,0.94,0.69), smoothstep( 1.0, 1.01, len ) );
//         color += .1 * vec3(0.95,0.86,0.69) * smoothstep( 0.5,.51, len );
        
//         gl_FragColor = vec4(color,1.0);
//     }

// `;

export default class Step03 {

    constructor () {

        this.clock = new THREE.Clock;

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );

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

        if ( scaleWidth < scaleHeight ) {
            this.camera.position.z = frameSize.x / this.camera.aspect / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));
        } else {
            this.camera.position.z = frameSize.y / (2 * Math.tan(this.camera.fov / 2 * (Math.PI / 180)));             
        }
    }
        
    newMesh () {

        let geometry = new THREE.PlaneBufferGeometry( frameSize.x, frameSize.y );
        let material = new THREE.ShaderMaterial( {
            uniforms: { 
                time: { type:"f", value: 0 },
                color:{ type: "c", value: new THREE.Color( randomcolor() ) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        return new THREE.Mesh( geometry, material );
    }


    animate() {
        
        requestAnimationFrame( this.animate.bind(this) );

        this.stats.update();

        let delta = this.clock.getDelta();
        this.mesh.material.uniforms.time.value = this.clock.elapsedTime;

        this.renderer.render( this.scene, this.camera );
    }

};
