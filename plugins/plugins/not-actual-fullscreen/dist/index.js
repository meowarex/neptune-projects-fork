var h=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var B=Object.prototype.hasOwnProperty;var O=(e,t)=>()=>(e&&(t=e(e=0)),t);var P=(e,t)=>{for(var s in t)h(e,s,{get:t[s],enumerable:!0})},_=(e,t,s,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of k(t))!B.call(e,n)&&n!==s&&h(e,n,{get:()=>t[n],enumerable:!(a=R(t,n))||a.enumerable});return e};var L=e=>_(h({},"__esModule",{value:!0}),e);var v={};P(v,{Tracer:()=>f,libTrace:()=>q});import{actions as C}from"@neptune";var f,q,b=O(()=>{"use strict";f=e=>{let t=i=>{let l=(...c)=>{i(e,...c)};return l.withContext=c=>(...p)=>{i(e,c,...p)},l},s=t(console.log),a=t(console.warn),n=t(console.error),r=t(console.debug),o=(i,l,c)=>{let p=m=>{i(m),l({message:`${e} - ${m}`,category:"OTHER",severity:c})};return p.withContext=m=>{let A=i.withContext(m);return u=>{A(u),u instanceof Error&&(u=u.message),l({message:`${e}.${m} - ${u}`,category:"OTHER",severity:c})}},p};return{log:s,warn:a,err:n,debug:r,msg:{log:o(s,C.message.messageInfo,"INFO"),warn:o(a,C.message.messageWarn,"WARN"),err:o(n,C.message.messageError,"ERROR")}}},q=f("[lib]")});b();var w=[];function T(e,t,s=1){let a=document.querySelector('[class*="moreContainer"'),n=document.createElement("button");n.style.width="32px",n.style.height="32px",n.style.border="none",n.classList.add("xcl_customButton");let r=document.createElement("img");r.src=t,r.style.width="100%",r.style.height="100%",n.onclick=e,n.appendChild(r);let o=Array.from(a.children);return s<=o.length?a.insertBefore(n,o[s-1]):a.appendChild(n),w.push(n),n}function S(){Array.from(w).forEach(e=>{e.remove()}),Array.from(document.getElementsByClassName("xcl_customButton")).forEach(e=>{e.remove()})}import{intercept as M}from"@neptune";b();var U=f("[Clean View]"),$=`
[data-test="footer-player"], [class*="tabItems"] {
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out;
}

[class*="imageContainer"] {
    margin-top: 140px;
}

[data-test="footer-player"]:hover, [class*="tabItems"]:hover {
    opacity: 1 !important;
}

[data-test="header-container"] {
    opacity: 0;
    margin: -40px;
}

[class*="nowPlayingContainer"] {
    padding-left: 6%;
}
`;function N(e){let t=document.createElement("style");return t.type="text/css",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),t}async function F(e){try{let t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);return await t.text()}catch(t){return U.msg.err(`Failed to fetch URL: ${t.message}`),null}}var E=!1,x,Z=T(()=>{E?x&&x.remove():x=N($),E=!E},"https://cdn.discordapp.com/attachments/1286571643807731783/1344515636675612712/image.png?ex=67c13143&is=67bfdfc3&hm=1573e29efdf882292922736e5ae2df6a87b7ad316add6fc498eee8ce799fb8e4&",2),H="https://raw.githubusercontent.com/itzzexcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css",I,d;(async()=>(I=await F(H),d=N(I)))();function y(){let e=document.querySelector('[class^="trackTitleContainer"]');e&&e.addEventListener("DOMSubtreeModified",()=>{setTimeout(()=>{g()},300)})}var g=function(e=0){e===1&&setTimeout(()=>{g()},2e3);let t=document.querySelector('figure[class*="albumImage"] > div > div > div > img'),s;t&&(s=t.src,s=s.replace(/\d+x\d+/,"1280x1280"),t.src=s);let a=document.querySelector('[class*="nowPlayingContainer"]');if(a&&s){a.querySelectorAll(".corner-image").forEach(i=>i.remove());let r=document.createElement("img");r.src=s,r.className="corner-image",r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)",r.style.width="75vw",r.style.height="150vh",r.style.objectFit="cover",r.style.zIndex="-1",r.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",r.style.animation="spin 35s linear infinite",a.appendChild(r);let o=document.createElement("img");if(o.src=s,o.className="corner-image",o.style.position="absolute",o.style.left="50%",o.style.top="50%",o.style.transform="translate(-50%, -50%)",o.style.width="75vw",o.style.height="150vh",o.style.objectFit="cover",o.style.zIndex="-1",o.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",o.style.animation="spin 35s linear infinite",a.appendChild(o),!document.querySelector("#spinAnimation")){let i=document.createElement("style");i.id="spinAnimation",i.textContent=`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `,document.head.appendChild(i)}}},z=function(){[...document.getElementsByClassName("corner-image")].forEach(e=>{e.remove()})},j=["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION","playbackControls/MEDIA_PRODUCT_TRANSITION"],V=j.map(e=>M(e,()=>{g(1)}));y();y();y();y();function W(){d&&d.parentNode&&d.parentNode.removeChild(d)}function ee(){W(),S(),V.forEach(t=>t()),z();let e=document.querySelector('div[class^="trackTitleContainer"]');e&&e.removeEventListener("DOMSubtreeModified",g)}export{ee as onUnload};
