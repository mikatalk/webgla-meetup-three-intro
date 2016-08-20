#webgla-meetup-three-intro

Materail presented during WebGLA meetup: http://www.meetup.com/LA-WebGL-Devs/

### Install/Setup
`npm install`

`npm run build`

### Dev
`npm run dev`

------

Step by step, starting easy with the basics (geometry, camera, materials, lighting, shadows) to more complex stuff like (shaders, postprocessing, particle system)

#####Step 1
..*Hello world, basic 3D geometry with wireframe material.

#####Step 2 
..*Responsive frame, explain briefly shaders vertex vs fragment 

#####Step 3 
..*Custom Shader, uniforms, swizzling 
..*FPS/Stats

#####Step 4
..*Fullscreen shader, basic 2D 
..*Processing shader
..*GUI tools

#####Step 5 
..*ShaderMaterial on sphere geometry
..*Orbits controls
..*Step 6
..*Phong Material
..*RTT
..*Lights

#####Step 7
..*Basic solar system trigonometry
..*Lights + Shadow

#####Step 8 
..*Overlapping 2d elements over 3d scene (sun glow effect)

#####Step 9 
..*Post processing ( passes chaining, blend effect, blur, etc...)

#####Step 10 
..*Putting it together
..*Add particle system

#####Step 11 
..*GPGPU particles (general purpose graphic processing unit) Ping pong technique
..*L.195 of GPGPUParticles.js (fillTextures) - using a texture rgb channels as xyz coordinate

#####Step 12
..*Modifying the xyz position variables in the fragment shader
..*Using modulo to loop the particle movement (L.16)

#####Step 13 
..*Modifying the varying variable color of the particle in the shader

#####Step 14 
..*Draw smooth lines with dots

