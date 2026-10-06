const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove collapsing onWidthChange / onHeightChange from du.coderescue Pe call
    const collapsingPeCall = 'return(0,X.jsx)(Pe,{top:A,left:v,width:c,height:p,isMaximized:C,onWidthChange:function(e){d(e)},onHeightChange:function(e){h(e)},windowTitle:"TECHASTRA 2026';
    const cleanPeCall = 'return(0,X.jsx)(Pe,{top:A,left:v,width:c,height:p,isMaximized:C,windowTitle:"TECHASTRA 2026';

    if (content.includes(collapsingPeCall)) {
        content = content.replace(collapsingPeCall, cleanPeCall);
        console.log('Removed collapsing onWidthChange from', filePath);
    }

    // 2. Ensure initial window dimensions in du.coderescue are generous and comfortable
    const oldCalc = 'var e=Math.min(1240,Math.max(940,window.innerWidth-64)),nh=Math.min(840,Math.max(640,window.innerHeight-74));return{normalW:e,normalH:nh,normalTop:Math.max(12,Math.floor((window.innerHeight-32-nh)/2)),normalLeft:Math.max(16,Math.floor((window.innerWidth-e)/2))}';
    const newCalc = 'var e=Math.min(1360,Math.max(980,window.innerWidth-100)),nh=Math.min(880,Math.max(680,window.innerHeight-90));return{normalW:e,normalH:nh,normalTop:Math.max(14,Math.floor((window.innerHeight-32-nh)/2)),normalLeft:Math.max(20,Math.floor((window.innerWidth-e)/2))}';

    if (content.includes(oldCalc)) {
        content = content.replace(oldCalc, newCalc);
        console.log('Updated window dimensions calc in', filePath);
    }

    // 3. Bulletproof inline style on Window div so it NEVER collapses to NaN or 0 width/height
    const oldWindowStyle = 'style:Object.assign({},ze.window,{width:g,height:b,top:u,left:p})';
    const safeWindowStyle = 'style:Object.assign({},ze.window,{width:(g&&!isNaN(g)&&g>=300)?g:1360,height:(b&&!isNaN(b)&&b>=200)?b:880,top:(typeof u==="number"&&!isNaN(u)&&u>=0)?u:14,left:(typeof p==="number"&&!isNaN(p)&&p>=0)?p:20})';

    if (content.includes(oldWindowStyle)) {
        content = content.replace(oldWindowStyle, safeWindowStyle);
        console.log('Patched safe Window style in', filePath);
    } else {
        console.log('oldWindowStyle already patched or not found in', filePath);
    }

    // 4. Bulletproof initial state of Pe: default width and height to 1360 and 880 if not a number >= 300
    const oldStateWidth = 'A=l((0,e.useState)(t.width),2),g=A[0],y=A[1],v=l((0,e.useState)(t.height),2),b=v[0],x=v[1]';
    const safeStateWidth = 'A=l((0,e.useState)(t.width&&!isNaN(t.width)&&t.width>=300?t.width:1360),2),g=A[0],y=A[1],v=l((0,e.useState)(t.height&&!isNaN(t.height)&&t.height>=200?t.height:880),2),b=v[0],x=v[1]';

    if (content.includes(oldStateWidth)) {
        content = content.replace(oldStateWidth, safeStateWidth);
        console.log('Patched safe state width in', filePath);
    } else {
        console.log('oldStateWidth already patched or not found in', filePath);
    }

    // 5. Ensure stopResize Q in Pe updates internal width, height, and preMaxSize with NaN guards
    const oldQ = 'Q=function e(){G(!1),y(parseInt(a.current.style.width,10)),x(parseInt(a.current.style.height,10)),a.current.style.opacity=0,window.removeEventListener("mousemove",W,!1),window.removeEventListener("mouseup",e,!1)}';
    const safeQ = 'Q=function e(){G(!1);var nw=parseInt(a.current.style.width,10),nh=parseInt(a.current.style.height,10);if(!isNaN(nw)&&nw>=400){y(nw);O((function(e){return Object.assign({},e,{width:nw})}))}if(!isNaN(nh)&&nh>=200){x(nh);O((function(e){return Object.assign({},e,{height:nh})}))}a.current.style.opacity=0,window.removeEventListener("mousemove",W,!1),window.removeEventListener("mouseup",e,!1)}';

    if (content.includes(oldQ)) {
        content = content.replace(oldQ, safeQ);
        console.log('Updated Q in', filePath);
    }

    // 6. Ensure ze window styles have flex layout, 100% height, and min dimensions
    const oldZeWindow = 'window:{backgroundColor:c.lightGray,position:"absolute"}';
    const safeZeWindow = 'window:{backgroundColor:c.lightGray,position:"absolute",display:"flex",flexDirection:"column",boxSizing:"border-box",minWidth:"480px",minHeight:"320px"}';
    if (content.includes(oldZeWindow)) {
        content = content.replace(oldZeWindow, safeZeWindow);
        console.log('Patched ze.window flex layout in', filePath);
    }

    const oldZeOuterBorder = 'windowBorderOuter:{border:"1px solid ".concat(c.black),borderTopColor:c.lightGray,borderLeftColor:c.lightGray,flex:1}';
    const safeZeOuterBorder = 'windowBorderOuter:{border:"1px solid ".concat(c.black),borderTopColor:c.lightGray,borderLeftColor:c.lightGray,flex:1,display:"flex",flexDirection:"column",height:"100%",boxSizing:"border-box"}';
    if (content.includes(oldZeOuterBorder)) {
        content = content.replace(oldZeOuterBorder, safeZeOuterBorder);
        console.log('Patched ze.windowBorderOuter in', filePath);
    }

    const oldZeInnerBorder = 'windowBorderInner:{border:"1px solid ".concat(c.darkGray),borderTopColor:c.white,borderLeftColor:c.white,flex:1,padding:2,flexDirection:"column"}';
    const safeZeInnerBorder = 'windowBorderInner:{border:"1px solid ".concat(c.darkGray),borderTopColor:c.white,borderLeftColor:c.white,flex:1,padding:2,flexDirection:"column",display:"flex",height:"100%",boxSizing:"border-box"}';
    if (content.includes(oldZeInnerBorder)) {
        content = content.replace(oldZeInnerBorder, safeZeInnerBorder);
        console.log('Patched ze.windowBorderInner in', filePath);
    }

    const oldZeContentOuter = 'contentOuter:{border:"1px solid ".concat(c.white),borderTopColor:c.darkGray,borderLeftColor:c.darkGray,flexGrow:1,marginTop:8,marginBottom:8,overflow:"hidden"}';
    const safeZeContentOuter = 'contentOuter:{border:"1px solid ".concat(c.white),borderTopColor:c.darkGray,borderLeftColor:c.darkGray,flexGrow:1,flex:1,display:"flex",flexDirection:"column",marginTop:8,marginBottom:8,overflow:"hidden",boxSizing:"border-box"}';
    if (content.includes(oldZeContentOuter)) {
        content = content.replace(oldZeContentOuter, safeZeContentOuter);
        console.log('Patched ze.contentOuter in', filePath);
    }

    const oldZeContentInner = 'contentInner:{border:"1px solid ".concat(c.lightGray),borderTopColor:c.black,borderLeftColor:c.black,flex:1,overflow:"hidden"}';
    const safeZeContentInner = 'contentInner:{border:"1px solid ".concat(c.lightGray),borderTopColor:c.black,borderLeftColor:c.black,flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",boxSizing:"border-box"}';
    if (content.includes(oldZeContentInner)) {
        content = content.replace(oldZeContentInner, safeZeContentInner);
        console.log('Patched ze.contentInner in', filePath);
    }

    const oldZeContent = 'content:{flex:1,position:"relative",overflowX:"hidden",backgroundColor:c.white}';
    const safeZeContent = 'content:{flex:1,display:"flex",flexDirection:"column",height:"100%",position:"relative",overflowX:"hidden",backgroundColor:c.white,boxSizing:"border-box"}';
    if (content.includes(oldZeContent)) {
        content = content.replace(oldZeContent, safeZeContent);
        console.log('Patched ze.content in', filePath);
    }

    const oldZeBottomBar = 'bottomBar:{flexShrink:1,width:"100%",height:20}';
    const safeZeBottomBar = 'bottomBar:{flexShrink:0,width:"100%",height:20,display:"flex"}';
    if (content.includes(oldZeBottomBar)) {
        content = content.replace(oldZeBottomBar, safeZeBottomBar);
        console.log('Patched ze.bottomBar in', filePath);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

patchFile('static/os/static/js/main.18593012.js');
patchFile('public/os/static/js/main.18593012.js');
console.log('Bundles updated successfully.');

// Cache bust static/os/index.html and public/os/index.html
function updateIndexHtml(htmlPath) {
    if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace(/\?v=20261006_v[0-9]+/g, '?v=20261006_v13');
        fs.writeFileSync(htmlPath, html, 'utf8');
        console.log('Cache-busted', htmlPath, 'to v13');
    }
}

updateIndexHtml('static/os/index.html');
updateIndexHtml('public/os/index.html');
