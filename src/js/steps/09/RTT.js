import THREE from 'three';
import randomcolor from 'randomcolor';

const vertexShader = `
    
    precision mediump float;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    
`;



const fragmentShader = `
    
    // Awesome Shader from Nicolas barradeau (chladni patterns)
    // http://thebookofshaders.com/edit.php?log=160601182629 

    precision mediump float;
   
    #define PI 3.1415926535897932384626433832795
    #define GR 1. / 1.61803399

    varying vec2 vUv;

    uniform float time;

    void main() {
        
        vec2 st = vUv * 2.0;

        float iteration = 20. + smoothstep( -1., 1., sin( PI * 2. * ( time * 0.1 ) ) ) * 20.;
        st.y -= GR;
        
        vec2 t = vec2( abs(sin( PI * time *0.1 ) ) );
        
        float sqi = sqrt( iteration );
        
        float a = sqi * sin( time * 0.01 );
        float b = sqi * cos( time * 0.005 );
        
        mat2 m = mat2(  cos( a * PI * st.x ), 
                        cos( (b+a) * PI * st.y ), 
                       -cos( b * PI * st.x ), 
                        cos( a * PI * st.y ) );
        
        st = t * m;
        float len = length( st );
        
        vec3 color = mix( vec3(0.92,0.83,0.60), vec3(1.,0.94,0.69), smoothstep( 1.0, 1.01, len ) );
        color += .1 * vec3(0.95,0.86,0.69) * smoothstep( 0.5,.51, len );
        
        gl_FragColor = vec4(color,1.0);
        
    }

`;

// const fragmentShader = `
    
//     precision mediump float;

//     uniform float time;
    
//     varying vec2 vUv;

//     void main () {
//         gl_FragColor = vec4( vec3(1.0).rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time)), 1.0);
//     }

// `;

// const fragmentShader = `
    
//     // Awesome Shader inspired from Nicolas barradeau (chladni patterns)
//     // http://thebookofshaders.com/edit.php?log=160601182629 

//     precision mediump float;
   
//     #define PI 3.1415926535897932384626433832795
//     #define GR 1. / 1.61803399

//     varying vec2 vUv;

//     uniform float time;

//     void main() {
        
//         vec2 st = vUv * 20.0;

//         float iteration = 20. + smoothstep( -1., 1., sin( PI * 2. * ( time * 0.1 ) ) ) * 20.;
//         st.y -= GR;
        
//         vec2 t = vec2( abs(sin( PI * time *0.1 ) ) );
        
//         float sqi = sqrt( iteration );
        
//         float a = sqi * sin( time * 0.01 );
//         float b = sqi * cos( time * 0.005 );
        
//         mat2 m = mat2(  cos( a * PI * st.x ), 
//                         cos( (b+a) * PI * st.y ), 
//                        -cos( b * PI * st.x ), 
//                         cos( a * PI * st.y ) );
        
//         st = t * m;
//         float len = length( st );
        
//         vec3 color = mix( vec3(0.92,0.83,0.60), vec3(1.,0.94,0.69), smoothstep( 1.0, 1.01, len ) );
//         color += .1 * vec3(0.95,0.86,0.69) * smoothstep( 0.5,.51, len );
        
//         gl_FragColor = vec4(color,1.0);
//     }

// `;



export default class RTT {

    constructor (width, height) {

        this.lifetime = 1;

        this.camera = new THREE.OrthographicCamera( 
            width / -2,   width / 2,
            height / 2,    height / - 2, -10000, 10000 );

        this.scene = new THREE.Scene();

        this.texture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, 
            { 
                minFilter: THREE.LinearFilter, 
                magFilter: THREE.NearestFilter, 
                format: THREE.RGBFormat 
            });

        let geometry = new THREE.PlaneBufferGeometry( width, height );
        let material = new THREE.ShaderMaterial( {
            uniforms: { 
                time: { type:"f", value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.quad = new THREE.Mesh( geometry, material );
        this.scene.add( this.quad );

    }

    render (renderer, delta) {

        this.lifetime += delta * 10;

        this.quad.material.uniforms.time.value = this.lifetime;

        renderer.render( this.scene, this.camera, this.texture, true );
    }
}
