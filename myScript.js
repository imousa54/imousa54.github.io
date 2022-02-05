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