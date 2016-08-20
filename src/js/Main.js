
// main dependencies
import THREE from 'three';

// main scss
import '../sass/app.scss';

import Step01 from './steps/01/Step01'; // Hello World
import Step02 from './steps/02/Step02'; // Plane Contain vs Cover
import Step03 from './steps/03/Step03'; // Custom Shader
import Step04 from './steps/04/Step04'; // Full screen basic post processing
import Step05 from './steps/05/Step05'; // Render Texture Material
import Step06 from './steps/06/Step06'; // Phong Material
import Step07 from './steps/07/Step07'; // Shadows
import Step08 from './steps/08/Step08'; // Sunshine
import Step09 from './steps/09/Step09'; // PostProcessing
import Step10 from './steps/10/Step10'; // GPGPU
import Step11 from './steps/11/Step11'; // test
import Step12 from './steps/12/Step12'; // test
import Step13 from './steps/13/Step13'; // lines
import Step14 from './steps/14/Step14'; // lines

const pages = [
    { hash:'#Step01', class: Step01 },
    { hash:'#Step02', class: Step02 },
    { hash:'#Step03', class: Step03 },
    { hash:'#Step04', class: Step04 },
    { hash:'#Step05', class: Step05 },
    { hash:'#Step06', class: Step06 },
    { hash:'#Step07', class: Step07 },
    { hash:'#Step08', class: Step08 },
    { hash:'#Step09', class: Step09 },
    { hash:'#Step10', class: Step10 },
    { hash:'#Step11', class: Step11 },
    { hash:'#Step12', class: Step12 },
    { hash:'#Step13', class: Step13 },
    { hash:'#Step14', class: Step14 },
];

let app = null;

readRoute();

function readRoute () {

    for ( let i=0,l=pages.length; i<l; i++ ) {
        let page = pages[i];
        if ( page.hash == window.location.hash ) {
            let previous = i > 0 ? pages[i-1].hash : '';
            let next = i < l-1 ? pages[i+1].hash : '';
            setNewApp(page.class, page.hash, previous, next);
            return;
        }
    }
    // default fallback:
    window.location.hash = pages[pages.length-1].hash;
    setNewApp( pages[pages.length-1].class, pages[pages.length-1].hash, 
        pages[pages.length-2].hash, '');
}

function setNewApp(Class, hash, previous, next) {
    console.log(' --', hash.replace('#','') );
    app = new Class;
    if ( previous != '' ) {
        let a = document.createElement('a');
        a.setAttribute('href', 'javascript:window.updateRoute("'+previous+'");');
        a.setAttribute('class','arrow-anchor left');
        a.innerHTML = '<span><</span>' + previous.replace('#','');
        document.body.appendChild(a);
    }
    if ( next != '' ) {
        let a = document.createElement('a');
        a.setAttribute('href', 'javascript:window.updateRoute("'+next+'");');
        a.setAttribute('class','arrow-anchor right');
        a.innerHTML = next.replace('#','') + '>';
        document.body.appendChild(a);
    }   
}

function updateRoute(hash) {
    window.location.hash = hash;
    window.location.reload();
}
window.updateRoute = updateRoute;
