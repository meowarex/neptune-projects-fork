var C=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var B=(e,t)=>()=>(e&&(t=e(e=0)),t);var O=(e,t)=>{for(var o in t)C(e,o,{get:t[o],enumerable:!0})},P=(e,t,o,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of k(t))!R.call(e,s)&&s!==o&&C(e,s,{get:()=>t[s],enumerable:!(a=A(t,s))||a.enumerable});return e};var L=e=>P(C({},"__esModule",{value:!0}),e);var x={};O(x,{Tracer:()=>g,libTrace:()=>q});import{actions as b}from"@neptune";var g,q,E=B(()=>{"use strict";g=e=>{let t=i=>{let m=(...c)=>{i(e,...c)};return m.withContext=c=>(...f)=>{i(e,c,...f)},m},o=t(console.log),a=t(console.warn),s=t(console.error),n=t(console.debug),r=(i,m,c)=>{let f=u=>{i(u),m({message:`${e} - ${u}`,category:"OTHER",severity:c})};return f.withContext=u=>{let N=i.withContext(u);return d=>{N(d),d instanceof Error&&(d=d.message),m({message:`${e}.${u} - ${d}`,category:"OTHER",severity:c})}},f};return{log:o,warn:a,err:s,debug:n,msg:{log:r(o,b.message.messageInfo,"INFO"),warn:r(a,b.message.messageWarn,"WARN"),err:r(s,b.message.messageError,"ERROR")}}},q=g("[lib]")});E();var T=[];function w(e,t,o=1){setTimeout(()=>{let a=document.querySelector('[class*="_moreContainer"'),s=document.createElement("button");s.style.width="40px",s.style.border="none",s.classList.add("xcl_customButton");let n=document.createElement("img");n.src=t,n.style.width="100%",n.style.height="100%",s.onclick=e,s.appendChild(n);let r=Array.from(a.children);return o<=r.length?a.insertBefore(s,r[o-1]):a.appendChild(s),T.push(s),s},1e3)}function S(){Array.from(T).forEach(e=>{e.remove()}),Array.from(document.getElementsByClassName("xcl_customButton")).forEach(e=>{e.remove()})}import{intercept as M}from"@neptune";E();var U=g("[Clean View]"),$=`
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
`;function _(e){let t=document.createElement("style");return t.type="text/css",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),t}async function F(e){try{let t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);return await t.text()}catch(t){return U.msg.err(`Failed to fetch URL: ${t.message}`),null}}var v=!1,l,Z=w(()=>{v?l&&l.remove():l=_($),v=!v},"https://lexploits.top/favicon.ico",2),H="https://raw.githubusercontent.com/itzzexcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css",I,p;(async()=>(I=await F(H),p=_(I)))();function h(){let e=document.querySelector('[class^="_trackTitleContainer"]');e&&e.addEventListener("DOMSubtreeModified",()=>{setTimeout(()=>{y()},300)})}var y=function(e=0){e===1&&setTimeout(()=>{y()},2e3);let t=document.querySelector('figure[class*="_albumImage"] > div > div > div > img'),o;t&&(o=t.src,o=o.replace(/\d+x\d+/,"1280x1280"),t.src=o);let a=document.querySelector('[class*="_nowPlayingContainer"]');if(a&&o){a.querySelectorAll(".corner-image").forEach(i=>i.remove());let n=document.createElement("img");n.src=o,n.className="corner-image",n.style.position="absolute",n.style.left="50%",n.style.top="50%",n.style.transform="translate(-50%, -50%)",n.style.width="75vw",n.style.height="150vh",n.style.objectFit="cover",n.style.zIndex="-1",n.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",n.style.animation="spin 35s linear infinite",a.appendChild(n);let r=document.createElement("img");if(r.src=o,r.className="corner-image",r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)",r.style.width="75vw",r.style.height="150vh",r.style.objectFit="cover",r.style.zIndex="-1",r.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",r.style.animation="spin 20s linear infinite",a.appendChild(r),!document.querySelector("#spinAnimation")){let i=document.createElement("style");i.id="spinAnimation",i.textContent=`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `,document.head.appendChild(i)}}},z=function(){[...document.getElementsByClassName("corner-image")].forEach(e=>{e.remove()})},j=["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION","playbackControls/MEDIA_PRODUCT_TRANSITION"],V=j.map(e=>M(e,()=>{y(1)}));h();h();h();h();y(1);function W(){p&&p.parentNode&&p.parentNode.removeChild(p),l&&l.parentNode&&l.parentNode.removeChild(l)}function ee(){W(),S(),V.forEach(t=>t()),z();let e=document.querySelector('div[class^="_trackTitleContainer"]');e&&e.removeEventListener("DOMSubtreeModified",y)}export{ee as onUnload};
