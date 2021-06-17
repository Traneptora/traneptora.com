function fixBlockQuote(bq){
	var ptag = bq.previousElementSibling;
	while (ptag && ptag.tagName.toLowerCase() === "xkit"){
		ptag = ptag.previousElementSibling;
	}
	if (ptag && ptag.firstElementChild){
		var atag = ptag.firstElementChild;
		
		if (atag && atag.tagName.toLowerCase() === "a") {
			var uname = atag.innerHTML; 
			var mat = atag.href.match(/^https?:\/\/(.*)\.tumblr\.com\/post\//);
			if (mat && mat[1] && uname === mat[1]){
				if (!atag.classList.contains("tumblr_blog")){
					atag.classList.add("tumblr_blog");
				}
				bq.style.borderBottom = "1px solid #000000";
				if (bq.parentElement.tagName.toLowerCase() === "blockquote"){
					fixBlockQuote(bq.parentElement);
					var el = bq.parentElement.parentElement;
					var par = bq.parentElement;
					var toIns = par.previousElementSibling;
					while (toIns.tagName.toLowerCase() === "xkit"){
						toIns = toIns.previousElementSibling;					
					}
					var first = ptag;
					var second = bq;
					el.insertBefore(second, toIns);
					if (first){
						el.insertBefore(first, second);
					}
					return true;
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
	} else {
		return false;
	}
}
document.addEventListener("DOMContentLoaded", function(){
	var found = true;
	do {
		found = false;
		var blockQuotes = document.getElementsByTagName("blockquote");

		for (var i = 0; i < blockQuotes.length; i++){
			var bq = blockQuotes[i];
			if (fixBlockQuote(bq)){
				found = true;
			}
		}
	} while (found);
});

