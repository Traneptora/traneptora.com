var fixNotes;
    
fixNotes = function(){
	
	function isGreater(user1, userfrom1, user2, userfrom2, user1level, user2level){
		if (userfrom2 == "thebombzen" && user2 == "thebombzen"){
			return false;
		} if (userfrom1 == "thebombzen" && user1 == "thebombzen"){
			return true;
		} else if (userfrom2 == "thebombzen" && userfrom1 != "thebombzen"){
			return false;
		} else if (userfrom1 == "thebombzen" && userfrom2 != "thebombzen"){
			return true;
		} else if (user1 == userfrom2 && user1 != userfrom1){
			return true;
		} else if (user2 == userfrom1 && user2 != userfrom2){
			return false;
		} else if (user1level > user2level){
			return false;
		} else if (user2level > user1level){
			return true;
		} else if (userfrom1 != userfrom2){
			if (userfrom1.localeCompare(userfrom2) > 0){
				return true;
			} else if (userfrom1.localeCompare(userfrom2) < 0){
				return false;
			}
		} else {
			return false;
		}
	}


	var childLIs = document.getElementById("post-notes").getElementsByTagName("li");

	var levels = [];
	var userLevels = {};
	var foundOrig = false;
	for (var i = childLIs.length - 1; i >= 0; i--){
	    if (childLIs[i].innerHTML.match(/posted this/)){
    		var userFrom = childLIs[i].getElementsByTagName("span")[0].lastElementChild.innerHTML;
    		userLevels[userFrom] = 0;
    		foundOrig = true;
    		continue;
	    }
		if (!childLIs[i].innerHTML.match(/reblogged this from/)){
		    continue;
		}
		var userFrom = childLIs[i].getElementsByTagName("span")[0].lastElementChild.innerHTML;
		var user = childLIs[i].getElementsByTagName("span")[0].firstElementChild.innerHTML;
		if (userLevels[userFrom] == undefined){
		    userLevels[userFrom] = foundOrig ? 1 : 0;
		}
	    userLevels[user] = userLevels[userFrom] + 1;
		levels[i] = userLevels[user];
	}

	
	for (var i = 0; i < childLIs.length; i++){
			if (!childLIs[i].innerHTML.match(/reblogged this from/)){
		    continue;
		}
		var user = childLIs[i].getElementsByTagName("span")[0].firstElementChild.innerHTML;
		var div;
		if (childLIs[i].firstElementChild.className == "levelspecifier"){
			div = childLIs[i].firstElementChild;
		} else {
			div = document.createElement("div");
			div.className = "levelspecifier";
			div.style.float = "left";
			div.style.paddingRight = "5px";
			childLIs[i].insertBefore(div, childLIs[i].firstElementChild); 
		}
		div.innerHTML = levels[i];
	}	
}

var observer = new MutationObserver(function(mutations, observer) {
    fixNotes();
});

observer.observe(document.getElementById("post-notes").getElementsByTagName("ol")[0], {childList: true});

fixNotes();

