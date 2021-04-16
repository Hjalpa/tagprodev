/*! nouislider - 14.6.4 - 3/18/2021 */
!function(t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():window.noUiSlider=t()}(function(){"use strict";var lt="14.6.4";function ut(t){t.parentElement.removeChild(t)}function ct(t){return null!=t}function pt(t){t.preventDefault()}function o(t){return"number"==typeof t&&!isNaN(t)&&isFinite(t)}function ft(t,e,r){0<r&&(mt(t,e),setTimeout(function(){gt(t,e)},r))}function dt(t){return Math.max(Math.min(t,100),0)}function ht(t){return Array.isArray(t)?t:[t]}function e(t){var e=(t=String(t)).split(".");return 1<e.length?e[1].length:0}function mt(t,e){t.classList&&!/\s/.test(e)?t.classList.add(e):t.className+=" "+e}function gt(t,e){t.classList&&!/\s/.test(e)?t.classList.remove(e):t.className=t.className.replace(new RegExp("(^|\\b)"+e.split(" ").join("|")+"(\\b|$)","gi")," ")}function vt(t){var e=void 0!==window.pageXOffset,r="CSS1Compat"===(t.compatMode||"");return{x:e?window.pageXOffset:r?t.documentElement.scrollLeft:t.body.scrollLeft,y:e?window.pageYOffset:r?t.documentElement.scrollTop:t.body.scrollTop}}function c(t,e){return 100/(e-t)}function p(t,e,r){return 100*e/(t[r+1]-t[r])}function f(t,e){for(var r=1;t>=e[r];)r+=1;return r}function r(t,e,r){if(r>=t.slice(-1)[0])return 100;var n,i,o=f(r,t),s=t[o-1],a=t[o],l=e[o-1],u=e[o];return l+(i=r,p(n=[s,a],n[0]<0?i+Math.abs(n[0]):i-n[0],0)/c(l,u))}function n(t,e,r,n){if(100===n)return n;var i,o,s=f(n,t),a=t[s-1],l=t[s];return r?(l-a)/2<n-a?l:a:e[s-1]?t[s-1]+(i=n-t[s-1],o=e[s-1],Math.round(i/o)*o):n}function s(t,e,r){var n;if("number"==typeof e&&(e=[e]),!Array.isArray(e))throw new Error("noUiSlider ("+lt+"): 'range' contains invalid value.");if(!o(n="min"===t?0:"max"===t?100:parseFloat(t))||!o(e[0]))throw new Error("noUiSlider ("+lt+"): 'range' value isn't numeric.");r.xPct.push(n),r.xVal.push(e[0]),n?r.xSteps.push(!isNaN(e[1])&&e[1]):isNaN(e[1])||(r.xSteps[0]=e[1]),r.xHighestCompleteStep.push(0)}function a(t,e,r){if(e)if(r.xVal[t]!==r.xVal[t+1]){r.xSteps[t]=p([r.xVal[t],r.xVal[t+1]],e,0)/c(r.xPct[t],r.xPct[t+1]);var n=(r.xVal[t+1]-r.xVal[t])/r.xNumSteps[t],i=Math.ceil(Number(n.toFixed(3))-1),o=r.xVal[t]+r.xNumSteps[t]*i;r.xHighestCompleteStep[t]=o}else r.xSteps[t]=r.xHighestCompleteStep[t]=r.xVal[t]}function i(t,e,r){var n;this.xPct=[],this.xVal=[],this.xSteps=[r||!1],this.xNumSteps=[!1],this.xHighestCompleteStep=[],this.snap=e;var i=[];for(n in t)t.hasOwnProperty(n)&&i.push([t[n],n]);for(i.length&&"object"==typeof i[0][0]?i.sort(function(t,e){return t[0][0]-e[0][0]}):i.sort(function(t,e){return t[0]-e[0]}),n=0;n<i.length;n++)s(i[n][1],i[n][0],this);for(this.xNumSteps=this.xSteps.slice(0),n=0;n<this.xNumSteps.length;n++)a(n,this.xNumSteps[n],this)}i.prototype.getDistance=function(t){var e,r=[];for(e=0;e<this.xNumSteps.length-1;e++){var n=this.xNumSteps[e];if(n&&t/n%1!=0)throw new Error("noUiSlider ("+lt+"): 'limit', 'margin' and 'padding' of "+this.xPct[e]+"% range must be divisible by step.");r[e]=p(this.xVal,t,e)}return r},i.prototype.getAbsoluteDistance=function(t,e,r){var n,i=0;if(t<this.xPct[this.xPct.length-1])for(;t>this.xPct[i+1];)i++;else t===this.xPct[this.xPct.length-1]&&(i=this.xPct.length-2);r||t!==this.xPct[i+1]||i++;var o=1,s=e[i],a=0,l=0,u=0,c=0;for(n=r?(t-this.xPct[i])/(this.xPct[i+1]-this.xPct[i]):(this.xPct[i+1]-t)/(this.xPct[i+1]-this.xPct[i]);0<s;)a=this.xPct[i+1+c]-this.xPct[i+c],100<e[i+c]*o+100-100*n?(l=a*n,o=(s-100*n)/e[i+c],n=1):(l=e[i+c]*a/100*o,o=0),r?(u-=l,1<=this.xPct.length+c&&c--):(u+=l,1<=this.xPct.length-c&&c++),s=e[i+c]*o;return t+u},i.prototype.toStepping=function(t){return t=r(this.xVal,this.xPct,t)},i.prototype.fromStepping=function(t){return function(t,e,r){if(100<=r)return t.slice(-1)[0];var n,i=f(r,e),o=t[i-1],s=t[i],a=e[i-1],l=e[i];return n=[o,s],(r-a)*c(a,l)*(n[1]-n[0])/100+n[0]}(this.xVal,this.xPct,t)},i.prototype.getStep=function(t){return t=n(this.xPct,this.xSteps,this.snap,t)},i.prototype.getDefaultStep=function(t,e,r){var n=f(t,this.xPct);return(100===t||e&&t===this.xPct[n-1])&&(n=Math.max(n-1,1)),(this.xVal[n]-this.xVal[n-1])/r},i.prototype.getNearbySteps=function(t){var e=f(t,this.xPct);return{stepBefore:{startValue:this.xVal[e-2],step:this.xNumSteps[e-2],highestStep:this.xHighestCompleteStep[e-2]},thisStep:{startValue:this.xVal[e-1],step:this.xNumSteps[e-1],highestStep:this.xHighestCompleteStep[e-1]},stepAfter:{startValue:this.xVal[e],step:this.xNumSteps[e],highestStep:this.xHighestCompleteStep[e]}}},i.prototype.countStepDecimals=function(){var t=this.xNumSteps.map(e);return Math.max.apply(null,t)},i.prototype.convert=function(t){return this.getStep(this.toStepping(t))};var l={to:function(t){return void 0!==t&&t.toFixed(2)},from:Number},u={target:"target",base:"base",origin:"origin",handle:"handle",handleLower:"handle-lower",handleUpper:"handle-upper",touchArea:"touch-area",horizontal:"horizontal",vertical:"vertical",background:"background",connect:"connect",connects:"connects",ltr:"ltr",rtl:"rtl",textDirectionLtr:"txt-dir-ltr",textDirectionRtl:"txt-dir-rtl",draggable:"draggable",drag:"state-drag",tap:"state-tap",active:"active",tooltip:"tooltip",pips:"pips",pipsHorizontal:"pips-horizontal",pipsVertical:"pips-vertical",marker:"marker",markerHorizontal:"marker-horizontal",markerVertical:"marker-vertical",markerNormal:"marker-normal",markerLarge:"marker-large",markerSub:"marker-sub",value:"value",valueHorizontal:"value-horizontal",valueVertical:"value-vertical",valueNormal:"value-normal",valueLarge:"value-large",valueSub:"value-sub"},bt={tooltips:".__tooltips",aria:".__aria"};function d(t){if("object"==typeof(e=t)&&"function"==typeof e.to&&"function"==typeof e.from)return!0;var e;throw new Error("noUiSlider ("+lt+"): 'format' requires 'to' and 'from' methods.")}function h(t,e){if(!o(e))throw new Error("noUiSlider ("+lt+"): 'step' is not numeric.");t.singleStep=e}function m(t,e){if(!o(e))throw new Error("noUiSlider ("+lt+"): 'keyboardPageMultiplier' is not numeric.");t.keyboardPageMultiplier=e}function g(t,e){if(!o(e))throw new Error("noUiSlider ("+lt+"): 'keyboardDefaultStep' is not numeric.");t.keyboardDefaultStep=e}function v(t,e){if("object"!=typeof e||Array.isArray(e))throw new Error("noUiSlider ("+lt+"): 'range' is not an object.");if(void 0===e.min||void 0===e.max)throw new Error("noUiSlider ("+lt+"): Missing 'min' or 'max' in 'range'.");if(e.min===e.max)throw new Error("noUiSlider ("+lt+"): 'range' 'min' and 'max' cannot be equal.");t.spectrum=new i(e,t.snap,t.singleStep)}function b(t,e){if(e=ht(e),!Array.isArray(e)||!e.length)throw new Error("noUiSlider ("+lt+"): 'start' option is incorrect.");t.handles=e.length,t.start=e}function x(t,e){if("boolean"!=typeof(t.snap=e))throw new Error("noUiSlider ("+lt+"): 'snap' option must be a boolean.")}function S(t,e){if("boolean"!=typeof(t.animate=e))throw new Error("noUiSlider ("+lt+"): 'animate' option must be a boolean.")}function w(t,e){if("number"!=typeof(t.animationDuration=e))throw new Error("noUiSlider ("+lt+"): 'animationDuration' option must be a number.")}function y(t,e){var r,n=[!1];if("lower"===e?e=[!0,!1]:"upper"===e&&(e=[!1,!0]),!0===e||!1===e){for(r=1;r<t.handles;r++)n.push(e);n.push(!1)}else{if(!Array.isArray(e)||!e.length||e.length!==t.handles+1)throw new Error("noUiSlider ("+lt+"): 'connect' option doesn't match handle count.");n=e}t.connect=n}function E(t,e){switch(e){case"horizontal":t.ort=0;break;case"vertical":t.ort=1;break;default:throw new Error("noUiSlider ("+lt+"): 'orientation' option is invalid.")}}function C(t,e){if(!o(e))throw new Error("noUiSlider ("+lt+"): 'margin' option must be numeric.");0!==e&&(t.margin=t.spectrum.getDistance(e))}function P(t,e){if(!o(e))throw new Error("noUiSlider ("+lt+"): 'limit' option must be numeric.");if(t.limit=t.spectrum.getDistance(e),!t.limit||t.handles<2)throw new Error("noUiSlider ("+lt+"): 'limit' option is only supported on linear sliders with 2 or more handles.")}function N(t,e){var r;if(!o(e)&&!Array.isArray(e))throw new Error("noUiSlider ("+lt+"): 'padding' option must be numeric or array of exactly 2 numbers.");if(Array.isArray(e)&&2!==e.length&&!o(e[0])&&!o(e[1]))throw new Error("noUiSlider ("+lt+"): 'padding' option must be numeric or array of exactly 2 numbers.");if(0!==e){for(Array.isArray(e)||(e=[e,e]),t.padding=[t.spectrum.getDistance(e[0]),t.spectrum.getDistance(e[1])],r=0;r<t.spectrum.xNumSteps.length-1;r++)if(t.padding[0][r]<0||t.padding[1][r]<0)throw new Error("noUiSlider ("+lt+"): 'padding' option must be a positive number(s).");var n=e[0]+e[1],i=t.spectrum.xVal[0];if(1<n/(t.spectrum.xVal[t.spectrum.xVal.length-1]-i))throw new Error("noUiSlider ("+lt+"): 'padding' option must not exceed 100% of the range.")}}function k(t,e){switch(e){case"ltr":t.dir=0;break;case"rtl":t.dir=1;break;default:throw new Error("noUiSlider ("+lt+"): 'direction' option was not recognized.")}}function U(t,e){if("string"!=typeof e)throw new Error("noUiSlider ("+lt+"): 'behaviour' must be a string containing options.");var r=0<=e.indexOf("tap"),n=0<=e.indexOf("drag"),i=0<=e.indexOf("fixed"),o=0<=e.indexOf("snap"),s=0<=e.indexOf("hover"),a=0<=e.indexOf("unconstrained");if(i){if(2!==t.handles)throw new Error("noUiSlider ("+lt+"): 'fixed' behaviour must be used with 2 handles");C(t,t.start[1]-t.start[0])}if(a&&(t.margin||t.limit))throw new Error("noUiSlider ("+lt+"): 'unconstrained' behaviour cannot be used with margin or limit");t.events={tap:r||o,drag:n,fixed:i,snap:o,hover:s,unconstrained:a}}function A(t,e){if(!1!==e)if(!0===e){t.tooltips=[];for(var r=0;r<t.handles;r++)t.tooltips.push(!0)}else{if(t.tooltips=ht(e),t.tooltips.length!==t.handles)throw new Error("noUiSlider ("+lt+"): must pass a formatter for all handles.");t.tooltips.forEach(function(t){if("boolean"!=typeof t&&("object"!=typeof t||"function"!=typeof t.to))throw new Error("noUiSlider ("+lt+"): 'tooltips' must be passed a formatter or 'false'.")})}}function V(t,e){d(t.ariaFormat=e)}function D(t,e){d(t.format=e)}function M(t,e){if("boolean"!=typeof(t.keyboardSupport=e))throw new Error("noUiSlider ("+lt+"): 'keyboardSupport' option must be a boolean.")}function O(t,e){t.documentElement=e}function L(t,e){if("string"!=typeof e&&!1!==e)throw new Error("noUiSlider ("+lt+"): 'cssPrefix' must be a string or `false`.");t.cssPrefix=e}function z(t,e){if("object"!=typeof e)throw new Error("noUiSlider ("+lt+"): 'cssClasses' must be an object.");if("string"==typeof t.cssPrefix)for(var r in t.cssClasses={},e)e.hasOwnProperty(r)&&(t.cssClasses[r]=t.cssPrefix+e[r]);else t.cssClasses=e}function xt(e){var r={margin:0,limit:0,padding:0,animate:!0,animationDuration:300,ariaFormat:l,format:l},n={step:{r:!1,t:h},keyboardPageMultiplier:{r:!1,t:m},keyboardDefaultStep:{r:!1,t:g},start:{r:!0,t:b},connect:{r:!0,t:y},direction:{r:!0,t:k},snap:{r:!1,t:x},animate:{r:!1,t:S},animationDuration:{r:!1,t:w},range:{r:!0,t:v},orientation:{r:!1,t:E},margin:{r:!1,t:C},limit:{r:!1,t:P},padding:{r:!1,t:N},behaviour:{r:!0,t:U},ariaFormat:{r:!1,t:V},format:{r:!1,t:D},tooltips:{r:!1,t:A},keyboardSupport:{r:!0,t:M},documentElement:{r:!1,t:O},cssPrefix:{r:!0,t:L},cssClasses:{r:!0,t:z}},i={connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal",keyboardSupport:!0,cssPrefix:"noUi-",cssClasses:u,keyboardPageMultiplier:5,keyboardDefaultStep:10};e.format&&!e.ariaFormat&&(e.ariaFormat=e.format),Object.keys(n).forEach(function(t){if(!ct(e[t])&&void 0===i[t]){if(n[t].r)throw new Error("noUiSlider ("+lt+"): '"+t+"' is required.");return!0}n[t].t(r,ct(e[t])?e[t]:i[t])}),r.pips=e.pips;var t=document.createElement("div"),o=void 0!==t.style.msTransform,s=void 0!==t.style.transform;r.transformRule=s?"transform":o?"msTransform":"webkitTransform";return r.style=[["left","top"],["right","bottom"]][r.dir][r.ort],r}function H(t,b,o){var l,u,s,c,i,a,e,p,f=window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",end:"mouseup touchend"},d=window.CSS&&CSS.supports&&CSS.supports("touch-action","none")&&function(){var t=!1;try{var e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("test",null,e)}catch(t){}return t}(),h=t,y=b.spectrum,x=[],S=[],m=[],g=0,v={},w=t.ownerDocument,E=b.documentElement||w.documentElement,C=w.body,P=-1,N=0,k=1,U=2,A="rtl"===w.dir||1===b.ort?0:100;function V(t,e){var r=w.createElement("div");return e&&mt(r,e),t.appendChild(r),r}function D(t,e){var r=V(t,b.cssClasses.origin),n=V(r,b.cssClasses.handle);return V(n,b.cssClasses.touchArea),n.setAttribute("data-handle",e),b.keyboardSupport&&(n.setAttribute("tabindex","0"),n.addEventListener("keydown",function(t){return function(t,e){if(O()||L(e))return!1;var r=["Left","Right"],n=["Down","Up"],i=["PageDown","PageUp"],o=["Home","End"];b.dir&&!b.ort?r.reverse():b.ort&&!b.dir&&(n.reverse(),i.reverse());var s,a=t.key.replace("Arrow",""),l=a===i[0],u=a===i[1],c=a===n[0]||a===r[0]||l,p=a===n[1]||a===r[1]||u,f=a===o[0],d=a===o[1];if(!(c||p||f||d))return!0;if(t.preventDefault(),p||c){var h=b.keyboardPageMultiplier,m=c?0:1,g=at(e),v=g[m];if(null===v)return!1;!1===v&&(v=y.getDefaultStep(S[e],c,b.keyboardDefaultStep)),(u||l)&&(v*=h),v=Math.max(v,1e-7),v*=c?-1:1,s=x[e]+v}else s=d?b.spectrum.xVal[b.spectrum.xVal.length-1]:b.spectrum.xVal[0];return rt(e,y.toStepping(s),!0,!0),J("slide",e),J("update",e),J("change",e),J("set",e),!1}(t,e)})),n.setAttribute("role","slider"),n.setAttribute("aria-orientation",b.ort?"vertical":"horizontal"),0===e?mt(n,b.cssClasses.handleLower):e===b.handles-1&&mt(n,b.cssClasses.handleUpper),r}function M(t,e){return!!e&&V(t,b.cssClasses.connect)}function r(t,e){return!!b.tooltips[e]&&V(t.firstChild,b.cssClasses.tooltip)}function O(){return h.hasAttribute("disabled")}function L(t){return u[t].hasAttribute("disabled")}function z(){i&&(G("update"+bt.tooltips),i.forEach(function(t){t&&ut(t)}),i=null)}function H(){z(),i=u.map(r),$("update"+bt.tooltips,function(t,e,r){if(i[e]){var n=t[e];!0!==b.tooltips[e]&&(n=b.tooltips[e].to(r[e])),i[e].innerHTML=n}})}function j(e,i,o){var s=w.createElement("div"),a=[];a[N]=b.cssClasses.valueNormal,a[k]=b.cssClasses.valueLarge,a[U]=b.cssClasses.valueSub;var l=[];l[N]=b.cssClasses.markerNormal,l[k]=b.cssClasses.markerLarge,l[U]=b.cssClasses.markerSub;var u=[b.cssClasses.valueHorizontal,b.cssClasses.valueVertical],c=[b.cssClasses.markerHorizontal,b.cssClasses.markerVertical];function p(t,e){var r=e===b.cssClasses.value,n=r?a:l;return e+" "+(r?u:c)[b.ort]+" "+n[t]}return mt(s,b.cssClasses.pips),mt(s,0===b.ort?b.cssClasses.pipsHorizontal:b.cssClasses.pipsVertical),Object.keys(e).forEach(function(t){!function(t,e,r){if((r=i?i(e,r):r)!==P){var n=V(s,!1);n.className=p(r,b.cssClasses.marker),n.style[b.style]=t+"%",N<r&&((n=V(s,!1)).className=p(r,b.cssClasses.value),n.setAttribute("data-value",e),n.style[b.style]=t+"%",n.innerHTML=o.to(e))}}(t,e[t][0],e[t][1])}),s}function F(){c&&(ut(c),c=null)}function R(t){F();var m,g,v,b,e,r,x,S,w,n=t.mode,i=t.density||1,o=t.filter||!1,s=function(t,e,r){if("range"===t||"steps"===t)return y.xVal;if("count"===t){if(e<2)throw new Error("noUiSlider ("+lt+"): 'values' (>= 2) required for mode 'count'.");var n=e-1,i=100/n;for(e=[];n--;)e[n]=n*i;e.push(100),t="positions"}return"positions"===t?e.map(function(t){return y.fromStepping(r?y.getStep(t):t)}):"values"===t?r?e.map(function(t){return y.fromStepping(y.getStep(y.toStepping(t)))}):e:void 0}(n,t.values||!1,t.stepped||!1),a=(m=i,g=n,v=s,b={},e=y.xVal[0],r=y.xVal[y.xVal.length-1],S=x=!1,w=0,(v=v.slice().sort(function(t,e){return t-e}).filter(function(t){return!this[t]&&(this[t]=!0)},{}))[0]!==e&&(v.unshift(e),x=!0),v[v.length-1]!==r&&(v.push(r),S=!0),v.forEach(function(t,e){var r,n,i,o,s,a,l,u,c,p,f=t,d=v[e+1],h="steps"===g;if(h&&(r=y.xNumSteps[e]),r||(r=d-f),!1!==f)for(void 0===d&&(d=f),r=Math.max(r,1e-7),n=f;n<=d;n=(n+r).toFixed(7)/1){for(u=(s=(o=y.toStepping(n))-w)/m,p=s/(c=Math.round(u)),i=1;i<=c;i+=1)b[(a=w+i*p).toFixed(5)]=[y.fromStepping(a),0];l=-1<v.indexOf(n)?k:h?U:N,!e&&x&&n!==d&&(l=0),n===d&&S||(b[o.toFixed(5)]=[n,l]),w=o}}),b),l=t.format||{to:Math.round};return c=h.appendChild(j(a,o,l))}function T(){var t=l.getBoundingClientRect(),e="offset"+["Width","Height"][b.ort];return 0===b.ort?t.width||l[e]:t.height||l[e]}function _(n,i,o,s){var e=function(t){return!!(t=function(t,e,r){var n,i,o=0===t.type.indexOf("touch"),s=0===t.type.indexOf("mouse"),a=0===t.type.indexOf("pointer");0===t.type.indexOf("MSPointer")&&(a=!0);if("mousedown"===t.type&&!t.buttons&&!t.touches)return!1;if(o){var l=function(t){return t.target===r||r.contains(t.target)||t.target.shadowRoot&&t.target.shadowRoot.contains(r)};if("touchstart"===t.type){var u=Array.prototype.filter.call(t.touches,l);if(1<u.length)return!1;n=u[0].pageX,i=u[0].pageY}else{var c=Array.prototype.find.call(t.changedTouches,l);if(!c)return!1;n=c.pageX,i=c.pageY}}e=e||vt(w),(s||a)&&(n=t.clientX+e.x,i=t.clientY+e.y);return t.pageOffset=e,t.points=[n,i],t.cursor=s||a,t}(t,s.pageOffset,s.target||i))&&(!(O()&&!s.doNotReject)&&(e=h,r=b.cssClasses.tap,!((e.classList?e.classList.contains(r):new RegExp("\\b"+r+"\\b").test(e.className))&&!s.doNotReject)&&(!(n===f.start&&void 0!==t.buttons&&1<t.buttons)&&((!s.hover||!t.buttons)&&(d||t.preventDefault(),t.calcPoint=t.points[b.ort],void o(t,s))))));var e,r},r=[];return n.split(" ").forEach(function(t){i.addEventListener(t,e,!!d&&{passive:!0}),r.push([t,e])}),r}function B(t){var e,r,n,i,o,s,a=100*(t-(e=l,r=b.ort,n=e.getBoundingClientRect(),i=e.ownerDocument,o=i.documentElement,s=vt(i),/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)&&(s.x=0),r?n.top+s.y-o.clientTop:n.left+s.x-o.clientLeft))/T();return a=dt(a),b.dir?100-a:a}function q(t,e){"mouseout"===t.type&&"HTML"===t.target.nodeName&&null===t.relatedTarget&&Y(t,e)}function X(t,e){if(-1===navigator.appVersion.indexOf("MSIE 9")&&0===t.buttons&&0!==e.buttonsProperty)return Y(t,e);var r=(b.dir?-1:1)*(t.calcPoint-e.startCalcPoint);Z(0<r,100*r/e.baseSize,e.locations,e.handleNumbers)}function Y(t,e){e.handle&&(gt(e.handle,b.cssClasses.active),g-=1),e.listeners.forEach(function(t){E.removeEventListener(t[0],t[1])}),0===g&&(gt(h,b.cssClasses.drag),et(),t.cursor&&(C.style.cursor="",C.removeEventListener("selectstart",pt))),e.handleNumbers.forEach(function(t){J("change",t),J("set",t),J("end",t)})}function I(t,e){if(e.handleNumbers.some(L))return!1;var r;1===e.handleNumbers.length&&(r=u[e.handleNumbers[0]].children[0],g+=1,mt(r,b.cssClasses.active));t.stopPropagation();var n=[],i=_(f.move,E,X,{target:t.target,handle:r,listeners:n,startCalcPoint:t.calcPoint,baseSize:T(),pageOffset:t.pageOffset,handleNumbers:e.handleNumbers,buttonsProperty:t.buttons,locations:S.slice()}),o=_(f.end,E,Y,{target:t.target,handle:r,listeners:n,doNotReject:!0,handleNumbers:e.handleNumbers}),s=_("mouseout",E,q,{target:t.target,handle:r,listeners:n,doNotReject:!0,handleNumbers:e.handleNumbers});n.push.apply(n,i.concat(o,s)),t.cursor&&(C.style.cursor=getComputedStyle(t.target).cursor,1<u.length&&mt(h,b.cssClasses.drag),C.addEventListener("selectstart",pt,!1)),e.handleNumbers.forEach(function(t){J("start",t)})}function n(t){t.stopPropagation();var i,o,s,e=B(t.calcPoint),r=(i=e,s=!(o=100),u.forEach(function(t,e){if(!L(e)){var r=S[e],n=Math.abs(r-i);(n<o||n<=o&&r<i||100===n&&100===o)&&(s=e,o=n)}}),s);if(!1===r)return!1;b.events.snap||ft(h,b.cssClasses.tap,b.animationDuration),rt(r,e,!0,!0),et(),J("slide",r,!0),J("update",r,!0),J("change",r,!0),J("set",r,!0),b.events.snap&&I(t,{handleNumbers:[r]})}function W(t){var e=B(t.calcPoint),r=y.getStep(e),n=y.fromStepping(r);Object.keys(v).forEach(function(t){"hover"===t.split(".")[0]&&v[t].forEach(function(t){t.call(a,n)})})}function $(t,e){v[t]=v[t]||[],v[t].push(e),"update"===t.split(".")[0]&&u.forEach(function(t,e){J("update",e)})}function G(t){var i=t&&t.split(".")[0],o=i?t.substring(i.length):t;Object.keys(v).forEach(function(t){var e,r=t.split(".")[0],n=t.substring(r.length);i&&i!==r||o&&o!==n||((e=n)!==bt.aria&&e!==bt.tooltips||o===n)&&delete v[t]})}function J(r,n,i){Object.keys(v).forEach(function(t){var e=t.split(".")[0];r===e&&v[t].forEach(function(t){t.call(a,x.map(b.format.to),n,x.slice(),i||!1,S.slice(),a)})})}function K(t,e,r,n,i,o){var s;return 1<u.length&&!b.events.unconstrained&&(n&&0<e&&(s=y.getAbsoluteDistance(t[e-1],b.margin,0),r=Math.max(r,s)),i&&e<u.length-1&&(s=y.getAbsoluteDistance(t[e+1],b.margin,1),r=Math.min(r,s))),1<u.length&&b.limit&&(n&&0<e&&(s=y.getAbsoluteDistance(t[e-1],b.limit,0),r=Math.min(r,s)),i&&e<u.length-1&&(s=y.getAbsoluteDistance(t[e+1],b.limit,1),r=Math.max(r,s))),b.padding&&(0===e&&(s=y.getAbsoluteDistance(0,b.padding[0],0),r=Math.max(r,s)),e===u.length-1&&(s=y.getAbsoluteDistance(100,b.padding[1],1),r=Math.min(r,s))),!((r=dt(r=y.getStep(r)))===t[e]&&!o)&&r}function Q(t,e){var r=b.ort;return(r?e:t)+", "+(r?t:e)}function Z(t,n,r,e){var i=r.slice(),o=[!t,t],s=[t,!t];e=e.slice(),t&&e.reverse(),1<e.length?e.forEach(function(t,e){var r=K(i,t,i[t]+n,o[e],s[e],!1);!1===r?n=0:(n=r-i[t],i[t]=r)}):o=s=[!0];var a=!1;e.forEach(function(t,e){a=rt(t,r[t]+n,o[e],s[e])||a}),a&&e.forEach(function(t){J("update",t),J("slide",t)})}function tt(t,e){return b.dir?100-t-e:t}function et(){m.forEach(function(t){var e=50<S[t]?-1:1,r=3+(u.length+e*t);u[t].style.zIndex=r})}function rt(t,e,r,n,i){return i||(e=K(S,t,e,r,n,!1)),!1!==e&&(function(t,e){S[t]=e,x[t]=y.fromStepping(e);var r="translate("+Q(10*(tt(e,0)-A)+"%","0")+")";u[t].style[b.transformRule]=r,nt(t),nt(t+1)}(t,e),!0)}function nt(t){if(s[t]){var e=0,r=100;0!==t&&(e=S[t-1]),t!==s.length-1&&(r=S[t]);var n=r-e,i="translate("+Q(tt(e,n)+"%","0")+")",o="scale("+Q(n/100,"1")+")";s[t].style[b.transformRule]=i+" "+o}}function it(t,e){return null===t||!1===t||void 0===t?S[e]:("number"==typeof t&&(t=String(t)),t=b.format.from(t),!1===(t=y.toStepping(t))||isNaN(t)?S[e]:t)}function ot(t,e,r){var n=ht(t),i=void 0===S[0];e=void 0===e||!!e,b.animate&&!i&&ft(h,b.cssClasses.tap,b.animationDuration),m.forEach(function(t){rt(t,it(n[t],t),!0,!1,r)});for(var o=1===m.length?0:1;o<m.length;++o)m.forEach(function(t){rt(t,S[t],!0,!0,r)});et(),m.forEach(function(t){J("update",t),null!==n[t]&&e&&J("set",t)})}function st(){var t=x.map(b.format.to);return 1===t.length?t[0]:t}function at(t){var e=S[t],r=y.getNearbySteps(e),n=x[t],i=r.thisStep.step,o=null;if(b.snap)return[n-r.stepBefore.startValue||null,r.stepAfter.startValue-n||null];!1!==i&&n+i>r.stepAfter.startValue&&(i=r.stepAfter.startValue-n),o=n>r.thisStep.startValue?r.thisStep.step:!1!==r.stepBefore.step&&n-r.stepBefore.highestStep,100===e?i=null:0===e&&(o=null);var s=y.countStepDecimals();return null!==i&&!1!==i&&(i=Number(i.toFixed(s))),null!==o&&!1!==o&&(o=Number(o.toFixed(s))),[o,i]}return mt(e=h,b.cssClasses.target),0===b.dir?mt(e,b.cssClasses.ltr):mt(e,b.cssClasses.rtl),0===b.ort?mt(e,b.cssClasses.horizontal):mt(e,b.cssClasses.vertical),mt(e,"rtl"===getComputedStyle(e).direction?b.cssClasses.textDirectionRtl:b.cssClasses.textDirectionLtr),l=V(e,b.cssClasses.base),function(t,e){var r=V(e,b.cssClasses.connects);u=[],(s=[]).push(M(r,t[0]));for(var n=0;n<b.handles;n++)u.push(D(e,n)),m[n]=n,s.push(M(r,t[n+1]))}(b.connect,l),(p=b.events).fixed||u.forEach(function(t,e){_(f.start,t.children[0],I,{handleNumbers:[e]})}),p.tap&&_(f.start,l,n,{}),p.hover&&_(f.move,l,W,{hover:!0}),p.drag&&s.forEach(function(t,e){if(!1!==t&&0!==e&&e!==s.length-1){var r=u[e-1],n=u[e],i=[t];mt(t,b.cssClasses.draggable),p.fixed&&(i.push(r.children[0]),i.push(n.children[0])),i.forEach(function(t){_(f.start,t,I,{handles:[r,n],handleNumbers:[e-1,e]})})}}),ot(b.start),b.pips&&R(b.pips),b.tooltips&&H(),G("update"+bt.aria),$("update"+bt.aria,function(t,e,s,r,a){m.forEach(function(t){var e=u[t],r=K(S,t,0,!0,!0,!0),n=K(S,t,100,!0,!0,!0),i=a[t],o=b.ariaFormat.to(s[t]);r=y.fromStepping(r).toFixed(1),n=y.fromStepping(n).toFixed(1),i=y.fromStepping(i).toFixed(1),e.children[0].setAttribute("aria-valuemin",r),e.children[0].setAttribute("aria-valuemax",n),e.children[0].setAttribute("aria-valuenow",i),e.children[0].setAttribute("aria-valuetext",o)})}),a={destroy:function(){for(var t in G(bt.aria),G(bt.tooltips),b.cssClasses)b.cssClasses.hasOwnProperty(t)&&gt(h,b.cssClasses[t]);for(;h.firstChild;)h.removeChild(h.firstChild);delete h.noUiSlider},steps:function(){return m.map(at)},on:$,off:G,get:st,set:ot,setHandle:function(t,e,r,n){if(!(0<=(t=Number(t))&&t<m.length))throw new Error("noUiSlider ("+lt+"): invalid handle number, got: "+t);rt(t,it(e,t),!0,!0,n),J("update",t),r&&J("set",t)},reset:function(t){ot(b.start,t)},__moveHandles:function(t,e,r){Z(t,e,S,r)},options:o,updateOptions:function(e,t){var r=st(),n=["margin","limit","padding","range","animate","snap","step","format","pips","tooltips"];n.forEach(function(t){void 0!==e[t]&&(o[t]=e[t])});var i=xt(o);n.forEach(function(t){void 0!==e[t]&&(b[t]=i[t])}),y=i.spectrum,b.margin=i.margin,b.limit=i.limit,b.padding=i.padding,b.pips?R(b.pips):F(),b.tooltips?H():z(),S=[],ot(ct(e.start)?e.start:r,t)},target:h,removePips:F,removeTooltips:z,getTooltips:function(){return i},getOrigins:function(){return u},pips:R}}return{__spectrum:i,version:lt,cssClasses:u,create:function(t,e){if(!t||!t.nodeName)throw new Error("noUiSlider ("+lt+"): create requires a single element, got: "+t);if(t.noUiSlider)throw new Error("noUiSlider ("+lt+"): Slider was already initialized.");var r=H(t,xt(e),e);return t.noUiSlider=r}}});

