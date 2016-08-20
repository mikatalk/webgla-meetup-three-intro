import THREE from 'three';
import GPUComputationRenderer from 'utils/GPUComputationRenderer';

const computeShaderPosition = `

    uniform float delta;

    uniform sampler2D texturePosition;

    void main() {

        vec2 uv = gl_FragCoord.xy / resolution.xy;

        vec4 pos = texture2D( texturePosition, uv );
        
        pos.z = -150.0 + mod( pos.z+ delta*130.0, 150.0);

        gl_FragColor = vec4( pos.xyz, 1.0 );

    }
`;

const particleVertexShader = `

    // For PI declaration:
    #include <common>

    uniform sampler2D texturePosition;

    uniform float cameraConstant;

    varying vec3 vColor;

    void main() {


        vec4 posTemp = texture2D( texturePosition, uv );
        vec3 pos = posTemp.xyz;

        // vColor = posTemp.xyz;
        // vColor = vec3( abs(sin(posTemp.x*100.0)),  abs(sin(posTemp.y*120.0)),  abs(sin(posTemp.z*70.0)));
        // vColor = posTemp.aaa * 255.0;
        vColor = vec3( 1.0 );

        vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

        gl_PointSize = .1 * cameraConstant / ( - mvPosition.z );
        
        if ( gl_PointSize < 4.0 ) gl_PointSize = 4.0;

        gl_Position = projectionMatrix * mvPosition;

    }
`;

const particleFragmentShader = `

    #include <common>
    
    varying vec3 vColor;

    void main() {

        gl_FragColor = vec4( vColor.rgb, 1.0-sin( distance(vec2(.5,.5), gl_PointCoord.xy)*PI ) );
    }
`;



const WIDTH = 64;
const PARTICLES = WIDTH * WIDTH;

export default class GPGPUPatrticles {

    constructor (scene, renderer, camera) {

        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        this.gpuCompute;

        // this.velocityVariable;
        this.positionVariable;

        this.positionUniforms;
        // this.velocityUniforms;
        this.particleUniforms;

        this.options = {
            radius: 100,
        };

        this.initComputeRenderer( renderer );

        this.initParticles();

        this.restartSimulation();
    }

    initComputeRenderer ( renderer ) {

        this.gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

        let dtPosition = this.gpuCompute.createTexture();

        this.fillTextures( dtPosition );

        this.positionVariable = this.gpuCompute.addVariable( "texturePosition", computeShaderPosition, this.dtPosition );
        this.positionUniforms = this.positionVariable.material.uniforms;
        this.positionUniforms.delta = { type:'f', value: 0 }

        let error = this.gpuCompute.init();
        if ( error !== null ) {
            console.error( error );
        }

    }

    restartSimulation () {

        let dtPosition = this.gpuCompute.createTexture();
        let dtVelocity = this.gpuCompute.createTexture();

        this.fillTextures( dtPosition, dtVelocity );

        this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 0 ] );
        this.gpuCompute.renderTexture( dtPosition, this.positionVariable.renderTargets[ 1 ] );

    }

    initParticles() {

        let geometry = new THREE.BufferGeometry();

        let positions = new Float32Array( PARTICLES * 3 );
        let p = 0;
        for ( let i = 0; i < PARTICLES; i++ ) {

            positions[ p++ ] = 0;//( Math.random() * 2 - 1 ) * this.options.radius;
            positions[ p++ ] = 0;//( Math.random() * 2 - 1 ) * this.options.radius;
            positions[ p++ ] = 0;//( Math.random() * 2 - 1 ) * this.options.radius;

        }

        let uvs = new Float32Array( PARTICLES * 2 );
        p = 0;
        for ( var j = 0; j < WIDTH; j++ ) {
            for ( var i = 0; i < WIDTH; i++ ) {

                uvs[ p++ ] = i / ( WIDTH - 1 );
                uvs[ p++ ] = j / ( WIDTH - 1 );

            }
        }

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

        this.particleUniforms = {
            texturePosition: { value: null },
            cameraConstant: { value: this.getCameraConstant( this.camera ) },
        };

        // ShaderMaterial
        let material = new THREE.ShaderMaterial( {
            uniforms:       this.particleUniforms,
            vertexShader:   particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent:    true,
        } );
        material.extensions.drawBuffers = true;

        let particles = new THREE.Points( geometry, material );
        particles.matrixAutoUpdate = false;
        particles.updateMatrix();

        this.scene.add( particles );

    }

    fillTextures( texturePosition ) {

        let posArray = texturePosition.image.data;
        let radius = this.options.radius;

        for ( var i=0, l=posArray.length; i<l; i+=4 ) {

            let x = ( Math.random() * 2 - 1 ) * radius;
            let y = ( Math.random() * 2 - 1 ) * radius;
            let z = ( Math.random() * 2 - 1 ) * radius * 5;
    
            // Fill in texture values
            posArray[ i + 0 ] = x;
            posArray[ i + 1 ] = y;
            posArray[ i + 2 ] = z;
            posArray[ i + 3 ] = 0;//Math.random() * 255;

            // posArray[ i + 0 ] = 0;
            // posArray[ i + 1 ] = 0;
            // posArray[ i + 2 ] = 0;
            // posArray[ i + 3 ] = 0;

        }

    }

    handleResize () {

        this.particleUniforms.cameraConstant.value = this.getCameraConstant();

    }

    getCameraConstant() {

        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * this.camera.fov ) / this.camera.zoom );
    
    }

    update (delta) {

        this.gpuCompute.compute();

this.positionUniforms.delta.value = delta;
        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;

    }
}

