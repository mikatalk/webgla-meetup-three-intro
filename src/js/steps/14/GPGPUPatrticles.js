import THREE from 'three';
import GPUComputationRenderer from 'utils/GPUComputationRenderer';


const WIDTH = 512;
const PARTICLES = WIDTH * WIDTH;


const computeShaderPosition = `

    precision mediump float;
    
    uniform float spacing;
    uniform float time;
    uniform float speed;

    uniform sampler2D texturePosition;

    void main() {

        vec4 pos = texture2D( texturePosition, gl_FragCoord.xy );

        float index = gl_FragCoord.y*(${ WIDTH }.0) + gl_FragCoord.x;

        float ratio =  index/${ WIDTH*WIDTH }.0;

        // float spacing = 1.;
        float timeAt = (time/10.0 + ratio) * spacing;
        
        float radius = 100.0;

        pos.x = sin( sin( timeAt * 81.0 + time*12.) * cos( timeAt * 90.0 ) ) * radius;
        pos.y = sin( cos( timeAt * 60.0 ) * cos( timeAt * 70.0 )  ) * radius;
        pos.z = sin( cos( timeAt * 70.0 ) + radius + sin( timeAt * 86.0 )) * radius;

        gl_FragColor = vec4( pos.xyz,ratio );

    }
`;

const particleVertexShader = `

    // For PI declaration:
    #include <common>

    uniform sampler2D texturePosition;

    uniform float cameraConstant;

    varying vec3 vColor;

    void main() {

        vec4 sample = texture2D( texturePosition, uv );
        vec3 pos = sample.xyz;

        vColor = vec3( cos(sample.a*PI), cos(1.0-sample.a), cos(sample.a) );

        vec4 mvPosition = modelViewMatrix * vec4( sample.xyz, 1.0 );

        gl_PointSize = .2 * cameraConstant / ( - mvPosition.z );
        
        if ( gl_PointSize < 2.0 ) gl_PointSize = 2.0;

        gl_Position = projectionMatrix * mvPosition;

    }
`;

const particleFragmentShader = `

    #include <common>
    
    varying vec3 vColor;

    void main() {

        gl_FragColor = vec4( vColor.rgb, 1.0 - distance(vec2(.5,.5), gl_PointCoord.xy)*2.0 );
        
    }
`;



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
        this.positionUniforms.spacing = { type:'f', value: 0 }
        this.positionUniforms.time = { type:'f', value: 0 }
        this.positionUniforms.speed = { type:'f', value: 0 }

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

            // uniforms:       this.particleUniforms,
            // vertexShader:   particleVertexShader,
            // fragmentShader: particleFragmentShader,
            // transparent:    true,
            
            uniforms:       this.particleUniforms,
            vertexShader:   particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent:    true,
            alphaTest: .2,
            side: THREE.DoubleSide,
            depthWrite: false,
            // depthTest: false,
            // blending: THREE.NoBlending,
            // blending: THREE.NormalBlending,
            // blending: THREE.SubtractiveBlending,
            // blending: THREE.MultiplyBlending,
            blending: THREE.AdditiveBlending,
            shading: THREE.SmoothShading,
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
            posArray[ i + 3 ] = 1;
        }

    }

    handleResize () {

        this.particleUniforms.cameraConstant.value = this.getCameraConstant();

    }

    getCameraConstant() {

        return window.innerHeight / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * this.camera.fov ) / this.camera.zoom );
    
    }

    update (delta, elapsedTime, speed, spacing) {

        this.gpuCompute.compute();

        this.positionUniforms.time.value = elapsedTime * speed;
        this.positionUniforms.speed.value = speed;
        this.positionUniforms.spacing.value = spacing;

        this.particleUniforms.texturePosition.value = this.gpuCompute.getCurrentRenderTarget( this.positionVariable ).texture;

    }
}

