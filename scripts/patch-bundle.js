const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Patch initial window dimensions in du.coderescue
    const oldCalc = 'var e=Math.min(1240,Math.max(940,window.innerWidth-64)),nh=Math.min(840,Math.max(640,window.innerHeight-74));return{normalW:e,normalH:nh,normalTop:Math.max(12,Math.floor((window.innerHeight-32-nh)/2)),normalLeft:Math.max(16,Math.floor((window.innerWidth-e)/2))}';
    const newCalc = 'var e=Math.min(1360,Math.max(980,window.innerWidth-100)),nh=Math.min(880,Math.max(680,window.innerHeight-90));return{normalW:e,normalH:nh,normalTop:Math.max(14,Math.floor((window.innerHeight-32-nh)/2)),normalLeft:Math.max(20,Math.floor((window.innerWidth-e)/2))}';
    
    if (content.includes(oldCalc)) {
        content = content.replace(oldCalc, newCalc);
        console.log('Patched window size calc in', filePath);
    } else {
        console.log('oldCalc not found in', filePath);
    }

    // 2. Patch stopResize Q in Pe to update O(preMaxSize) and notify onWidthChange/onHeightChange
    const oldQ = 'Q=function e(){G(!1),y(parseInt(a.current.style.width,10)),x(parseInt(a.current.style.height,10)),a.current.style.opacity=0,window.removeEventListener("mousemove",W,!1),window.removeEventListener("mouseup",e,!1)}';
    const newQ = 'Q=function e(){G(!1);var nw=parseInt(a.current.style.width,10),nh=parseInt(a.current.style.height,10);if(!isNaN(nw)&&nw>400){y(nw);O((function(e){return Object.assign({},e,{width:nw})}));t.onWidthChange&&t.onWidthChange(nw)}if(!isNaN(nh)&&nh>200){x(nh);O((function(e){return Object.assign({},e,{height:nh})}));t.onHeightChange&&t.onHeightChange(nh)}a.current.style.opacity=0,window.removeEventListener("mousemove",W,!1),window.removeEventListener("mouseup",e,!1)}';
    
    if (content.includes(oldQ)) {
        content = content.replace(oldQ, newQ);
        console.log('Patched Q in', filePath);
    } else {
        console.log('oldQ not found in', filePath);
    }

    // 3. Patch resizeHitbox onMouseDown so ghost indicator starts from current width & height
    const oldStartResize = 'onMouseDown:function(e){e.preventDefault(),G(!0),window.addEventListener("mousemove",W,!1),window.addEventListener("mouseup",Q,!1)}';
    const newStartResize = 'onMouseDown:function(e){e.preventDefault(),G(!0),a.current&&(a.current.style.width="".concat(g,"px"),a.current.style.height="".concat(b,"px"),a.current.style.opacity=1),window.addEventListener("mousemove",W,!1),window.addEventListener("mouseup",Q,!1)}';

    if (content.includes(oldStartResize)) {
        content = content.replace(oldStartResize, newStartResize);
        console.log('Patched startResize in', filePath);
    } else {
        console.log('oldStartResize not found in', filePath);
    }

    // 4. Pass onWidthChange and onHeightChange in Pe call inside du.coderescue
    const oldPeCall = 'return(0,X.jsx)(Pe,{top:A,left:v,width:c,height:p,isMaximized:C,windowTitle:"TECHASTRA 2026';
    const newPeCall = 'return(0,X.jsx)(Pe,{top:A,left:v,width:c,height:p,isMaximized:C,onWidthChange:function(e){d(e)},onHeightChange:function(e){h(e)},windowTitle:"TECHASTRA 2026';

    if (content.includes(oldPeCall)) {
        content = content.replace(oldPeCall, newPeCall);
        console.log('Patched Pe call in', filePath);
    } else {
        console.log('oldPeCall not found in', filePath);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

patchFile('static/os/static/js/main.18593012.js');
patchFile('public/os/static/js/main.18593012.js');
console.log('Bundle patching completed successfully.');
