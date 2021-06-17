document.addEventListener("DOMContentLoaded", function(){
	var popupURL = "/images/konami_code.png";
	var battler = document.createElement("div");
	battler.style.position = "fixed";
	battler.style.zIndex = 1;
	battler.style.width = "100%";
	battler.style.margin = "0 0 0 -50%";
	battler.style.left = "50%";
	battler.style.visibility = "hidden";
	battler.style.textAlign = "center";
	battler.style.top = "15%";
	battler.innerHTML = '<img src="' + popupURL + '">';
	battler.onclick = function() {
		battler.style.visibility = 'hidden';
	}
	document.body.appendChild(battler);
	var codeStage = 0;
	document.onkeydown = function(e) {
		e = e || window.event;
		switch (codeStage) {
		    case 0:
		    case 1:
		        if (e.keyCode == 38) {
		            // up
		            codeStage++;
		        } else {
		            codeStage = 0;
		        }
		        break;
		    case 2:
		    case 3:
		        if (e.keyCode == 40) {
		            //down
		            codeStage++;
		        } else {
		            codeStage = 0;
		        }
		        break;
		    case 4:
		    case 6:
		        if (e.keyCode == 37) {
		            // left
		            codeStage++;
		        } else {
		            codeStage = 0;
		        }
		        break;
		    case 5:
		    case 7:
		        if (e.keyCode == 39) {
		            // right
		            codeStage++;
		        } else {
		            codeStage = 0;
		        }
		        break;
		    case 8:
		        if (e.keyCode == 66) {
		            // b
		            codeStage++;
		        } else {
		            codeStage = 0;
		        }
		        break;
		    case 9:
		        if (e.keyCode == 65) {
		            // a
		            codeStage = 0;
		            battler.style.visibility = 'visible';
		        } else {
		            codeStage = 0;
		        }
		        break;
		    default:
		        codeStage = 0;
		        break;
		}
	}
});

