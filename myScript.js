function checkURLOnPageLoad() {
	let queryString = window.location.search;
	let urlParams = new URLSearchParams(queryString);
	let part = urlParams.get('part');
	let partNumber = Number(part);
	if (part && partNumber && partNumber >= 1 && partNumber <= 16 & partNumber != 11) {
		console.log(document.getElementById('part'+part));
		selectPart(document.getElementById('part'+part), part);
	}
}

window.onload = checkURLOnPageLoad;

function selectPart(source, n) {
	changeListStyle(source);
	document.getElementById('partsdata').src = "parts/part_"+n+"/index.html";
}

function changeListStyle(source) {
	var x = document.getElementById("menulist").getElementsByTagName("li");
	for (let i = 0; i < x.length; i++) {
	  x[i].className = 'menuitem';
	}
	source.className = 'selectedmenuitem';
}
