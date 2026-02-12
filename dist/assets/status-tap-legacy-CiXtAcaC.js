System.register(["./index-legacy-D6XJ9JqQ.js"],function(e,t){"use strict";var n,r,s,i,o;return{setters:[e=>{n=e.ai,r=e.aj,s=e.ak,i=e.al,o=e.am}],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("startStatusTap",()=>{const e=window;e.addEventListener("statusTap",()=>{n(()=>{const t=e.innerWidth,n=e.innerHeight,a=document.elementFromPoint(t/2,n/2);if(!a)return;const c=r(a);c&&new Promise(e=>s(c,e)).then(()=>{i(async()=>{c.style.setProperty("--overflow","hidden"),await o(c,300),c.style.removeProperty("--overflow")})})})})})}}});
