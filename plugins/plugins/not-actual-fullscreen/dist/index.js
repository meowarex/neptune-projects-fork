var C=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var B=Object.prototype.hasOwnProperty;var O=(e,t)=>()=>(e&&(t=e(e=0)),t);var P=(e,t)=>{for(var s in t)C(e,s,{get:t[s],enumerable:!0})},_=(e,t,s,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of k(t))!B.call(e,n)&&n!==s&&C(e,n,{get:()=>t[n],enumerable:!(a=R(t,n))||a.enumerable});return e};var L=e=>_(C({},"__esModule",{value:!0}),e);var v={};P(v,{Tracer:()=>g,libTrace:()=>q});import{actions as b}from"@neptune";var g,q,E=O(()=>{"use strict";g=e=>{let t=i=>{let m=(...l)=>{i(e,...l)};return m.withContext=l=>(...y)=>{i(e,l,...y)},m},s=t(console.log),a=t(console.warn),n=t(console.error),r=t(console.debug),o=(i,m,l)=>{let y=u=>{i(u),m({message:`${e} - ${u}`,category:"OTHER",severity:l})};return y.withContext=u=>{let A=i.withContext(u);return d=>{A(d),d instanceof Error&&(d=d.message),m({message:`${e}.${u} - ${d}`,category:"OTHER",severity:l})}},y};return{log:s,warn:a,err:n,debug:r,msg:{log:o(s,b.message.messageInfo,"INFO"),warn:o(a,b.message.messageWarn,"WARN"),err:o(n,b.message.messageError,"ERROR")}}},q=g("[lib]")});E();var T=[];function w(e,t,s=1){setTimeout(()=>{let a=document.querySelector('[class*="moreContainer"'),n=document.createElement("button");n.style.width="32px",n.style.height="32px",n.style.border="none",n.classList.add("xcl_customButton");let r=document.createElement("img");r.src=t,r.style.width="100%",r.style.height="100%",n.onclick=e,n.appendChild(r);let o=Array.from(a.children);return s<=o.length?a.insertBefore(n,o[s-1]):a.appendChild(n),T.push(n),n},2e3)}function S(){Array.from(T).forEach(e=>{e.remove()}),Array.from(document.getElementsByClassName("xcl_customButton")).forEach(e=>{e.remove()})}import{intercept as M}from"@neptune";E();var U=g("[Clean View]"),$=`
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
`;function N(e){let t=document.createElement("style");return t.type="text/css",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),t}async function F(e){try{let t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);return await t.text()}catch(t){return U.msg.err(`Failed to fetch URL: ${t.message}`),null}}var x=!1,c,Z=w(()=>{x?c&&c.remove():c=N($),x=!x},"https://cdn.discordapp.com/attachments/1286571643807731783/1344515636675612712/image.png?ex=67c13143&is=67bfdfc3&hm=1573e29efdf882292922736e5ae2df6a87b7ad316add6fc498eee8ce799fb8e4&",2),H="https://raw.githubusercontent.com/itzzexcel/neptune-projects/refs/heads/main/plugins/plugins/not-actual-fullscreen/src/separated-lyrics.css",I,p;(async()=>(I=await F(H),p=N(I)))();function h(){let e=document.querySelector('[class^="trackTitleContainer"]');e&&e.addEventListener("DOMSubtreeModified",()=>{setTimeout(()=>{f()},300)})}var f=function(e=0){e===1&&setTimeout(()=>{f()},2e3);let t=document.querySelector('figure[class*="albumImage"] > div > div > div > img'),s;t&&(s=t.src,s=s.replace(/\d+x\d+/,"1280x1280"),t.src=s);let a=document.querySelector('[class*="nowPlayingContainer"]');if(a&&s){a.querySelectorAll(".corner-image").forEach(i=>i.remove());let r=document.createElement("img");r.src=s,r.className="corner-image",r.style.position="absolute",r.style.left="50%",r.style.top="50%",r.style.transform="translate(-50%, -50%)",r.style.width="75vw",r.style.height="150vh",r.style.objectFit="cover",r.style.zIndex="-1",r.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",r.style.animation="spin 35s linear infinite",a.appendChild(r);let o=document.createElement("img");if(o.src=s,o.className="corner-image",o.style.position="absolute",o.style.left="50%",o.style.top="50%",o.style.transform="translate(-50%, -50%)",o.style.width="75vw",o.style.height="150vh",o.style.objectFit="cover",o.style.zIndex="-1",o.style.filter="blur(100px) brightness(0.6) contrast(1.2) saturate(1)",o.style.animation="spin 35s linear infinite",a.appendChild(o),!document.querySelector("#spinAnimation")){let i=document.createElement("style");i.id="spinAnimation",i.textContent=`
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `,document.head.appendChild(i)}}},z=function(){[...document.getElementsByClassName("corner-image")].forEach(e=>{e.remove()})},j=["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION","playbackControls/MEDIA_PRODUCT_TRANSITION"],V=j.map(e=>M(e,()=>{f(1)}));h();h();h();h();f(1);function W(){p&&p.parentNode&&p.parentNode.removeChild(p),c&&c.parentNode&&c.parentNode.removeChild(c)}function ee(){W(),S(),V.forEach(t=>t()),z();let e=document.querySelector('div[class^="trackTitleContainer"]');e&&e.removeEventListener("DOMSubtreeModified",f)}export{ee as onUnload};
