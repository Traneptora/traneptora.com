function getExpectancy(player, opponent){
	return 1.0 / (1.0 + Math.pow(10, (opponent - player) / 400.0));
}
function getTripleExpectancy(rating, o1, o2, o3){
	var r0s = [o1, o2, o3];
	return getMultiExpectancy(rating, r0s);
}
function getMultiExpectancy(rating, r0s){
	var e = 0.0;
	for (var i = 0; i < r0s.length; i++){
		e += getExpectancy(rating, r0s[i]);
	}
	return e;
}
function getNormExpectancy(rating, opponent){
	var delta = rating - opponent;
	if (delta <= -400){
		return 0;
	} else if (delta <= 0) {
		return 0.5 + delta / 800.0;
	} else if (delta <= 200) {
		return 0.5 + delta / 400.0;	
	} else {
		return 1;
	}
}
function getMultiNormExpectancy(rating, r0s){
	var e = 0.0;
	for (var i = 0; i < r0s.length; i++){
		e += getNormExpectancy(rating, r0s[i]);
	}
	return e;
}
function getTriplePerformance(score, o1, o2, o3){
	var r0s = [o1, o2, o3];
	return getPerformance(score, r0s);
}
function getPerformance(score, r0s){
	if (r0s.length == 0){
		return -400;
	} else if (score >= r0s.length){
		return Math.max.apply(null, r0s) + 400;
	} else if (score <= 0){
		return Math.min.apply(null, r0s) - 400;
	}
	var error = 100.0;
	var guess = 1;
	var minguess = 1;
	var maxguess = 1;
	while (getMultiExpectancy(maxguess, r0s) < score){
		maxguess *= 2;
	}
	while (true) {
		guess = 0.5 * (minguess + maxguess);
		var exp = getMultiExpectancy(guess, r0s);
		if (Math.abs(exp - score) < 0.0000001){
			return Math.round(guess);
		}
		if (exp < score){
			minguess = guess;
		} else {
			maxguess = guess;
		}
	}
}
function getNormCode(rating){
	switch (rating){
		case 2400:
		return "S";
		case 2200:
		return "M";
		case 2000:
		return "C";
		case 1800:
		return "1";
		case 1600:
		return "2";
		case 1400:
		return "3";
		case 1200:
		return "4";
		default:
		return "None"
	}
}
function getHighestNormEarned(score, r0s){
	if (r0s.length < 4){
		return "None";
	}
	for (var guess = 2400; guess >= 1200; guess -= 200){
		var exp = getMultiNormExpectancy(guess, r0s);
		if (score - exp > 1.0){
			return getNormCode(guess);
		}	
	}
	return "None";
}
function getN(rating){
	if (rating >= 2355){
		return 50.0;
	} else {
		return 50.0 / Math.sqrt(0.662 + 0.00000739 * (2569.0 - rating) * (2569.0 - rating));
	}
}
function getK(rating, m){
	if (rating >= 2500){
		return 200 / (getN(rating) + m);	
	} else if (rating > 2200){
		return 800 * (6.5 - 0.0025 * rating)/ (getN(rating) + m);	
	} else {
		return 800 / (getN(rating) + m);
	}
}
function getEstimatedPostEvent(rating, score, r0s){
	var exp = getMultiExpectancy(rating, r0s);
	var extra = getK(rating, r0s.length) * (score - exp);
	var bonus = 0.0;
	var mp = +Math.max(r0s.length, 4);
	const B = 14; // As of May 1, 2017
	if (r0s.length >= 3 && extra > B * Math.sqrt(mp)){
		bonus = extra - B * Math.sqrt(mp);
	}
	var newR = rating + extra + bonus;
	if (newR < 100){
		newR = 100;
	}
	if (newR > rating){
		return Math.ceil(newR);
	} else {
		return Math.floor(newR);	
	}
}

