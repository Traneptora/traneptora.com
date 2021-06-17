document.addEventListener("DOMContentLoaded", function(){
	var p = document.createElement("p");
	p.innerHTML = 'Website designed and programmed entirely by me. <i>Open Sans</i> typeface Copyright Google Inc.';
	var p2 = document.createElement("p");
	p2.innerHTML = '<a href="#">Back to Top</a><div class="spacer" style="width: 30px;"></div><a href="/">Home Page</a>';
	p2.className = "rightalignedline";
	var p3 = document.createElement("p");
	p3.innerHTML = "&nbsp;";
	p.style.clear = "both";
	document.getElementById("footer").insertBefore(p, document.getElementById("footer").firstChild);
	document.getElementById("footer").insertBefore(p2, p.nextSibling);
	document.getElementById("footer").insertBefore(p3, p2.nextSibling);
	
	var iconLink = document.createElement("link");
	iconLink.rel = "icon";
	iconLink.href = "/images/favicon.ico";	
	
	document.getElementsByTagName("head")[0].appendChild(iconLink);
});