!function(e){"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?module.exports=e():window.wNumb=e()}(function(){"use strict";var o=["decimals","thousand","mark","prefix","suffix","encoder","decoder","negativeBefore","negative","edit","undo"];function w(e){return e.split("").reverse().join("")}function h(e,t){return e.substring(0,t.length)===t}function f(e,t,n){if((e[t]||e[n])&&e[t]===e[n])throw new Error(t)}function x(e){return"number"==typeof e&&isFinite(e)}function n(e,t,n,r,i,o,f,u,s,c,a,p){var d,l,h,g=p,v="",m="";return o&&(p=o(p)),!!x(p)&&(!1!==e&&0===parseFloat(p.toFixed(e))&&(p=0),p<0&&(d=!0,p=Math.abs(p)),!1!==e&&(p=function(e,t){return e=e.toString().split("e"),(+((e=(e=Math.round(+(e[0]+"e"+(e[1]?+e[1]+t:t)))).toString().split("e"))[0]+"e"+(e[1]?e[1]-t:-t))).toFixed(t)}(p,e)),-1!==(p=p.toString()).indexOf(".")?(h=(l=p.split("."))[0],n&&(v=n+l[1])):h=p,t&&(h=w((h=w(h).match(/.{1,3}/g)).join(w(t)))),d&&u&&(m+=u),r&&(m+=r),d&&s&&(m+=s),m+=h,m+=v,i&&(m+=i),c&&(m=c(m,g)),m)}function r(e,t,n,r,i,o,f,u,s,c,a,p){var d,l="";return a&&(p=a(p)),!(!p||"string"!=typeof p)&&(u&&h(p,u)&&(p=p.replace(u,""),d=!0),r&&h(p,r)&&(p=p.replace(r,"")),s&&h(p,s)&&(p=p.replace(s,""),d=!0),i&&function(e,t){return e.slice(-1*t.length)===t}(p,i)&&(p=p.slice(0,-1*i.length)),t&&(p=p.split(t).join("")),n&&(p=p.replace(n,".")),d&&(l+="-"),""!==(l=(l+=p).replace(/[^0-9\.\-.]/g,""))&&(l=Number(l),f&&(l=f(l)),!!x(l)&&l))}function i(e,t,n){var r,i=[];for(r=0;r<o.length;r+=1)i.push(e[o[r]]);return i.push(n),t.apply("",i)}return function e(t){if(!(this instanceof e))return new e(t);"object"==typeof t&&(t=function(e){var t,n,r,i={};for(void 0===e.suffix&&(e.suffix=e.postfix),t=0;t<o.length;t+=1)if(void 0===(r=e[n=o[t]]))"negative"!==n||i.negativeBefore?"mark"===n&&"."!==i.thousand?i[n]=".":i[n]=!1:i[n]="-";else if("decimals"===n){if(!(0<=r&&r<8))throw new Error(n);i[n]=r}else if("encoder"===n||"decoder"===n||"edit"===n||"undo"===n){if("function"!=typeof r)throw new Error(n);i[n]=r}else{if("string"!=typeof r)throw new Error(n);i[n]=r}return f(i,"mark","thousand"),f(i,"prefix","negative"),f(i,"prefix","negativeBefore"),i}(t),this.to=function(e){return i(t,n,e)},this.from=function(e){return i(t,r,e)})}});

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).TomSelect=e()}(this,function(){"use strict";function t(t,e){t.split(/\s+/).forEach(t=>{e(t)})}class e{constructor(){this._events={}}on(e,i){t(e,t=>{this._events[t]=this._events[t]||[],this._events[t].push(i)})}off(e,i){var s=arguments.length;0!==s?t(e,t=>{if(1===s)return delete this._events[t];t in this._events!=!1&&this._events[t].splice(this._events[t].indexOf(i),1)}):this._events={}}trigger(e,...i){var s=this;t(e,t=>{if(t in s._events!=!1)for(let e of s._events[t])e.apply(s,i)})}}var i=function(t,e){return"number"==typeof t&&"number"==typeof e?t>e?1:t<e?-1:0:(t=r(String(t||"")))>(e=r(String(e||"")))?1:e>t?-1:0},s=function(t,e,i){if(t&&e){if(!i)return t[e];for(var s=e.split(".");s.length&&(t=t[s.shift()]););return t}},n=function(t){return(t+"").replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")},o={a:"[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]",b:"[b␢βΒB฿𐌁ᛒ]",c:"[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]",d:"[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]",e:"[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]",f:"[fƑƒḞḟ]",g:"[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]",h:"[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]",i:"[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]",j:"[jȷĴĵɈɉʝɟʲ]",k:"[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]",l:"[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]",n:"[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]",o:"[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]",p:"[pṔṕṖṗⱣᵽƤƥᵱ]",q:"[qꝖꝗʠɊɋꝘꝙq̃]",r:"[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]",s:"[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]",t:"[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]",u:"[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]",v:"[vṼṽṾṿƲʋꝞꝟⱱʋ]",w:"[wẂẃẀẁŴŵẄẅẆẇẈẉ]",x:"[xẌẍẊẋχ]",y:"[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]",z:"[zŹźẐẑŽžŻżẒẓẔẕƵƶ]"},r=function(){var t,e,i,s,n="",r={};for(i in o)if(o.hasOwnProperty(i))for(n+=s=o[i].substring(2,o[i].length-1),t=0,e=s.length;t<e;t++)r[s.charAt(t)]=i;var a=new RegExp("["+n+"]","g");return function(t){return t.replace(a,function(t){return r[t]}).toLowerCase()}}();class a{constructor(t,e){this.items=void 0,this.settings=void 0,this.items=t,this.settings=e||{diacritics:!0}}tokenize(t,e){if(!(t=String(t||"").toLowerCase().trim())||!t.length)return[];var i,s,r,a,l=[],h=t.split(/ +/);for(i=0,s=h.length;i<s;i++){if(r=n(h[i]),this.settings.diacritics)for(a in o)o.hasOwnProperty(a)&&(r=r.replace(new RegExp(a,"g"),o[a]));e&&(r="\\b"+r),l.push({string:h[i],regex:new RegExp(r,"i")})}return l}iterator(t,e){(Array.isArray(t)?Array.prototype.forEach||function(t){for(var e=0,i=this.length;e<i;e++)t(this[e],e,this)}:function(t){for(var e in this)this.hasOwnProperty(e)&&t(this[e],e,this)}).apply(t,[e])}getScoreFunction(t,e){var i,n,o,r,a;a=this.prepareSearch(t,e),n=a.tokens,i=a.options.fields,o=n.length,r=a.options.nesting;var l,h=function(t,e){var i,s;return t?-1===(s=(t=String(t||"")).search(e.regex))?0:(i=e.string.length/t.length,0===s&&(i+=.5),i):0},d=(l=i.length)?1===l?function(t,e){return h(s(e,i[0],r),t)}:function(t,e){for(var n=0,o=0;n<l;n++)o+=h(s(e,i[n],r),t);return o/l}:function(){return 0};return o?1===o?function(t){return d(n[0],t)}:"and"===a.options.conjunction?function(t){for(var e,i=0,s=0;i<o;i++){if((e=d(n[i],t))<=0)return 0;s+=e}return s/o}:function(t){for(var e=0,i=0;e<o;e++)i+=d(n[e],t);return i/o}:function(){return 0}}getSortFunction(t,e){var n,o,r,a,l,h,d,p,c,u,g;if(g=!(t=(r=this).prepareSearch(t,e)).query&&e.sort_empty||e.sort,c=function(t,i){return"$score"===t?i.score:s(r.items[i.id],t,e.nesting)},l=[],g)for(n=0,o=g.length;n<o;n++)(t.query||"$score"!==g[n].field)&&l.push(g[n]);if(t.query){for(u=!0,n=0,o=l.length;n<o;n++)if("$score"===l[n].field){u=!1;break}u&&l.unshift({field:"$score",direction:"desc"})}else for(n=0,o=l.length;n<o;n++)if("$score"===l[n].field){l.splice(n,1);break}for(p=[],n=0,o=l.length;n<o;n++)p.push("desc"===l[n].direction?-1:1);return(h=l.length)?1===h?(a=l[0].field,d=p[0],function(t,e){return d*i(c(a,t),c(a,e))}):function(t,e){var s,n,o;for(s=0;s<h;s++)if(o=l[s].field,n=p[s]*i(c(o,t),c(o,e)))return n;return 0}:null}prepareSearch(t,e){if("object"==typeof t)return t;var i=(e=Object.assign({},e)).fields,s=e.sort,n=e.sort_empty;return i&&!Array.isArray(i)&&(e.fields=[i]),s&&!Array.isArray(s)&&(e.sort=[s]),n&&!Array.isArray(n)&&(e.sort_empty=[n]),{options:e,query:String(t||"").toLowerCase(),tokens:this.tokenize(t,e.respect_word_boundaries),total:0,items:[]}}search(t,e){var i,s,n,o;return s=this.prepareSearch(t,e),e=s.options,t=s.query,o=e.score||this.getScoreFunction(s),t.length?this.iterator(this.items,function(t,n){i=o(t),(!1===e.filter||i>0)&&s.items.push({score:i,id:n})}):this.iterator(this.items,function(t,e){s.items.push({score:1,id:e})}),(n=this.getSortFunction(s,e))&&s.items.sort(n),s.total=s.items.length,"number"==typeof e.limit&&(s.items=s.items.slice(0,e.limit)),s}}function l(t,e){if("string"!=typeof e||e.length){var i="string"==typeof e?new RegExp(e,"i"):e;!function t(e){var s=0;if(3===e.nodeType){var n=e.data.search(i);if(n>=0&&e.data.length>0){var o=e.data.match(i),r=document.createElement("span");r.className="highlight";var a=e.splitText(n);a.splitText(o[0].length);var l=a.cloneNode(!0);r.appendChild(l),a.parentNode.replaceChild(r,a),s=1}}else if(1===e.nodeType&&e.childNodes&&!/(script|style)/i.test(e.tagName)&&("highlight"!==e.className||"SPAN"!==e.tagName))for(var h=0;h<e.childNodes.length;++h)h+=t(e.childNodes[h]);return s}(t)}}const h=65,d=13,p=27,c=37,u=38,g=39,f=40,v=8,m=46,y=9,O="undefined"!=typeof navigator&&/Mac/.test(navigator.userAgent)?"metaKey":"ctrlKey";var b={options:[],optgroups:[],plugins:[],delimiter:",",splitOn:null,persist:!0,diacritics:!0,create:null,createOnBlur:!1,createFilter:null,highlight:!0,openOnFocus:!0,shouldOpen:null,maxOptions:50,maxItems:null,hideSelected:null,duplicates:!1,addPrecedence:!1,selectOnTab:!1,preload:null,allowEmptyOption:!1,closeAfterSelect:!1,loadThrottle:300,loadingClass:"loading",dataAttr:null,optgroupField:"optgroup",valueField:"value",labelField:"text",disabledField:"disabled",optgroupLabelField:"label",optgroupValueField:"value",lockOptgroupOrder:!1,sortField:"$order",searchField:["text"],searchConjunction:"and",mode:null,wrapperClass:"ts-control",inputClass:"ts-input",dropdownClass:"ts-dropdown",dropdownContentClass:"ts-dropdown-content",itemClass:"item",optionClass:"option",dropdownParent:null,controlInput:null,copyClassesToDropdown:!0,placeholder:null,hidePlaceholder:null,shouldLoad:function(t){return t.length>0},render:{}};function w(t){return null==t?null:"boolean"==typeof t?t?"1":"0":t+""}function I(t){return(t+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function C(t,e,i){var s,n=t.trigger,o={};for(s in t.trigger=function(){var i=arguments[0];if(-1===e.indexOf(i))return n.apply(t,arguments);o[i]=arguments},i.apply(t,[]),t.trigger=n,o)n.apply(t,o[s])}function _(t,e=!1){t&&(t.preventDefault(),e&&t.stopPropagation())}function A(t,e,i,s){t.addEventListener(e,i,s)}function S(t,e){return!!e&&(!!e[t]&&1===(e.altKey?1:0)+(e.ctrlKey?1:0)+(e.shiftKey?1:0)+(e.metaKey?1:0))}function x(t,e){const i=t.getAttribute("id");return i||(t.setAttribute("id",e),e)}function k(t,e){var i=Object.assign({},b,e),s=i.dataAttr,n=i.labelField,o=i.valueField,r=i.disabledField,a=i.optgroupField,l=i.optgroupLabelField,h=i.optgroupValueField,d=t.tagName.toLowerCase(),p=t.getAttribute("placeholder")||t.getAttribute("data-placeholder");if(!p&&!i.allowEmptyOption){let e=t.querySelector('option[value=""]');e&&(p=e.textContent)}var c={placeholder:p,options:[],optgroups:[],items:[],maxItems:null};return"select"===d?(()=>{var e,d=c.options,p={},u=1,g=t=>{var e=Object.assign({},t.dataset),i=s&&e[s];return"string"==typeof i&&i.length&&(e=Object.assign(e,JSON.parse(i))),e},f=(t,e)=>{var s=w(t.value);if(s||i.allowEmptyOption)if(p.hasOwnProperty(s)){if(e){var l=p[s][a];l?Array.isArray(l)?l.push(e):p[s][a]=[l,e]:p[s][a]=e}}else{var h=g(t);h[n]=h[n]||t.textContent,h[o]=h[o]||s,h[r]=h[r]||t.disabled,h[a]=h[a]||e,h.$option=t,p[s]=h,d.push(h),t.selected&&c.items.push(s)}},v=t=>{var e,i;(i=g(t))[l]=i[l]||t.getAttribute("label")||"",i[h]=i[h]||u++,i[r]=i[r]||t.disabled,c.optgroups.push(i),e=i[h];for(const i of t.children)f(i,e)};c.maxItems=t.hasAttribute("multiple")?null:1;for(const i of t.children)"optgroup"===(e=i.tagName.toLowerCase())?v(i):"option"===e&&f(i)})():(()=>{var e,r,a=t.getAttribute(s);if(a){c.options=JSON.parse(a);for(const t of c.options)c.items.push(t[o])}else{var l=t.value.trim()||"";if(!i.allowEmptyOption&&!l.length)return;e=l.split(i.delimiter);for(const t of e)(r={})[n]=t,r[o]=t,c.options.push(r);c.items=e}})(),Object.assign({},b,c,e)}function F(t){if(t.jquery)return t[0];if(t instanceof HTMLElement)return t;if(t.indexOf("<")>-1){let e=document.createElement("div");return e.innerHTML=t.trim(),e.firstChild}return document.querySelector(t)}function L(t,e){var i=document.createEvent("HTMLEvents");i.initEvent(e,!0,!1),t.dispatchEvent(i)}function P(t,e){Object.assign(t.style,e)}function E(t,...e){var i=q(e);(t=V(t)).map(t=>{i.map(e=>{t.classList.add(e)})})}function T(t,...e){var i=q(e);(t=V(t)).map(t=>{i.map(e=>{t.classList.remove(e)})})}function q(t){var e=[];for(let i of t)"string"==typeof i&&(i=i.trim().split(/[\11\12\14\15\40]/)),Array.isArray(i)&&(e=e.concat(i));return e.filter(Boolean)}function V(t){return Array.isArray(t)||(t=[t]),t}function j(t,e,i){if(!i||i.contains(t))for(;t&&t.matches;){if(t.matches(e))return t;t=t.parentNode}}function D(t,e){return e>0?t[t.length-1]:t[0]}function N(t,e){if(!t)return-1;e=e||t.nodeName;for(var i=0;t=t.previousElementSibling;)t.matches(e)&&i++;return i}function R(t,e){for(const i in e)t.setAttribute(i,e[i])}var B=0;class H extends(function(t){return t.plugins={},class extends t{static define(e,i){t.plugins[e]={name:e,fn:i}}initializePlugins(t){var e,i,s,n=[];if(this.plugins={names:[],settings:{},requested:{},loaded:{}},Array.isArray(t))for(e=0,i=t.length;e<i;e++)"string"==typeof t[e]?n.push(t[e]):(this.plugins.settings[t[e].name]=t[e].options,n.push(t[e].name));else if(t)for(s in t)t.hasOwnProperty(s)&&(this.plugins.settings[s]=t[s],n.push(s));for(;n.length;)this.require(n.shift())}loadPlugin(e){var i=this.plugins,s=t.plugins[e];if(!t.plugins.hasOwnProperty(e))throw new Error('Unable to find "'+e+'" plugin');i.requested[e]=!0,i.loaded[e]=s.fn.apply(this,[this.plugins.settings[e]||{}]),i.names.push(e)}require(t){var e=this.plugins;if(!this.plugins.loaded.hasOwnProperty(t)){if(e.requested[t])throw new Error('Plugin has circular dependency ("'+t+'")');this.loadPlugin(t)}return e.loaded[t]}}}(e)){constructor(t,e){var i;super(),this.control_input=void 0,this.wrapper=void 0,this.dropdown=void 0,this.control=void 0,this.dropdown_content=void 0,this.order=0,this.settings=void 0,this.input=void 0,this.tabIndex=void 0,this.is_select_tag=void 0,this.rtl=void 0,this.inputId=void 0,this._destroy=void 0,this.sifter=void 0,this.tab_key=!1,this.isOpen=!1,this.isDisabled=!1,this.isRequired=void 0,this.isInvalid=!1,this.isLocked=!1,this.isFocused=!1,this.isInputHidden=!1,this.isSetup=!1,this.ignoreFocus=!1,this.ignoreBlur=!1,this.hasOptions=!1,this.currentResults=null,this.lastValue="",this.caretPos=0,this.loading=0,this.loadedSearches={},this.activeOption=null,this.activeItems=[],this.optgroups={},this.options={},this.options_i=0,this.userOptions={},this.items=[],this.renderCache={item:{},option:{}},B++;var s,n,o,r=F(t);if(r.tomselect)throw new Error("Tom Select already initialized on this element");r.tomselect=this,i=(window.getComputedStyle&&window.getComputedStyle(r,null)).getPropertyValue("direction"),this.settings=k(r,e),this.input=r,this.tabIndex=r.tabIndex||0,this.is_select_tag="select"===r.tagName.toLowerCase(),this.rtl=/rtl/i.test(i),this.inputId=x(r,"tomselect-"+B),this.isRequired=r.required,this.settings.load&&this.settings.loadThrottle&&(this.settings.load=(s=this.settings.load,n=this.settings.loadThrottle,function(t,e){var i=this;o&&(i.loading=Math.max(i.loading-1,0)),clearTimeout(o),o=setTimeout(function(){o=null,i.loadedSearches[t]=!0,s.call(i,t,e)},n)})),this.sifter=new a(this.options,{diacritics:this.settings.diacritics}),this.setupOptions(this.settings.options,this.settings.optgroups),delete this.settings.optgroups,delete this.settings.options,this.settings.mode=this.settings.mode||(1===this.settings.maxItems?"single":"multi"),"boolean"!=typeof this.settings.hideSelected&&(this.settings.hideSelected="multi"===this.settings.mode),"boolean"!=typeof this.settings.hidePlaceholder&&(this.settings.hidePlaceholder="multi"!==this.settings.mode);var l=this.settings.createFilter;"function"!=typeof l&&("string"==typeof l&&(l=new RegExp(l)),l instanceof RegExp?this.settings.createFilter=(t=>l.test(t)):this.settings.createFilter=(()=>!0)),this.initializePlugins(this.settings.plugins),this.setupCallbacks(),this.setupTemplates(),this.setup()}setup(){var t,e,i,s,n,o,r,a,l,h=this,d=h.settings,p=h.input;const c={passive:!0},u=h.inputId+"-ts-dropdown";if(o=h.settings.mode,r=p.getAttribute("class")||"",E(t=F("<div>"),d.wrapperClass,r,o),E(e=F('<div class="items">'),d.inputClass),t.append(e),E(s=h.render("dropdown"),d.dropdownClass,o),E(n=F(`<div role="listbox" id="${u}" tabindex="-1">`),d.dropdownContentClass),s.append(n),F(d.dropdownParent||t).appendChild(s),d.controlInput)i=F(d.controlInput);else{i=F('<input type="text" autocomplete="off" size="1" />');for(const t of["autocorrect","autocapitalize","autocomplete"])p.getAttribute(t)&&R(i,{[t]:p.getAttribute(t)})}d.controlInput||(i.tabIndex=p.disabled?-1:h.tabIndex,e.appendChild(i)),R(i,{role:"combobox",haspopup:"listbox","aria-expanded":"false","aria-controls":u}),l=x(i,h.inputId+"-tomselected");let g="label[for='"+function(t){return t.replace(/['"\\]/g,"\\$&")}(h.inputId)+"']",f=document.querySelector(g);if(f){R(f,{for:l}),R(n,{"aria-labelledby":x(f,h.inputId+"-ts-label")})}if(h.settings.copyClassesToDropdown&&E(s,r),t.style.width=p.style.width,h.plugins.names.length&&(a="plugin-"+h.plugins.names.join(" plugin-"),E([t,s],a)),(null===d.maxItems||d.maxItems>1)&&h.is_select_tag&&R(p,{multiple:"multiple"}),h.settings.placeholder&&R(i,{placeholder:d.placeholder}),!h.settings.splitOn&&h.settings.delimiter){var v=h.settings.delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");h.settings.splitOn=new RegExp("\\s*"+v+"+\\s*")}h.control=e,h.control_input=i,h.wrapper=t,h.dropdown=s,h.dropdown_content=n,h.control_input.type=p.type,A(s,"mouseenter",t=>{var e=j(t.target,"[data-selectable]",s);if(e)return h.onOptionHover(t,e)},{capture:!0}),A(e,"mousedown",t=>{if(t.target==i)return h.clearActiveItems(),t.stopPropagation(),void h.inputState();var s=j(t.target,"."+h.settings.itemClass,e);return s?h.onItemSelect(t,s):h.onMouseDown(t)}),A(e,"click",t=>h.onClick(t)),A(i,"keydown",t=>h.onKeyDown(t)),A(i,"keyup",t=>h.onKeyUp(t)),A(i,"keypress",t=>h.onKeyPress(t)),A(i,"resize",()=>h.positionDropdown(),c),A(i,"blur",t=>h.onBlur(t)),A(i,"focus",t=>{h.ignoreBlur=!1,h.onFocus(t)}),A(i,"paste",t=>h.onPaste(t));var m=t=>{var e=j(t.target,"[data-selectable]",h.dropdown);if(!e&&!h.wrapper.contains(t.target))return h.isFocused&&h.blur(),void h.inputState();_(t,!0),e&&h.onOptionSelect(t,e)},y=()=>{h.isOpen&&h.positionDropdown()};A(document,"mousedown",m),A(window,"sroll",y,c),A(window,"resize",y,c),h._destroy=(()=>{document.removeEventListener("mousedown",m),window.removeEventListener("sroll",y),window.removeEventListener("resize",y)}),this.revertSettings={innerHTML:p.innerHTML,tabIndex:p.tabIndex},p.tabIndex=-1,R(p,{hidden:"hidden"}),p.insertAdjacentElement("afterend",h.wrapper),h.setValue(d.items),delete d.items,A(p,"invalid",t=>{_(t),h.isInvalid||(h.isInvalid=!0,h.refreshState())}),h.updateOriginalInput(),h.refreshItems(),h.refreshState(),h.inputState(),h.isSetup=!0,p.disabled&&h.disable(),h.on("change",this.onChange),E(p,"tomselected"),h.trigger("initialize"),!0===d.preload&&h.load("")}setupOptions(t=[],e=[]){for(const e of t)this.registerOption(e);for(const t of e)this.registerOptionGroup(t)}setupTemplates(){var t=this.settings.labelField,e=this.settings.optgroupLabelField,i={optgroup:(t,e)=>{let i=document.createElement("div");return i.className="optgroup",i.appendChild(t.options),i},optgroup_header:(t,i)=>'<div class="optgroup-header">'+i(t[e])+"</div>",option:(e,i)=>"<div>"+i(e[t])+"</div>",item:(e,i)=>"<div>"+i(e[t])+"</div>",option_create:(t,e)=>'<div class="create">Add <strong>'+e(t.input)+"</strong>&hellip;</div>",no_results:(t,e)=>'<div class="no-results">No results found</div>',loading:(t,e)=>'<div class="spinner"></div>',not_loading:()=>{},dropdown:()=>"<div></div>"};this.settings.render=Object.assign({},i,this.settings.render)}setupCallbacks(){var t,e,i={initialize:"onInitialize",change:"onChange",item_add:"onItemAdd",item_remove:"onItemRemove",clear:"onClear",option_add:"onOptionAdd",option_remove:"onOptionRemove",option_clear:"onOptionClear",optgroup_add:"onOptionGroupAdd",optgroup_remove:"onOptionGroupRemove",optgroup_clear:"onOptionGroupClear",dropdown_open:"onDropdownOpen",dropdown_close:"onDropdownClose",type:"onType",load:"onLoad",focus:"onFocus",blur:"onBlur"};for(t in i)(e=this.settings[i[t]])&&this.on(t,e)}onClick(t){this.isFocused&&this.isOpen||(this.focus(),_(t))}onMouseDown(t){var e=this;if(e.isFocused)return"single"!==e.settings.mode&&e.setActiveItem(),e.open(),!1;setTimeout(()=>e.focus(),0)}onChange(){L(this.input,"input"),L(this.input,"change")}onPaste(t){var e=this;e.isFull()||e.isInputHidden||e.isLocked?_(t):e.settings.splitOn&&setTimeout(()=>{var t=e.inputValue();if(t.match(e.settings.splitOn)){var i=t.trim().split(e.settings.splitOn);for(const t of i)e.createItem(t)}},0)}onKeyPress(t){if(!this.isLocked){var e=String.fromCharCode(t.keyCode||t.which);return this.settings.create&&"multi"===this.settings.mode&&e===this.settings.delimiter?(this.createItem(),void _(t)):void 0}_(t)}onKeyDown(t){if(this.isLocked)t.keyCode!==y&&_(t);else{switch(t.keyCode){case h:if(S(O,t))return void this.selectAll();break;case p:return this.isOpen&&(_(t,!0),this.close()),void this.clearActiveItems();case f:if(!this.isOpen&&this.hasOptions)this.open();else if(this.activeOption){let t=this.getAdjacent(this.activeOption,1);t&&this.setActiveOption(t)}return void _(t);case u:if(this.activeOption){let t=this.getAdjacent(this.activeOption,-1);t&&this.setActiveOption(t)}return void _(t);case d:return void(this.isOpen&&this.activeOption&&(this.onOptionSelect(t,this.activeOption),_(t)));case c:return void this.advanceSelection(-1,t);case g:return void this.advanceSelection(1,t);case y:return this.settings.selectOnTab&&this.isOpen&&this.activeOption&&(this.tab_key=!0,this.onOptionSelect(t,this.activeOption),_(t),this.tab_key=!1),void(this.settings.create&&this.createItem()&&_(t));case v:case m:return void this.deleteSelection(t)}this.isInputHidden&&!S(O,t)&&_(t)}}onKeyUp(t){if(this.isLocked)_(t);else{var e=this.inputValue();this.lastValue!==e&&(this.lastValue=e,this.settings.shouldLoad.call(this,e)&&this.load(e),this.refreshOptions(),this.trigger("type",e))}}onFocus(t){var e=this.isFocused;if(this.isDisabled)return this.blur(),void _(t);this.ignoreFocus||(this.isFocused=!0,"focus"===this.settings.preload&&this.load(""),e||this.trigger("focus"),this.activeItems.length||(this.showInput(),this.setActiveItem(),this.refreshOptions(!!this.settings.openOnFocus)),this.refreshState())}onBlur(t){var e=this;if(e.isFocused){if(e.isFocused=!1,e.ignoreFocus=!1,!e.ignoreBlur&&document.activeElement===e.dropdown_content)return e.ignoreBlur=!0,void e.onFocus(t);var i=()=>{e.close(),e.setActiveItem(),e.setCaret(e.items.length),e.trigger("blur")};e.settings.create&&e.settings.createOnBlur?e.createItem(null,!1,i):i()}}onOptionHover(t,e){}onOptionSelect(t,e){var i,s=this;e&&(e.parentElement&&e.parentElement.matches("[data-disabled]")||(e.classList.contains("create")?s.createItem(null,!0,()=>{s.settings.closeAfterSelect&&s.close()}):void 0!==(i=e.dataset.value)&&(s.lastQuery=null,s.addItem(i),s.settings.closeAfterSelect?s.close():!s.settings.hideSelected&&t.type&&/mouse/.test(t.type)&&s.setActiveOption(s.getOption(i)))))}onItemSelect(t,e){this.isLocked||"multi"===this.settings.mode&&(_(t),this.setActiveItem(e,t))}load(t){var e=this,i=e.settings.load;i&&(e.loadedSearches.hasOwnProperty(t)||(E(e.wrapper,e.settings.loadingClass),e.loading++,i.call(e,t,function(t,i){e.loading=Math.max(e.loading-1,0),e.lastQuery=null,e.clearActiveOption(),e.setupOptions(t,i),e.refreshOptions(e.isFocused&&!e.isInputHidden),e.loading||T(e.wrapper,e.settings.loadingClass),e.trigger("load",t,i)})))}onSearchChange(t){this.load(t)}setTextboxValue(t=""){var e=this.control_input;e.value!==t&&(e.value=t,L(e,"update"),this.lastValue=t)}getValue(){return this.is_select_tag&&this.input.hasAttribute("multiple")?this.items:this.items.join(this.settings.delimiter)}setValue(t,e){C(this,e?[]:["change"],()=>{this.clear(e),this.addItems(t,e)})}setMaxItems(t){0===t&&(t=null),this.settings.maxItems=t,this.refreshState()}setActiveItem(t,e){var i,s,n,o,r,a;if("single"!==this.settings.mode){if(!t)return this.clearActiveItems(),void(this.isFocused&&this.showInput());if("mousedown"===(i=e&&e.type.toLowerCase())&&S("shiftKey",e)&&this.activeItems.length){for(a=this.getLastActive(),(n=Array.prototype.indexOf.call(this.control.children,a))>(o=Array.prototype.indexOf.call(this.control.children,t))&&(r=n,n=o,o=r),s=n;s<=o;s++)t=this.control.children[s],-1===this.activeItems.indexOf(t)&&this.setActiveItemClass(t);_(e)}else"mousedown"===i&&S(O,e)||"keydown"===i&&S("shiftKey",e)?t.classList.contains("active")?this.removeActiveItem(t):this.setActiveItemClass(t):(this.clearActiveItems(),this.setActiveItemClass(t));this.hideInput(),this.isFocused||this.focus()}}setActiveItemClass(t){var e=this.control.querySelector(".last-active");e&&T(e,"last-active"),E(t,"active last-active"),-1==this.activeItems.indexOf(t)&&this.activeItems.push(t)}removeActiveItem(t){var e=this.activeItems.indexOf(t);this.activeItems.splice(e,1),T(t,"active")}clearActiveItems(){T(this.activeItems,"active"),this.activeItems=[]}setActiveOption(t){var e,i,s;if(t===this.activeOption)return;if(this.clearActiveOption(),!t)return;this.activeOption=t,R(this.control_input,{"aria-activedescendant":t.getAttribute("id")}),R(t,{"aria-selected":"true"}),E(t,"active"),e=this.dropdown_content.clientHeight;let n=this.dropdown_content.scrollTop||0;i=this.activeOption.offsetHeight,(s=this.activeOption.getBoundingClientRect().top-this.dropdown_content.getBoundingClientRect().top+n)+i>e+n?this.dropdown_content.scrollTop=s-e+i:s<n&&(this.dropdown_content.scrollTop=s)}clearActiveOption(){this.activeOption&&(T(this.activeOption,"active"),this.activeOption.removeAttribute("aria-selected")),this.activeOption=null,this.control_input.removeAttribute("aria-activedescendant")}selectAll(){"single"!==this.settings.mode&&(this.activeItems=this.controlChildren(),this.activeItems.length&&(E(this.activeItems,"active"),this.hideInput(),this.close()),this.focus())}inputState(){this.settings.controlInput||(this.activeItems.length>0||!this.isFocused&&this.settings.hidePlaceholder&&this.items.length>0?(this.setTextboxValue(),this.isInputHidden=!0,E(this.wrapper,"input-hidden")):(this.isInputHidden=!1,T(this.wrapper,"input-hidden")))}hideInput(){this.inputState()}showInput(){this.inputState()}inputValue(){return this.control_input.value.trim()}focus(){var t=this;t.isDisabled||(t.ignoreFocus=!0,t.control_input.focus(),setTimeout(()=>{t.ignoreFocus=!1,t.onFocus()},0))}blur(){this.control_input.blur(),this.onBlur(null)}getScoreFunction(t){return this.sifter.getScoreFunction(t,this.getSearchOptions())}getSearchOptions(){var t,e=this.settings;return"string"==typeof e.sortField&&(t=[{field:e.sortField}]),{fields:e.searchField,conjunction:e.searchConjunction,sort:t,nesting:e.nesting}}search(t){var e,i,s,n=this.settings,o=this.getSearchOptions();if(n.score&&"function"!=typeof(s=this.settings.score.call(this,t)))throw new Error('Tom Select "score" setting must be a function that returns a function');if(t!==this.lastQuery?(this.lastQuery=t,i=this.sifter.search(t,Object.assign(o,{score:s})),this.currentResults=i):i=Object.assign({},this.currentResults),n.hideSelected)for(e=i.items.length-1;e>=0;e--)-1!==this.items.indexOf(w(i.items[e].id))&&i.items.splice(e,1);return i}refreshOptions(t=!0){var e,i,s,n,o,r,a,h,d,p,c,u,g,f=this,v=f.inputValue(),m=f.search(v),y=f.activeOption&&w(f.activeOption.dataset.value),O=f.settings.shouldOpen||!1;for(n=m.items.length,"number"==typeof f.settings.maxOptions&&(n=Math.min(n,f.settings.maxOptions)),n>0&&(O=!0),u={},o=[],e=0;e<n;e++){let t=f.options[m.items[e].id],n=w(t[f.settings.valueField]),l=f.getOption(n);for(l||(l=f.render("option",t)),f.settings.hideSelected||l.classList.toggle("selected",f.items.includes(n)),r=t[f.settings.optgroupField]||"",i=0,s=(a=Array.isArray(r)?r:[r])&&a.length;i<s;i++)r=a[i],f.optgroups.hasOwnProperty(r)||(r=""),u.hasOwnProperty(r)||(u[r]=document.createDocumentFragment(),o.push(r)),i>0&&(T(l=l.cloneNode(!0),"active"),l.removeAttribute("aria-selected")),u[r].appendChild(l)}for(r of(this.settings.lockOptgroupOrder&&o.sort((t,e)=>{return(f.optgroups[t]&&f.optgroups[t].$order||0)-(f.optgroups[e]&&f.optgroups[e].$order||0)}),h=document.createDocumentFragment(),o))if(f.optgroups.hasOwnProperty(r)&&u[r].children.length){let t=document.createDocumentFragment();t.appendChild(f.render("optgroup_header",f.optgroups[r])),t.appendChild(u[r]);let e=f.render("optgroup",{group:f.optgroups[r],options:t});h.appendChild(e)}else h.appendChild(u[r]);if(f.dropdown_content.innerHTML="",f.dropdown_content.appendChild(h),f.settings.highlight&&(f.dropdown_content,g=document.querySelectorAll("span.highlight"),Array.prototype.forEach.call(g,function(t,e){var i=t.parentNode;i.replaceChild(t.firstChild,t),i.normalize()}),m.query.length&&m.tokens.length))for(const t of m.tokens)l(f.dropdown_content,t.regex);var b=t=>{let e=f.render(t,{input:v});return e&&(O=!0,f.dropdown_content.insertBefore(e,f.dropdown_content.firstChild)),e};if(f.settings.shouldLoad.call(f,v)?f.loading?b("loading"):0===m.items.length&&b("no_results"):b("not_loading"),(d=f.canCreate(v))&&(c=b("option_create")),f.hasOptions=m.items.length>0||d,O){if(m.items.length>0){if(!(p=y&&f.getOption(y))||!f.dropdown_content.contains(p)){let t=0;c&&!f.settings.addPrecedence&&(t=1),p=f.selectable()[t]}}else p=c;f.setActiveOption(p),t&&!f.isOpen&&f.open()}else f.clearActiveOption(),t&&f.isOpen&&f.close()}selectable(){return this.dropdown_content.querySelectorAll("[data-selectable]")}addOption(t){var e;if(Array.isArray(t))for(const e of t)this.addOption(e);else(e=this.registerOption(t))&&(this.userOptions[e]=!0,this.lastQuery=null,this.trigger("option_add",e,t))}registerOption(t){var e=w(t[this.settings.valueField]);return null!==e&&!this.options.hasOwnProperty(e)&&(t.$order=t.$order||++this.order,t.$id=this.inputId+"-opt-"+this.options_i++,this.options[e]=t,e)}registerOptionGroup(t){var e=w(t[this.settings.optgroupValueField]);return null!==e&&(t.$order=t.$order||++this.order,this.optgroups[e]=t,e)}addOptionGroup(t,e){var i;e[this.settings.optgroupValueField]=t,(i=this.registerOptionGroup(e))&&this.trigger("optgroup_add",i,e)}removeOptionGroup(t){this.optgroups.hasOwnProperty(t)&&(delete this.optgroups[t],this.clearCache(),this.trigger("optgroup_remove",t))}clearOptionGroups(){this.optgroups={},this.clearCache(),this.trigger("optgroup_clear")}updateOption(t,e){var i,s,n,o,r,a,l;if(t=w(t),n=w(e[this.settings.valueField]),null!==t&&this.options.hasOwnProperty(t)){if("string"!=typeof n)throw new Error("Value must be set in option data");l=this.options[t].$order,n!==t&&(delete this.options[t],-1!==(o=this.items.indexOf(t))&&this.items.splice(o,1,n)),e.$order=e.$order||l,this.options[n]=e,r=this.renderCache.item,a=this.renderCache.option,r&&(delete r[t],delete r[n]),a&&(delete a[t],delete a[n]),-1!==this.items.indexOf(n)&&(i=this.getItem(t),s=this.render("item",e),i.classList.contains("active")&&E(s,"active"),i.parentNode.insertBefore(s,i),i.remove()),this.lastQuery=null,this.isOpen&&this.refreshOptions(!1)}}removeOption(t,e){t=w(t);var i=this.renderCache.item,s=this.renderCache.option;i&&delete i[t],s&&delete s[t],delete this.userOptions[t],delete this.options[t],this.lastQuery=null,this.trigger("option_remove",t),this.removeItem(t,e)}clearOptions(){this.loadedSearches={},this.userOptions={},this.clearCache();var t={};for(let e in this.options)this.options.hasOwnProperty(e)&&this.items.indexOf(e)>=0&&(t[e]=this.options[e]);this.options=this.sifter.items=t,this.lastQuery=null,this.trigger("option_clear")}getOption(t){return this.renderCache.option.hasOwnProperty(t)?this.renderCache.option[t]:this.getElementWithValue(t,this.selectable())}getAdjacent(t,e,i="option"){var s;if(t){s="item"==i?this.controlChildren():this.dropdown_content.querySelectorAll("[data-selectable]");for(let i=0;i<s.length;i++)if(s[i]==t)return e>0?s[i+1]:s[i-1]}}getElementWithValue(t,e){if(null!==(t=w(t)))for(const i of e){let e=i;if(e.getAttribute("data-value")===t)return e}}getItem(t){return this.getElementWithValue(t,this.control.children)}addItems(t,e){var i=this;i.buffer=document.createDocumentFragment();for(const t of i.control.children)i.buffer.appendChild(t);var s=Array.isArray(t)?t:[t];for(let t=0,n=(s=s.filter(t=>-1===i.items.indexOf(t))).length;t<n;t++)i.isPending=t<n-1,i.addItem(s[t],e);var n=i.control;n.insertBefore(i.buffer,n.firstChild),i.buffer=null}addItem(t,e){C(this,e?[]:["change"],()=>{var i,s,n=this.settings.mode;if(t=w(t),(-1===this.items.indexOf(t)||("single"===n&&this.close(),"single"!==n&&this.settings.duplicates))&&this.options.hasOwnProperty(t)&&("single"===n&&this.clear(e),"multi"!==n||!this.isFull())){if(i=this.render("item",this.options[t]),this.control.contains(i)&&(i=i.cloneNode(!0)),s=this.isFull(),this.items.splice(this.caretPos,0,t),this.insertAtCaret(i),this.isSetup){let s=this.selectable();if(!this.isPending){let e=this.getOption(t),i=this.getAdjacent(e,1);this.refreshOptions(this.isFocused&&"single"!==n),i&&this.setActiveOption(i)}!s.length||this.isFull()?this.close():this.isPending||this.positionDropdown(),this.trigger("item_add",t,i),this.isPending||this.updateOriginalInput({silent:e})}(!this.isPending||!s&&this.isFull())&&this.refreshState()}})}removeItem(t,e){var i,s,n=this.getItem(t);n&&(t=w(n.dataset.value),-1!==(i=this.items.indexOf(t))&&(n.remove(),n.classList.contains("active")&&(s=this.activeItems.indexOf(n),this.activeItems.splice(s,1),T(n,"active")),this.items.splice(i,1),this.lastQuery=null,!this.settings.persist&&this.userOptions.hasOwnProperty(t)&&this.removeOption(t,e),i<this.caretPos&&this.setCaret(this.caretPos-1),this.updateOriginalInput({silent:e}),this.refreshState(),this.positionDropdown(),this.trigger("item_remove",t,n)))}createItem(t,e=!0,i){var s,n=this,o=n.caretPos;if(t=t||n.inputValue(),"function"!=typeof i&&(i=(()=>{})),!n.canCreate(t))return i(),!1;n.lock();var r=!1,a=t=>{if(n.unlock(),!t||"object"!=typeof t)return i();var s=w(t[n.settings.valueField]);if("string"!=typeof s)return i();n.setTextboxValue(),n.addOption(t),n.setCaret(o),n.addItem(s),n.refreshOptions(e&&"single"!==n.settings.mode),i(t),r=!0};return s="function"==typeof n.settings.create?n.settings.create.call(this,t,a):{[n.settings.labelField]:t,[n.settings.valueField]:t},r||a(s),!0}refreshItems(){this.lastQuery=null,this.isSetup&&this.addItems(this.items),this.updateOriginalInput(),this.refreshState()}refreshState(){this.refreshValidityState();var t=this.isFull(),e=this.isLocked;this.wrapper.classList.toggle("rtl",this.rtl);var i,s=this.control.classList;s.toggle("focus",this.isFocused),s.toggle("disabled",this.isDisabled),s.toggle("required",this.isRequired),s.toggle("invalid",this.isInvalid),s.toggle("locked",e),s.toggle("full",t),s.toggle("not-full",!t),s.toggle("input-active",this.isFocused&&!this.isInputHidden),s.toggle("dropdown-active",this.isOpen),s.toggle("has-options",(i=this.options,0===Object.keys(i).length)),s.toggle("has-items",this.items.length>0)}refreshValidityState(){if(this.input.checkValidity){this.isRequired&&(this.input.required=!0);var t=!this.input.checkValidity();this.isInvalid=t,this.control_input.required=t,this.isRequired&&(this.input.required=!t)}}isFull(){return null!==this.settings.maxItems&&this.items.length>=this.settings.maxItems}updateOriginalInput(t={}){var e,i,s=this;if(s.is_select_tag)for(s.input.querySelectorAll("option[selected]").forEach(t=>{-1==s.items.indexOf(t.value)&&(t.selected=!1,t.removeAttribute("selected"))}),e=s.items.length-1;e>=0;e--){var n;if(i=s.items[e],!(n=s.options[i].$option)){const t=s.options[i][s.settings.labelField]||"";n=F('<option value="'+I(i)+'">'+I(t)+"</option>"),s.options[i].$option=n}n.selected=!0,R(n,{selected:"true"}),s.input.prepend(n)}else s.input.value=s.getValue();s.isSetup&&(t.silent||s.trigger("change",s.getValue()))}open(){this.isLocked||this.isOpen||"multi"===this.settings.mode&&this.isFull()||(this.isOpen=!0,R(this.control_input,{"aria-expanded":"true"}),this.refreshState(),P(this.dropdown,{visibility:"hidden",display:"block"}),this.positionDropdown(),P(this.dropdown,{visibility:"visible",display:"block"}),this.focus(),this.trigger("dropdown_open",this.dropdown))}close(){var t=this.isOpen;this.setTextboxValue(),"single"===this.settings.mode&&this.items.length&&(this.hideInput(),this.tab_key||this.blur()),this.isOpen=!1,R(this.control_input,{"aria-expanded":"false"}),P(this.dropdown,{display:"none"}),this.clearActiveOption(),this.refreshState(),t&&this.trigger("dropdown_close",this.dropdown)}positionDropdown(){if("body"===this.settings.dropdownParent){var t=this.control,e=t.getBoundingClientRect(),i=t.offsetHeight+e.top+window.scrollY,s=e.left+window.scrollX;P(this.dropdown,{width:e.width+"px",top:i+"px",left:s+"px"})}}clear(t){if(this.items.length){var e=this.controlChildren();for(const t of e)t.remove();this.items=[],this.lastQuery=null,this.setCaret(0),this.setActiveItem(),this.updateOriginalInput({silent:t}),this.refreshState(),this.showInput(),this.trigger("clear")}}insertAtCaret(t){var e=Math.min(this.caretPos,this.items.length),i=this.buffer||this.control;0===e?i.insertBefore(t,i.firstChild):i.insertBefore(t,i.children[e]),this.setCaret(e+1)}deleteSelection(t){var e,i,s,n,o;if(e=t&&t.keyCode===v?-1:1,i={start:(o=this.control_input).selectionStart,length:o.selectionEnd-o.selectionStart},s=[],this.activeItems.length){n=N(D(this.activeItems,e)),e>0&&n++;for(const t of this.activeItems)s.push(t.dataset.value)}else(this.isFocused||"single"===this.settings.mode)&&this.items.length&&(e<0&&0===i.start&&0===i.length?s.push(this.items[this.caretPos-1]):e>0&&i.start===this.inputValue().length&&s.push(this.items[this.caretPos]));if(!s.length||"function"==typeof this.settings.onDelete&&!1===this.settings.onDelete.call(this,s,t))return!1;for(_(t,!0),void 0!==n&&this.setCaret(n);s.length;)this.removeItem(s.pop());return this.showInput(),this.positionDropdown(),this.refreshOptions(!1),!0}advanceSelection(t,e){var i,s,n;this.rtl&&(t*=-1),this.inputValue().length||(S(O,e)||S("shiftKey",e)?(n=(s=this.getLastActive(t))?s.classList.contains("active")?this.getAdjacent(s,t,"item"):s:t>0?this.control_input.nextElementSibling:this.control_input.previousElementSibling)&&(n.classList.contains("active")&&this.removeActiveItem(s),this.setActiveItemClass(n)):this.isFocused&&!this.activeItems.length?this.setCaret(this.caretPos+t):(s=this.getLastActive(t))&&(i=N(s),this.setCaret(t>0?i+1:i),this.setActiveItem()))}getLastActive(t){let e=this.control.querySelector(".last-active");if(e)return e;var i=this.control.querySelectorAll(".active");return i?D(i,t):void 0}setCaret(t){var e=this;"single"===e.settings.mode||e.settings.controlInput?t=e.items.length:(t=Math.max(0,Math.min(e.items.length,t)))==e.caretPos||e.isPending||e.controlChildren().forEach((i,s)=>{s<t?e.control_input.insertAdjacentElement("beforebegin",i):e.control.appendChild(i)}),e.caretPos=t}controlChildren(){return Array.from(this.control.getElementsByClassName(this.settings.itemClass))}lock(){this.close(),this.isLocked=!0,this.refreshState()}unlock(){this.isLocked=!1,this.refreshState()}disable(){this.input.disabled=!0,this.control_input.disabled=!0,this.control_input.tabIndex=-1,this.isDisabled=!0,this.lock()}enable(){this.input.disabled=!1,this.control_input.disabled=!1,this.control_input.tabIndex=this.tabIndex,this.isDisabled=!1,this.unlock()}destroy(){var t=this.revertSettings;this.trigger("destroy"),this.off(),this.wrapper.remove(),this.dropdown.remove(),this.input.innerHTML=t.innerHTML,this.input.tabIndex=t.tabIndex,T(this.input,"tomselected"),this.input.removeAttribute("hidden"),this.input.required=this.isRequired,this._destroy(),delete this.input.tomselect}render(t,e){var i,s;if(("option"===t||"item"===t)&&(i=w(e[this.settings.valueField]),this.renderCache[t].hasOwnProperty(i)))return this.renderCache[t][i];var n=this.settings.render[t];return"function"!=typeof n?null:(s=n.call(this,e,I))?(s=F(s),"option"===t||"option_create"===t?e[this.settings.disabledField]?R(s,{"aria-disabled":"true"}):R(s,{"data-selectable":""}):"optgroup"===t&&(R(s,{"data-group":e.group[this.settings.optgroupValueField]}),e.group[this.settings.disabledField]&&R(s,{"data-disabled":""})),"option"!==t&&"item"!==t||(R(s,{"data-value":i}),"item"===t?E(s,this.settings.itemClass):(E(s,this.settings.optionClass),R(s,{role:"option",id:e.$id})),this.renderCache[t][i]=s),s):s}clearCache(t){void 0===t?this.renderCache={item:{},option:{}}:this.renderCache[t]={}}canCreate(t){return this.settings.create&&t.length&&this.settings.createFilter.call(this,t)}hook(t,e,i){var s=this,n=s[e];s[e]=function(){var e,o;return"after"===t&&(e=n.apply(s,arguments)),o=i.apply(s,arguments),"instead"===t?o:("before"===t&&(e=n.apply(s,arguments)),e)}}}return H.define("change_listener",function(t){var e=this,i=!1;A(e.input,"change",()=>{if(i)i=!1;else{i=!0;var t=k(e.input,{});e.setupOptions(t.options,t.optgroups),e.setValue(t.items)}})}),H.define("checkbox_options",function(t){var e=this,i=e.onOptionSelect;e.settings.hideSelected=!1;var s=function(t){var e=t.querySelector("input");t.classList.contains("selected")?e.checked=!0:e.checked=!1};e.hook("after","setupTemplates",()=>{var t=e.settings.render.option;e.settings.render.option=function(i){var s=F(t.apply(e,arguments)),n=document.createElement("input");n.addEventListener("click",function(t){_(t)}),n.type="checkbox";var o=w(i[e.settings.valueField]);return e.items.indexOf(o)>-1&&(n.checked=!0),s.prepend(n),s}}),e.on("item_remove",t=>{var i=e.getOption(t);i&&(i.classList.remove("selected"),s(i))}),e.hook("instead","onOptionSelect",function(t,s){return s.classList.contains("selected")?(s.classList.remove("selected"),e.removeItem(s.dataset.value),e.refreshOptions(),void _(t,!0)):i.apply(e,arguments)}),e.hook("after","onOptionSelect",(t,e)=>{s(e)})}),H.define("clear_button",function(t){var e=this;t=Object.assign({className:"clear-button",title:"Clear All",html:t=>`<div class="${t.className}" title="${t.title}">&times;</div>`},t),e.hook("after","setup",()=>{var i=F(t.html(t));i.addEventListener("click",t=>{for(;e.items.length>0;)e.removeItem(e.items[0],!0);e.updateOriginalInput(),t.preventDefault(),t.stopPropagation()}),e.control.appendChild(i)})}),H.define("drag_drop",function(t){var e=this;if(!$.fn.sortable)throw new Error('The "drag_drop" plugin requires jQuery UI "sortable".');if("multi"===e.settings.mode){var i=e.lock,s=e.unlock;e.hook("instead","lock",function(){var t=e.control.dataset.sortable;return t&&t.disable(),i.apply(e,arguments)}),e.hook("instead","unlock",function(){var t=e.control.dataset.sortable;return t&&t.enable(),s.apply(e,arguments)}),e.hook("after","setup",()=>{var t=$(e.control).sortable({items:"[data-value]",forcePlaceholderSize:!0,disabled:e.isLocked,start:(e,i)=>{i.placeholder.css("width",i.helper.css("width")),t.css({overflow:"visible"})},stop:()=>{t.css({overflow:"hidden"});var i=[];t.children("[data-value]").each(function(){i.push($(this).attr("data-value"))}),e.setValue(i)}})})}}),H.define("dropdown_header",function(t){var e=this;t=Object.assign({title:"Untitled",headerClass:"dropdown-header",titleRowClass:"dropdown-header-title",labelClass:"dropdown-header-label",closeClass:"dropdown-header-close",html:t=>'<div class="'+t.headerClass+'"><div class="'+t.titleRowClass+'"><span class="'+t.labelClass+'">'+t.title+'</span><a class="'+t.closeClass+'">&times;</a></div></div>'},t),e.hook("after","setup",()=>{var i=F(t.html(t)),s=i.querySelector("."+t.closeClass);s&&s.addEventListener("click",t=>{_(t,!0),e.close()}),e.dropdown.insertBefore(i,e.dropdown.firstChild)})}),H.define("dropdown_input",function(){var t=this,e=t.settings.controlInput||'<input type="text" autocomplete="off" class="dropdown-input" />';e=F(e),t.settings.placeholder&&R(e,{placeholder:t.settings.placeholder}),t.settings.controlInput=e,t.settings.shouldOpen=!0,t.hook("after","setup",()=>{R(t.wrapper,{tabindex:t.input.disabled?"-1":t.tabIndex}),A(t.wrapper,"keypress",e=>{if(!t.control.contains(e.target)&&!t.dropdown.contains(e.target))switch(e.keyCode){case d:return void t.onClick(e)}});let i=F('<div class="dropdown-input-wrap">');i.appendChild(e),t.dropdown.insertBefore(i,t.dropdown.firstChild)})}),H.define("input_autogrow",function(){var t=this;t.hook("after","setup",()=>{var e=document.createElement("span"),i=t.control_input;e.style.cssText="position:absolute; top:-99999px; left:-99999px; width:auto; padding:0; white-space:pre; ",t.wrapper.appendChild(e);for(const t of["letterSpacing","fontSize","fontFamily","fontWeight","textTransform"])e.style[t]=i.style[t];var s=()=>{t.items.length>0?(e.textContent=i.value,i.style.width=e.clientWidth+"px"):i.style.width=""};s(),t.on("update item_add item_remove",s),A(i,"input",s),A(i,"keyup",s),A(i,"blur",s),A(i,"update",s)})}),H.define("no_backspace_delete",function(){var t=this,e=t.deleteSelection;this.hook("instead","deleteSelection",function(){return!!t.activeItems.length&&e.apply(t,arguments)})}),H.define("no_active_items",function(t){this.hook("instead","setActiveItem",()=>{}),this.hook("instead","selectAll",()=>{})}),H.define("optgroup_columns",function(){var t=this,e=t.onKeyDown;t.hook("instead","onKeyDown",function(i){var s,n,o,r;if(!t.isOpen||i.keyCode!==c&&i.keyCode!==g)return e.apply(t,arguments);r=j(t.activeOption,"[data-group]"),s=N(t.activeOption,"[data-selectable]"),(r=i.keyCode===c?r.previousSibling:r.nextSibling)&&(n=(o=r.querySelectorAll("[data-selectable]"))[Math.min(o.length-1,s)])&&t.setActiveOption(n)})}),H.define("remove_button",function(t){t=Object.assign({label:"&times;",title:"Remove",className:"remove",append:!0},t);var e=this;if(t.append){var i='<a href="javascript:void(0)" class="'+t.className+'" tabindex="-1" title="'+I(t.title)+'">'+t.label+"</a>";e.hook("after","setupTemplates",()=>{var t=e.settings.render.item;e.settings.render.item=function(){var s=F(t.apply(e,arguments)),n=F(i);return s.appendChild(n),A(n,"mousedown",t=>{_(t,!0)}),A(n,"click",t=>{if(_(t,!0),!e.isLocked){var i=s.dataset.value;e.removeItem(i),e.refreshOptions(!1)}}),s}})}}),H.define("restore_on_backspace",function(t){var e=this;t.text=t.text||function(t){return t[e.settings.labelField]},e.on("item_remove",function(i){if(""===e.control_input.value.trim()){var s=e.options[i];s&&e.setTextboxValue(t.text.call(e,s))}})}),H});var tomSelect=function(t,e){return new TomSelect(t,e)};

const app = {}

app.compare = (async() => {

	new TomSelect('#select-players',{
		maxItems: 6,
		plugins: {
			remove_button:{
				title:'Remove',
			}
		},
		persist: false
	});

	// collapse expand block
	document.addEventListener('click', function (event) {

		// If the clicked element doesn't have the right selector, bail
		if (!event.target.matches('.player-comparison__group-title')) return

		// Don't follow the link
		event.preventDefault()

		// Log the clicked element in the console
		var parentparent = event.target.parentElement.parentElement
		parentparent.classList.toggle("active")

	}, false)


	// get the sticky element
	const stickyElm = document.querySelector('.player-comparison__stats.name-area')

	const observer = new IntersectionObserver(
		([e]) => e.target.classList.toggle('isSticky', e.intersectionRatio < 1),
		{threshold: [1]}
	);

	observer.observe(stickyElm)















	let form = document.querySelector('.player-comparison__select-wrapper')
	form.querySelector('button').addEventListener('click', async (e) => {
		e.preventDefault()

		let options = form.querySelector('select').selectedOptions
		let players = Array.from(options).map(({ value }) => value)

		let raw = await fetch('/compare/data', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			},
			body: JSON.stringify(players)
		})
		let data = await raw.json()

		if(data) {

			// remove all values
			document.querySelectorAll('.player-value').forEach(e => e.remove())

			for(let playerid in data) {
				let player = data[playerid].player
				for (let stat in data[playerid]) {
					let value = data[playerid][stat]

					// set value if stat exists
					if(document.querySelector('.'+stat)) {
						let div = document.createElement('div')
						div.classList.add('player-value')
						div.innerText = value

						util.insertAfter(div, document.querySelector('.'+stat+' .label'))
					}


					// set highlight
					// if(data[0][stat] > data[1][stat])
					// 	document.querySelector('.'+stat+' .player1').classList.add('highlight')
					// else if(data[0][stat] < data[1][stat])
					// 	document.querySelector('.'+stat+' .player2').classList.add('highlight')
				}
			}

			document.querySelector('.compare-results').style.display = 'block'
		}

	})

})

if(document.querySelector('.player-comparison__select'))
	app.compare()

app.filters = (async() => {
	initELO()
	initSeason()
	initMap()

	let filters = document.querySelector('.page-filter')
	filters.addEventListener('click', (e) => {
		let season = util.findParentBySelector(e.target, ".season")
		let elo = util.findParentBySelector(e.target, ".elo")
		let map = util.findParentBySelector(e.target, ".map")
		let btn = util.findParentBySelector(e.target, ".filter-submit button")

		if(season)
			openFilter(season)
		else if(elo)
			openFilter(elo)
		else if(map)
			openFilter(map)

		else if(btn) {
			let uri = []

			// elo
			let elo = slider.noUiSlider.get()
			uri.push(`elo=${elo[0]}-${elo[1]}`)

			// seasons
			let seasonIDs = []
			for (const s of document.querySelectorAll('.season input:checked'))
				seasonIDs.push(s.value)
			if(seasonIDs[0] != 'all' && seasonIDs.length > 0)
				uri.push(`season=${seasonIDs.join(',')}`)

			// maps
			let mapIDs = []
			for (const s of document.querySelectorAll('.map input:checked'))
				mapIDs.push(s.value)
			if(mapIDs[0] != 'all' && mapIDs.length > 0)
				uri.push(`map=${mapIDs.join(',')}`)

			const url = window.location.origin + window.location.pathname
			window.location.href = url + '?' + uri.join('&')
		}
	})


	function openFilter(self) {
		// close all existing
		if(document.querySelector('.drop-down_list.active'))
			document.querySelector('.drop-down_list.active').classList.remove('active')
		// open selected
		self.querySelector('.drop-down_list').classList.add('active')
		// close when clicked outside
		document.body.addEventListener('click', closeServing)
		function closeServing(e) {
			if(!util.findParentBySelector(e.target, ".drop-down")) {
				self.querySelector('.drop-down_list').classList.remove('active')
				document.body.removeEventListener('click', closeServing)
			}
		}
	}

	function initELO() {
		const slider = document.getElementById('slider')
		let url = new URLSearchParams(window.location.search)
		let elo = (url.get('elo') ? url.get('elo').split('-') : [2000,3000])

		noUiSlider.create(slider, {
			start: elo,
			connect: true,
			tooltips: true,
			format: wNumb({decimals: 0}),
			step: 50,
			range: {
				'min': 0,
				'max': 3000
			},
		})

		slider.noUiSlider.on('update', function() {
			let value =slider.noUiSlider.get()
			let elo = document.querySelector('.drop-down.elo')
			elo.querySelector('.drop-down_current .value').innerText = value[0] + '-' + value[1]
		})
	}

	function initSeason() {
		// on change
		document.querySelector('.season').addEventListener('change', (e) => {
			let seasons = []
			let options = document.querySelectorAll('.season input:not(input[value=all])')
			let label = document.querySelector('.season .value')
			let all = document.querySelector('.season input[value="all"]')

			if(all.checked) {
				label.innerText = 'All'
				for (const s of options) {
					s.disabled = true
					s.checked = false
				}
			}
			else {
				label.innerText = '-'
				for (const s of options) {
					s.disabled = false
					if(s.checked)
						seasons.push(s.parentNode.querySelector('label').innerText)
				}
			}

			if(seasons.length > 0)
				label.innerText = seasons.join(', ')
		})

		// set inital values
		let url = new URLSearchParams(window.location.search)
		let season = (url.get('season') ? url.get('season').split(',') : false)
		let label = document.querySelector('.season .value')
		if(season) {
			for (let s of season)
				document.querySelector(`.season input[value='${s}']`).checked = true

			document.querySelector('.season input[value="all"]').click()
		}
	}


	function initMap() {
		// on change
		document.querySelector('.map').addEventListener('change', (e) => {
			let maps = []
			let options = document.querySelectorAll('.map input:not(input[value=all])')
			let label = document.querySelector('.map .value')
			let all = document.querySelector('.map input[value="all"]')

			if(all.checked) {
				label.innerText = 'All'
				for (const s of options) {
					s.disabled = true
					s.checked = false
				}
			}
			else {
				label.innerText = '-'
				for (const s of options) {
					s.disabled = false
					if(s.checked)
						maps.push(s.parentNode.querySelector('label').innerText)
				}
			}

			if(maps.length > 0)
				label.innerText = maps.join(', ')
		})

		// set inital values
		let url = new URLSearchParams(window.location.search)
		let map = (url.get('map') ? url.get('map').split(',') : false)
		let label = document.querySelector('.map .value')
		if(map) {
			for (let s of map)
				document.querySelector(`.map input[value='${s}']`).checked = true

			document.querySelector('.map input[value="all"]').click()
		}
	}

})

if(document.querySelector('.page-filter')) {
	app.filters()
}

if(document.querySelector('.stats-records')) {
	let tabs = document.querySelector('.tabs')
	tabs.addEventListener('click', (e) => {
		e.preventDefault()

		let left = util.findParentBySelector(e.target, ".left")
		let right = util.findParentBySelector(e.target, ".right")

		let filter = []
		let link  = util.findParentBySelector(e.target, "a")

		if(left) {
			if(document.querySelector('.tabs .right .active').innerText === 'Low ELO')
				filter.push('elo=low')

			if(link.hasAttribute('data-param'))
				filter.push(link.dataset.param)
		}
		else if (right) {
			if(document.querySelector('.tabs .left .active').innerText === 'Season 2')
				filter.push('season=2')
			else if(document.querySelector('.tabs .left .active').innerText === 'Season 1')
				filter.push('season=1')

			if(link.hasAttribute('data-param'))
				filter.push(link.dataset.param)
		}

		let url = window.location.origin + window.location.pathname
		if(filter.length > 0)
			url = url + '?' + filter.join('&')

		window.location.href = url
	})
}

app.tableSort = (async() => {
  const columnData = []
  const dictOfColumnIndexAndTableRow = {}
  for (let sortableTable of document.getElementsByTagName('table')) {
    if (sortableTable.className === 'table-sticky') {

      if (sortableTable.getElementsByTagName('thead').length === 0) {
        const the = document.createElement('thead');
        the.appendChild(sortableTable.rows[0]);
        sortableTable.insertBefore(the, sortableTable.firstChild);
      }

      const tableHead = sortableTable.querySelector('thead')
      const tableBody = sortableTable.querySelector('tbody')
      const tableHeadHeaders = tableHead.querySelectorAll('th')

      for (let [columnIndex, th] of tableHeadHeaders.entries('table')) {
        let timesClickedColumn = 0
        th.addEventListener("click", () => {
			// prevent rank & player sorting
			if(columnIndex === 0 || columnIndex === 1) return false

			timesClickedColumn += 1

			// remove classes if exist
			if(tableHead.querySelector('.sort-desc'))
				tableHead.querySelector('.sort-desc').classList.remove('sort-desc')
			if(tableHead.querySelector('.sort-asc'))
				tableHead.querySelector('th.sort-asc').classList.remove('sort-asc')

          function getTableDataOnClick() {
            const tableRows = tableBody.querySelectorAll('tr');
            for (let [i, tr] of tableRows.entries()) {
              if (tr.querySelectorAll('td').item(columnIndex).innerHTML !== '') {
                columnData.push(tr.querySelectorAll('td').item(columnIndex).innerHTML + '#' + i)
                dictOfColumnIndexAndTableRow[tr.querySelectorAll('td').item(columnIndex).innerHTML + '#' + i] = tr.innerHTML
              } else {
                columnData.push('0#' + i)
                dictOfColumnIndexAndTableRow['0#' + i] = tr.innerHTML
              }
            }

            function naturalSortAescending(a, b) {
              return a.localeCompare(b, navigator.languages[0] || navigator.language, {
                numeric: true,
                // ignorePunctuation: true
              })
            }

            function naturalSortDescending(a, b) {
              return naturalSortAescending(b, a)
            }

            if (typeof columnData[0] !== "undefined") {
              if (th.classList.contains('order-desc') && timesClickedColumn === 1) {
                columnData.sort(naturalSortDescending, {
                  numeric: true,
                  ignorePunctuation: true
                })
              } else if (th.classList.contains('order-desc') && timesClickedColumn === 2) {
                columnData.sort(naturalSortAescending, {
                  numeric: true,
                  ignorePunctuation: true
                })
                timesClickedColumn = 0
              } else if (timesClickedColumn === 1) {
				th.classList.add('sort-asc')

                columnData.sort(naturalSortAescending)
              } else if (timesClickedColumn === 2) {
				th.classList.add('sort-desc')

                columnData.sort(naturalSortDescending)
                timesClickedColumn = 0
              }
            }
          }
          getTableDataOnClick();

          function returnSortedTable() {
            const tableRows = tableBody.querySelectorAll('tr');
            for (let [i, tr] of tableRows.entries()) {
              tr.innerHTML = dictOfColumnIndexAndTableRow[columnData[i]]
            }
            columnData.length = 0
          }
          returnSortedTable()
        });
      }
    }
  }
})

if(document.querySelector('.table-sticky'))
 app.tableSort()

util = {

	indexInParent: function(node) {
	    var children = node.parentNode.childNodes
        num = 0

		for (var i=0; i<children.length; i++) {
			if (children[i]==node) return num
			if (children[i].nodeType==1) num++
		}

		return -1
	},

	findParentBySelector: function(node, selector) {
		while (node && node.parentNode) {
			var list = node.parentNode.querySelectorAll(selector)

			if(Array.prototype.includes.call(list, node))
				return node

			node = node.parentNode
		}

		return node | ''
	},

	insertAfter: function(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
	}

}
