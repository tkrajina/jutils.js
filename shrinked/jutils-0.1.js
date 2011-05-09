ajax=new Object();dom=new Object();utils=new Object();html=new Object();popup=new Object();dom.byId=function(a){if(document.all){return document.all[a]}return document.getElementById(a)};dom.removeChilds=function(a){if(!a){return}while(a.hasChildNodes()){a.removeChild(a.childNodes[0])}};dom.createElement=function(a,d,c,e){var b=document.createElement(a);if(d){for(parameter in d){b[parameter]=d[parameter]}}if(c){for(parameter in c){b.style[parameter]=c[parameter]}}if(e){b.innerHTML=e}return b};dom.walkSubtree=function(b,c){if(b&&c){var a=c(b);if(a){return a}if(b.childNodes){for(i in b.childNodes){var a=dom.walkSubtree(b.childNodes[i],c);if(a){return a}}}}};dom.walkBranch=function(c,d){var b=c;while(b&&b!=document){var a=d(b);if(a){return a}if(b.parentNode){b=b.parentNode}}};dom.walk=function(a){return dom.walkSubtree(document.documentElement,a)};ajax.getXmlHttpRequest=function(){var a=false;try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(c){try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(b){a=false}}if(!a&&typeof XMLHttpRequest!="undefined"){a=new XMLHttpRequest()}return a};ajax.call=function(f,d,e,c,b){if(!b){b=new Object();b.blockPage=true;b.keepBlocked=false}if(b.blockPage){utils.blockPage("Just a moment, please...",{showCloseLink:false})}if(!e){e={}}reqParams="";for(key in e){reqParams+=key+"="+escape(e[key])+"&"}var a=ajax.getXmlHttpRequest();a.onreadystatechange=function(){if(a.readyState==4){if(c){c(a.responseText)}if(b.blockPage&&!b.keepBlocked){utils.unblockPage()}}};if(f=="POST"){a.open("POST",d);a.setRequestHeader("Content-type","application/x-www-form-urlencoded");a.send(reqParams)}else{if(reqParams){d+="?"+reqParams}a.open("GET",d);a.send(null)}};ajax.post=function(c,d,b,a){return ajax.call("POST",c,d,b,a)};ajax.get=function(c,d,b,a){return ajax.call("GET",c,d,b,a)};ajax.formSubmit=function(c,d,b,a){return ajax.post(c,utils.getFormParameters(d),b,a)};utils.parseJson=function(data){if("string"==typeof data){return eval("("+data+")")}return data};utils.getAndIncrementMaxZIndex=function(){if(utils.maxZIndex){var a=utils.maxZIndex;utils.maxZIndex+=1;return a}else{utils.maxZIndex=100000;dom.walk(function(b){if(b.style&&b.style.zIndex){var c=parseInt(b.style.zIndex);if(c>utils.maxZIndex){utils.maxZIndex=c+1}}});return utils.getAndIncrementMaxZIndex()}};utils.addListener=function(b,c,a){if(b&&b.addEventListener){b.addEventListener(c,a,false)}else{if(b.attachEvent){b.attachEvent("on"+c,a)}}};utils.removeListener=function(b,c,a){if(b&&b.removeEventListener){b.removeEventListener(c,a,false)}else{if(b.detachEvent){b.detachEvent("on"+c,a)}}};utils.getElementPosition=function(a){var b=curtop=0;if(a.offsetParent){do{b+=a.offsetLeft;curtop+=a.offsetTop}while(a=a.offsetParent);return[b,curtop]}return null};utils.initBlockPageDivs=function(){if(!dom.byId("blockDiv")){var c=dom.createElement("div",{id:"blockDiv"},{},"");var b=dom.createElement("div",{id:"blockDivContent"},{},"");var a=document.getElementsByTagName("body")[0];a.appendChild(c);a.appendChild(b);b.checkPosition=function(){var f=this.offsetWidth;var e=this.offsetHeight;var d=document.body.offsetWidth;var g=document.body.offsetHeight;this.style.left=((d-f)/2)+"px";this.style.top="40px";this.timeout=setTimeout('dom.byId("blockDivContent").checkPosition()',100)};b.stopCheckingPosition=function(){if(this.timeout){clearTimeout(this.timeout)}}}};utils.blockPage=function(c,a){utils.initBlockPageDivs();if(!a){a=new Object();a.showCloseLink=true;a.width="100px";a.height=null;a.top="100px";a.left="100px"}var e=document.getElementById("blockDiv");var b=document.getElementById("blockDivContent");b.checkPosition();var d=navigator.userAgent.indexOf("MSIE")<0;if(d){e.style.position="fixed";b.style.position="fixed";e.style.top="0%";e.style.left="0%";e.style.width="100%";e.style.height="100%"}else{e.style.position="absolute";b.style.position="absolute";e.style.top="0px";e.style.left="0px";e.style.width=document.body.offsetWidth+"px";e.style.height=document.body.offsetHeight+"px";b.style.paddingTop=document.documentElement.scrollTop+"px"}if(!c){c=""}if(a.showCloseLink){c+='<div id="blockDivContentClose"><a href="javascript:void(utils.unblockPage())"><img src="close.png" style="border:none" /></a></div>'}dom.removeChilds(b);b.innerHTML='<div class="blockDivContent2">'+c+"</div>";e.style.zIndex=utils.getAndIncrementMaxZIndex();b.style.zIndex=utils.getAndIncrementMaxZIndex();e.style.display="block";b.style.display="block";b.style.border="1px solid black"};utils.unblockPage=function(){var b=document.getElementById("blockDiv");var a=document.getElementById("blockDivContent");b.style.display="none";a.style.display="none";a.stopCheckingPosition()};utils.openImage=function(imageKey){var onAjax=function(data){data=eval("("+data+")");var imageUrl=data.image_url;var editUrl=data.edit_url;var deleteUrl=data.delete_url;text='<img src="'+imageUrl+'" /><br/><br/>';if(editUrl){text+='<a href="'+editUrl+'">Edit</a>'}if(editUrl&&deleteUrl){text+=" &middot; "}if(deleteUrl){text+='<a href="'+deleteUrl+'">Delete</a>'}utils.blockPage(text,true)};ajax.get("/image:"+imageKey+"/ajax/data",onAjax,true)};utils.redirectIf=function(a,b){if(confirm(a)){document.location=b}};utils.getFormParameters=function(b){result={};for(i in b.elements){var a=b.elements[i].name;var c=b.elements[i].value;if(a&&c){result[a]=c}}return result};utils.getEventTarget=function(a){if(a.srcElement){return a.srcElement}return a.target};html.getComputedStyle=function(a,b){if(a.currentStyle){return a.currentStyle[b]}else{if(window.getComputedStyle){return document.defaultView.getComputedStyle(a,null).getPropertyValue(b)}}};html.hasClass=function(b,c){if(!b.className){return false}var a=b.className.split(/\s+/);for(i in a){if(c==a[i]){return true}}return false};html.addClass=function(b,c){if(!b.className){b.className=c;return}var a=b.className.split(/\s+/);a.push(c);b.className=a.join(" ")};html.removeClass=function(c,d){if(!c.className){return}var b=c.className.split(/\s+/);var a=new Array();for(i in b){if(b[i]!=d){a.push(b[i])}}c.className=a.join(" ")};html.addMouseOverClass=function(a,b){utils.addListener(a,"mouseover",function(){html.addClass(a,b)});utils.addListener(a,"mouseout",function(){html.removeClass(a,b)})};popup.registeredMenus=[];popup.currentMenuId=1;popup.registerMenu=function(b){var a=dom.walkSubtree(b,function(c){if(html.hasClass(c,"menuBody")){return c}});if(a){utils.addListener(b,"mouseover",popup.showMenuByEvent);utils.addListener(b,"mouseout",popup.startHidingMenuByEvent);b.menuBody=a;popup.registeredMenus.push(b)}};popup.showMenuByEvent=function(a){popup.showMenu(utils.getEventTarget(a))};popup.startHidingMenuByEvent=function(a){popup.startHidingMenu(utils.getEventTarget(a))};popup.hideAllMenus=function(a){for(i in popup.registeredMenus){var b=popup.registeredMenus[i];if(!a||b!=a){b.menuBody.style.visibility="hidden"}}};popup.showMenu=function(a){if(popup.hideMenuTimeout){clearTimeout(popup.hideMenuTimeout)}var c=dom.walkBranch(a,function(d){for(i in popup.registeredMenus){var e=popup.registeredMenus[i];if(e.menuBody==d){return d}}});if(c){return}var b=dom.walkBranch(a,function(d){for(i in popup.registeredMenus){var e=popup.registeredMenus[i];if(e==d){return d}}});popup.hideAllMenus();b.menuBody.style.visibility="visible";b.menuBody.style.left="0px";b.menuBody.style.top=b.offsetHeight+1+"px";b.menuBody.style.zIndex=utils.getAndIncrementMaxZIndex()};popup.startHidingMenu=function(a){popup.hideMenuTimeout=setTimeout("popup.hideAllMenus()",750)};popup.tooltipText=null;popup.tooltipTimeout=null;popup.registerTooltip=function(a,b){popup.initTooltipDiv();utils.addListener(a,"mousemove",function(c){popup.hideTooltip();if("string"==typeof b){var d=b}else{var d=b(c)}popup.tooltipText=d;popup.tooltipX=c.clientX;popup.tooltipY=c.clientY;popup.tooltipTimeout=setTimeout("popup.showTooltip()",500)});utils.addListener(a,"mouseout",function(c){popup.hideTooltip()})};popup.initTooltipDiv=function(){if(!dom.byId("tooltip")){var b=dom.createElement("div",{id:"tooltip"},{},"");var a=document.getElementsByTagName("body")[0];a.appendChild(b)}};popup.showTooltip=function(){var a=dom.byId("tooltip");a.style.visibility="visible";a.style.left=popup.tooltipX+20+"px";a.style.top=popup.tooltipY+"px";a.innerHTML=popup.tooltipText};popup.hideTooltip=function(){if(popup.tooltipTimeout){clearTimeout(popup.tooltipTimeout)}var a=dom.byId("tooltip");a.style.visibility="hidden"};