function quad_calcExpectancies(){
	var r0s = [0, 0, 0, 0];
	for (var j = 0; j < 4; j++){
		r0s[j] = +(document.getElementById("preevent"+j).value);
	}
	for (var i = 0; i < 4; i++){
		var exp = 0;
		for (var j = 0; j < 4; j++){
			if (j == i) continue;
			exp += getExpectancy(r0s[i], r0s[j]);
		}
		exp = +(Math.round(exp + "e+3")  + "e-3");
		document.getElementById("exp"+i).innerHTML = exp;
	}
}

function quad_calcPerformances(){
	var r0s = [0, 0, 0, 0];
	for (var j = 0; j < 4; j++){
		r0s[j] = +(document.getElementById("preevent"+j).value);
	}
	var s0s = [0, 0, 0, 0];
	for (var j = 0; j < 4; j++){
		s0s[j] = +(document.getElementById("score"+j).value);
	}
	document.getElementById("perf0").innerHTML = getTriplePerformance(s0s[0], r0s[1], r0s[2], r0s[3]);
	document.getElementById("perf1").innerHTML = getTriplePerformance(s0s[1], r0s[0], r0s[2], r0s[3]);
	document.getElementById("perf2").innerHTML = getTriplePerformance(s0s[2], r0s[0], r0s[1], r0s[3]);
	document.getElementById("perf3").innerHTML = getTriplePerformance(s0s[3], r0s[0], r0s[1], r0s[2]);
}

function quad_calcPostEvents(){
	var r0s = [0, 0, 0, 0];
	for (var j = 0; j < 4; j++){
		r0s[j] = +(document.getElementById("preevent"+j).value);
	}
	var s0s = [0, 0, 0, 0];
	for (var j = 0; j < 4; j++){
		s0s[j] = +(document.getElementById("score"+j).value);
	}
	var r1s = [0, 0, 0, 0];
	const B = 14; // As of May 1, 2017
	for (var i = 0; i < 4; i++){
		var exp = 0;
		for (var j = 0; j < 4; j++){
			if (i == j) continue;
			exp += getExpectancy(r0s[i], r0s[j]);
		}
		var extra = getK(r0s[i], 3) * (s0s[i] - exp);
		var bonus = Math.max(0, extra - 2 * B);
		r1s[i] = r0s[i] + extra + bonus;
		if (r1s[i] < 100){
			r1s[i] = 100;
		}
	}
	for (var i = 0; i < 4; i++){
		var exp = 0;
		for (var j = 0; j < 4; j++){
			if (i == j) continue;
			exp += getExpectancy(r0s[i], r1s[j]);
		}
		var extra = getK(r0s[i], 3) * (s0s[i] - exp);
		var bonus = Math.max(0, extra - 2 * B);
		var est = Math.round(r0s[i] + extra + bonus);
		if (est < 100){
			est = 100;
		}
		document.getElementById("est"+i).innerHTML = est;
	}
}

function quad_calculateEverything(){
	quad_calcExpectancies();
	quad_calcPerformances();
	quad_calcPostEvents();
}

function est_calculateExpAndPerf() {
	var r0s = [];
	for (var j = 0; j < 12; j++){
		var ra = +(document.getElementById("r"+j).value);
		if (!isNaN(ra) && ra != 0){
			r0s.push(ra);
		}
	}
	var rating = 1.0 * document.getElementById("rating").value;
	var exp = getMultiExpectancy(rating, r0s);
	document.getElementById("exp").innerHTML = +(Math.round(exp + "e+3") + "e-3");
	var score = 1.0 * document.getElementById("score").value;
	var perf = getPerformance(score, r0s);
	document.getElementById("perf").innerHTML = +(Math.round(perf + "e+3") + "e-3");
	var postevent = getEstimatedPostEvent(rating, score, r0s);
	document.getElementById("post").innerHTML = postevent;
	var norm = getHighestNormEarned(score, r0s);
	document.getElementById("norm").innerHTML = norm;
	var kfactor = getK(rating, r0s.length);
	document.getElementById("kfactor").innerHTML = +(Math.round(kfactor + "e+3") + "e-3");
}
