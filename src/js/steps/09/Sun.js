import THREE from 'three';

const vertexShader = `

   precision mediump float;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    
`;

const fragmentShaderRay = `

    precision mediump float;

    varying vec2 vUv;

    uniform float time;

    void main( void ) {
        vec3 color = vec3(1.0, 1.0, 0.8);
        float alpha = 0.0;
        alpha += ( 1.0 - distance(vUv, vec2(.5,.5) ) * 2.0 + sin(time*10.0)*.02 ) * .2;
        alpha += clamp( ( 1.0 - distance(vUv, vec2(.5,.5) ) * 6.0 + sin(    time*30.0)*.1 ) * .1, 0.0, 1.0);
        alpha += clamp( ( 1.0 - distance(vUv, vec2(.5,.5) ) * 7.0 + sin(3.14 +time*3.0)*.2 ) * .3, 0.0, 1.0);
        alpha += clamp( ( 1.0 - distance(vUv, vec2(.5,.5) ) * 7.0 + sin(      time*12.0)*.01 ) * .6, 0.0, 1.0);
        alpha *= .7;
        alpha = clamp(alpha, 0.0, 1.0);
        gl_FragColor = vec4( color.rgb, alpha );
    }
`;

const fragmentShaderSun = `
    
    precision mediump float;

    uniform float time;
    
    varying vec2 vUv;

    void main () {
        vec3 color = vec3(1.0, 1.0, .8);
        gl_FragColor = vec4( vec3(.7, .5, .2) + color.rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time)), 1.0);
        // gl_FragColor = vec4( color.rgb * abs(sin(vUv.x * 100.0)) * abs(sin(vUv.y * 100.0 + time)), 1.0);
    }
`;

export default class Sun {

    constructor ( scene ) {

        this.radius = 6 * 1.5;
        this.raydius = 48 * 1.5;

        this.light = new THREE.PointLight( 0xffff99, 2, 50000 );

        this.lightMesh = new THREE.Mesh(  new THREE.IcosahedronGeometry(this.radius, 1), 
        // this.lightMesh = new THREE.Mesh(  new THREE.SphereGeometry(this.radius, 16, 16), 
            new THREE.ShaderMaterial( {
                uniforms: {
                    time: { value: 1.0 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShaderSun,
                transparent: true,
                blending: 'AdditiveBlending',
                 shading: THREE.SmoothShading,
            } )
            // new THREE.MeshBasicMaterial( { color: this.light.color } ) 
        );
        this.light.add( this.lightMesh );
        this.light.castShadow = true;
        scene.add( this.light );

        let geometry = new THREE.PlaneBufferGeometry( this.raydius, this.raydius );
        // let material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        let material = new THREE.ShaderMaterial( {
            uniforms: {
                time: { value: 1.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShaderRay,
            transparent: true,
            blending: 'AdditiveBlending',
            alphaTest: .1,
            shading: THREE.SmoothShading
            // dephTest:false
        } );
        this.rays = new THREE.Mesh( geometry, material );
        // scene.add( this.rays );
    }

    update ( time ) {
        this.lightMesh.material.uniforms.time.value = time*10;

        this.rays.material.uniforms.time.value = time;

        this.lightMesh.rotation.y = -time;
    }
}
