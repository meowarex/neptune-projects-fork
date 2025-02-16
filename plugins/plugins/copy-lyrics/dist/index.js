var p=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var b=Object.prototype.hasOwnProperty;var v=(t,e)=>()=>(t&&(e=t(t=0)),e);var T=(t,e)=>{for(var n in e)p(t,n,{get:e[n],enumerable:!0})},R=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of S(e))!b.call(t,r)&&r!==n&&p(t,r,{get:()=>e[r],enumerable:!(a=w(e,r))||a.enumerable});return t};var L=t=>R(p({},"__esModule",{value:!0}),t);var E={};T(E,{Tracer:()=>u,libTrace:()=>N});import{actions as f}from"@neptune";var u,N,y=v(()=>{"use strict";u=t=>{let e=o=>{let c=(...i)=>{o(t,...i)};return c.withContext=i=>(...m)=>{o(t,i,...m)},c},n=e(console.log),a=e(console.warn),r=e(console.error),g=e(console.debug),s=(o,c,i)=>{let m=l=>{o(l),c({message:`${t} - ${l}`,category:"OTHER",severity:i})};return m.withContext=l=>{let C=o.withContext(l);return d=>{C(d),d instanceof Error&&(d=d.message),c({message:`${t}.${l} - ${d}`,category:"OTHER",severity:i})}},m};return{log:n,warn:a,err:r,debug:g,msg:{log:s(n,f.message.messageInfo,"INFO"),warn:s(a,f.message.messageWarn,"WARN"),err:s(r,f.message.messageError,"ERROR")}}},N=u("[lib]")});y();y();var h=u("[Copy Lyrics]"),A=`
[class^="lyricsText"]>div>span {
    user-select: text;
    cursor: text;
    
}

::selection {
    background:rgb(0, 0, 0);
    color:rgb(255, 255, 255);
}
`;function O(t){let e=document.createElement("style");e.type="text/css",e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t)),document.head.appendChild(e)}function $(t){let e=document.createElement("textarea");e.value=t,e.style.position="fixed",document.body.appendChild(e),e.select();try{if(!document.execCommand("copy"))throw new Error("Failed to copy text.")}catch(n){h.msg.err(n)}finally{document.body.removeChild(e)}}O(A);var x=!1;document.addEventListener("mousedown",function(){x=!0});document.addEventListener("mouseup",function(t){if(x){let e=window.getSelection();if(e.toString().length>0){let n=[],g=e.getRangeAt(0).commonAncestorContainer.getElementsByTagName("span");for(let o of g)e.containsNode(o,!0)&&n.push(o);let s="";n.forEach(o=>{s+=o.textContent+`
`,[...o.classList].some(c=>c.startsWith("endOfStanza--"))&&(s+=`
`)}),s=s.trim(),$(s),h.msg.log("Copied to clipboard!"),window.getSelection&&e.removeAllRanges()}x=!1}});function F(){styleElement&&styleElement.parentNode&&styleElement.parentNode.removeChild(styleElement),document.removeEventListener("mousedown",onMouseDown),document.removeEventListener("mouseup",onMouseUp)}export{F as onUnload};
