var C=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var R=Object.getOwnPropertyNames;var B=Object.prototype.hasOwnProperty;var O=(t,e)=>()=>(t&&(e=t(t=0)),e);var P=(t,e)=>{for(var n in e)C(t,n,{get:e[n],enumerable:!0})},q=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of R(e))!B.call(t,s)&&s!==n&&C(t,s,{get:()=>e[s],enumerable:!(a=k(e,s))||a.enumerable});return t};var L=t=>q(C({},"__esModule",{value:!0}),t);var x={};P(x,{Tracer:()=>g,libTrace:()=>D});import{actions as b}from"@neptune";var g,D,E=O(()=>{"use strict";g=t=>{let e=i=>{let m=(...c)=>{i(t,...c)};return m.withContext=c=>(...f)=>{i(t,c,...f)},m},n=e(console.log),a=e(console.warn),s=e(console.error),r=e(console.debug),o=(i,m,c)=>{let f=u=>{i(u),m({message:`${t} - ${u}`,category:"OTHER",severity:c})};return f.withContext=u=>{let A=i.withContext(u);return d=>{A(d),d instanceof Error&&(d=d.message),m({message:`${t}.${u} - ${d}`,category:"OTHER",severity:c})}},f};return{log:n,warn:a,err:s,debug:r,msg:{log:o(n,b.message.messageInfo,"INFO"),warn:o(a,b.message.messageWarn,"WARN"),err:o(s,b.message.messageError,"ERROR")}}},D=g("[lib]")});E();var T=[];function w(t,e,n=1){setTimeout(()=>{let a=document.querySelector('[class*="_moreContainer"'),s=document.createElement("button");s.style.width="40px",s.style.border="none",s.classList.add("xcl_customButton");let r=document.createElement("img");r.src=e,r.style.width="100%",r.style.height="100%",s.onclick=t,s.appendChild(r);let o=Array.from(a.children);return n<=o.length?a.insertBefore(s,o[n-1]):a.appendChild(s),T.push(s),s},1e3)}function S(){Array.from(T).forEach(t=>{t.remove()}),Array.from(document.getElementsByClassName("xcl_customButton")).forEach(t=>{t.remove()})}import{intercept as U}from"@neptune";E();var $=g("[Clean View]"),F=`
[data-test="footer-player"], [class*="tabItems"] {
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out;
}

[class*="_imageContainer"] {
    margin-top: 140px;
}

[data-test="footer-player"]:hover, [class*="_tabItems"]:hover {
    opacity: 1 !important;
}

[data-test="header-container"] {
    opacity: 0;
    margin: -40px;
}

[class*="_nowPlayingContainer"] {
    padding-left: 6%;
}

[class^="_bar"] {
    background-color: transparent;
}

[class^="_bar"]>* {
    opacity: 0;
}
`;function _(t){let e=document.createElement("style");return e.type="text/css",e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t)),document.head.appendChild(e),e}async function H(t){try{let e=await fetch(t);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return await e.text()}catch(e){return $.msg.err(`Failed to fetch URL: ${e.message}`),null}}var v=!1,l,Z=w(()=>{v?l&&l.remove():l=_(F),v=!v},"https://lexploits.top/favicon.ico",2),z="https://raw.githubusercontent.com/itzzexcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css",I,p;(async()=>(I=await H(z),p=_(I)))();function h(){let t=document.querySelector('[class^="_trackTitleContainer"]');t&&t.addEventListener("DOMSubtreeModified",()=>{setTimeout(()=>{y()},300)})}var y=function(t=0){t===1&&setTimeout(()=>{y()},2e3);let e=document.querySelector('figure[class*="_albumImage"] > div > div > div > img'),n;e?(n=e.src,n=n.replace(/\d+x\d+/,"1280x1280"),e.src=n):(e=document.querySelector('figure[class*="_albumImage"] > div > div > div > video'))?(n=e.getAttribute("poster"),n=n.replace(/\d+x\d+/,"1280x1280"),e.src=n):(N(),console.log("Couldn't get album art"));let a=document.querySelector('[class*="_nowPlayingContainer"]');if(a&&n){a.querySelectorAll(".corner-image").forEach(i=>i.remove());let r=document.createElement("img");r.src=n,r.className="corner-image",r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)",r.style.width="75vw",r.style.height="150vh",r.style.objectFit="cover",r.style.zIndex="-1",r.style.filter="blur(100px) brightness(0.4) contrast(1.2) saturate(1)",r.style.animation="spin 35s linear infinite",r.style.animationDelay="5s",a.appendChild(r);let o=document.createElement("img");if(o.src=n,o.className="corner-image",o.style.position="absolute",o.style.left="50%",o.style.top="50%",o.style.transform="translate(-50%, -50%)",o.style.width="75vw",o.style.height="150vh",o.style.objectFit="cover",o.style.zIndex="-1",o.style.filter="blur(100px) brightness(0.4) contrast(1.2) saturate(1)",o.style.animation="spin 35s linear infinite",a.appendChild(o),!document.querySelector("#spinAnimation")){let i=document.createElement("style");i.id="spinAnimation",i.textContent=`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `,document.head.appendChild(i)}}},N=function(){[...document.getElementsByClassName("corner-image")].forEach(t=>{t.remove()})},j=["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION","playbackControls/MEDIA_PRODUCT_TRANSITION"],V=j.map(t=>U(t,()=>{y(1)}));h();h();h();h();y(1);function W(){p&&p.parentNode&&p.parentNode.removeChild(p),l&&l.parentNode&&l.parentNode.removeChild(l)}function ee(){W(),S(),V.forEach(e=>e()),N();let t=document.querySelector('div[class^="_trackTitleContainer"]');t&&t.removeEventListener("DOMSubtreeModified",y)}export{ee as onUnload};
