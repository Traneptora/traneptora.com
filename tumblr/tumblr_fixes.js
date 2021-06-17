/**
 * This registers a function to be executed on all completely-loaded iframes.
 * Any filtering on relevant targets should be done inside the executed function.
 */
function registerIFrameLoadFunction(fn) {
    document.addEventListener("DOMContentLoaded", function(){
		var iframes = document.getElementsByTagName("iframe");
		for (var i = 0; i < iframes.length; i++){
		    var iframe = iframes[i];
		    iframe.addEventListener("load", fn);
		}
	});
}

function tumblrFixes(){
	var divs = document.getElementsByTagName("div");
	for (var i = 0; i < divs.length; i++){
		var div = divs[i];
		if (div.classList.contains("media-button") && div.classList.contains("media-killer") && div.classList.contains("icon_close")){
			if (div.parentElement.nextElementSibling){
				div.parentElement.parentElement.removeChild(div.parentElement.nextElementSibling);
			}
			div.parentElement.removeChild(div);
		}
	}
	var figures = document.getElementsByTagName("figure");
	for (i = 0; i < figures.length; i++) {
		if (figures[i].className.toLowerCase() === "tmblr-full"){
			figures[i].style.margin = "1.5px -10px -20px -10px";
		}
	}
}

document.addEventListener("DOMContentLoaded", tumblrFixes);
