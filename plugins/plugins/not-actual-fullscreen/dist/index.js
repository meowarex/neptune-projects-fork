var h=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var k=(t,e)=>()=>(t&&(e=t(t=0)),e);var B=(t,e)=>{for(var s in e)h(t,s,{get:e[s],enumerable:!0})},O=(t,e,s,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of A(e))!R.call(t,n)&&n!==s&&h(t,n,{get:()=>e[n],enumerable:!(a=N(e,n))||a.enumerable});return t};var P=t=>O(h({},"__esModule",{value:!0}),t);var v={};B(v,{Tracer:()=>f,libTrace:()=>_});import{actions as C}from"@neptune";var f,_,E=k(()=>{"use strict";f=t=>{let e=c=>{let l=(...i)=>{c(t,...i)};return l.withContext=i=>(...p)=>{c(t,i,...p)},l},s=e(console.log),a=e(console.warn),n=e(console.error),r=e(console.debug),o=(c,l,i)=>{let p=m=>{c(m),l({message:`${t} - ${m}`,category:"OTHER",severity:i})};return p.withContext=m=>{let S=c.withContext(m);return d=>{S(d),d instanceof Error&&(d=d.message),l({message:`${t}.${m} - ${d}`,category:"OTHER",severity:i})}},p};return{log:s,warn:a,err:n,debug:r,msg:{log:o(s,C.message.messageInfo,"INFO"),warn:o(a,C.message.messageWarn,"WARN"),err:o(n,C.message.messageError,"ERROR")}}},_=f("[lib]")});E();var L=[];function w(t,e,s=1){let a=document.querySelector('[class*="moreContainer"'),n=document.createElement("button");n.style.width="32px",n.style.height="32px",n.style.border="none",n.classList.add("xcl_customButton");let r=document.createElement("img");r.src=e,r.style.width="100%",r.style.height="100%",n.onclick=t,n.appendChild(r);let o=Array.from(a.children);return s<=o.length?a.insertBefore(n,o[s-1]):a.appendChild(n),L.push(n),n}E();var D=f("[Clean View]"),M=`
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
`;function I(t){let e=document.createElement("style");return e.type="text/css",e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t)),document.head.appendChild(e),e}async function U(t){try{let e=await fetch(t);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);return await e.text()}catch(e){return D.msg.err(`Failed to fetch URL: ${e.message}`),null}}var b=!1,x,K=w(()=>{b?x&&x.remove():x=I(M),b=!b},"https://cdn.discordapp.com/attachments/1286571643807731783/1344515636675612712/image.png?ex=67c13143&is=67bfdfc3&hm=1573e29efdf882292922736e5ae2df6a87b7ad316add6fc498eee8ce799fb8e4&",2),$="https://raw.githubusercontent.com/ItzzExcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css",T,u;(async()=>(T=await U($),u=I(T)))();function y(){let t=document.querySelector('[class^="trackTitleContainer"]');t&&t.addEventListener("DOMSubtreeModified",()=>{setTimeout(()=>{g()},300)})}var g=function(t=0){t===1&&setTimeout(()=>{g()},2e3);let e=document.querySelector('figure[class*="albumImage"] > div > div > div > img'),s;e&&(s=e.src,s=s.replace(/\d+x\d+/,"1280x1280"),e.src=s);let a=document.querySelector('[class*="nowPlayingContainer"]');if(a&&s){a.querySelectorAll(".corner-image").forEach(c=>c.remove());let r=document.createElement("img");r.src=s,r.className="corner-image",r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)",r.style.width="75vw",r.style.height="150vh",r.style.objectFit="cover",r.style.zIndex="-1",r.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",r.style.animation="spin 35s linear infinite",a.appendChild(r);let o=document.createElement("img");if(o.src=s,o.className="corner-image",o.style.position="absolute",o.style.left="50%",o.style.top="50%",o.style.transform="translate(-50%, -50%)",o.style.width="75vw",o.style.height="150vh",o.style.objectFit="cover",o.style.zIndex="-1",o.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",o.style.animation="spin 35s linear infinite",a.appendChild(o),!document.querySelector("#spinAnimation")){let c=document.createElement("style");c.id="spinAnimation",c.textContent=`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `,document.head.appendChild(c)}}},F=function(){[...document.getElementsByClassName("corner-image")].forEach(t=>{t.remove()})},H=["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION","playbackControls/MEDIA_PRODUCT_TRANSITION"],z=H.map(t=>intercept(t,()=>{g(1)}));y();y();y();y();function j(){u&&u.parentNode&&u.parentNode.removeChild(u)}function Y(){j(),z.forEach(e=>e()),F();let t=document.querySelector('div[class^="trackTitleContainer"]');t&&t.removeEventListener("DOMSubtreeModified",g)}export{Y as onUnload};
