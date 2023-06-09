const axios = require("axios");
const fs = require("fs");
const path = require("path");

const listPlugins = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "plugins", "pluginList.json")));
const configBot = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "udata", "config.json")));
const iso639_1 = configBot.bot_info.lang.split("_")[0];

console.log(iso639_1);

// async function getList(n) {
// 	var l = await axios({url: `https://raw.githubusercontent.com/VangBanLaNhat/Package-for-Y2TB_Bot/main/Plugin/PluginInfo.json`})

// 	return l.data;
// }

async function getList(n, m) {
	let l = await axios({ url: `https://raw.githubusercontent.com/VangBanLaNhat/Y2TB-data/main/PluginInfo.json` })
	n = !n?n+1:n;
	let plugin = l.data;
	let total = [];
	let max = 10;
	max = m ? m : max;
	let pages = Math.ceil(plugin.length / max);
	let length = plugin.length;
  
	let start = Math.ceil(plugin.length / pages) * (n - 1);
	let end = Math.ceil(plugin.length / pages) * n - 1;
	end = end < length - 1 ? end : length - 1;
  
	for (let i = start; i <= end; i++) {
	  total.push({
		file: plugin[i].file,
		author: plugin[i].author,
		vi: plugin[i].vi,
		en: plugin[i].en,
		ver: plugin[i].ver,
	  });
	}
	return {
	  status: {
	    total: length,
	    pages: pages,
	    max: (!m ? max : m),
	    data: total
	  }
	};
}

var apid = [];
var datajs;

async function loadPage(n) {
	console.log(n);
	var data = await getList(n);
	datajs = data;
	var lenghtPage = data.status.pages;
	var lp = document.querySelector(".pageList");
	lp.innerHTML = "";
	apid.length = 0;
	for (let i = 1; i<=lenghtPage; i++){
		lp.innerHTML += `<a class="page" id="page${i}">${i}</a>`
		apid.push(`page${i}`)
		
	}
	document.querySelector(`#page${n}`).classList.add("active");
	loadPlugin(data.status.data)
}
var adv, ade, aist, ains, ainp;
adv = [];
ade = [];
aist = [];
ains = [];
ainp = [];

 function loadPlugin(data) {
	var ct = document.querySelector(".content");
	ct.innerHTML = "";
	var c = 0;
	for (let i of data) {
		c++;
		ct.innerHTML += `<div class="plugin" id="pl${c}"><h2 class="pluginName" id="pln${c}">${i.file}</h2>
        <div class="info_install">
          <a class="pluginAuth">Creator: <a class="plath" id="plath${c}">${i.author}</a></a>
          <br><a class="pluginDesc" id="pld${c}">Description: <a class="pldcen" id="pldcen${c}">${i.en}</a><a class="pldcvi" id="pldcvi${c}">${i.vi}</a></a>
        </div>
        <a class="btn-ist" id="btn-ist${c}">Install</a>
        <a class="btn-amt btn-install" id="btn-ipl${c}" style="--clr:#00ccff"><span id="sp-ipl${c}">Install</span></a>
      </div>`
	}
	adv.length = 0;
	ade.length = 0;
	aist.length = 0;
	ains.length = 0;
	ainp.length = 0;
	for (let i = 1; i <= c; i++){
		adv.push(`pldcvi${i}`);
		ade.push(`pldcen${i}`);
		aist.push(`btn-ist${i}`)
		ainp.push([`btn-ipl${i}`, `sp-ipl${i}`])
	}
	for (let i = 1; i <= c; i++) {
		let id = document.getElementById("btn-ipl"+i);

		document.getElementById("btn-ist"+i).style.display = "none";
		//id.style.display = "none";
		document.getElementById("pldcen"+i).style.display = "none";
		document.getElementById("pldcvi"+i).style.display = "none";
		document.getElementById("pldc"+iso639_1+i).style = "";
		//console.log(listPlugins[document.querySelector(`#pln${i}`).innerHTML])
		if(listPlugins[document.querySelector(`#pln${i}`).innerHTML]){
			document.querySelector(`#btn-ist${i}`).innerHTML = "Uninstall"
			document.getElementById(`btn-ipl${i}`).classList.add("btn-uins");
			document.querySelector(`#sp-ipl${i}`).innerHTML = "Uninstall";
		}
	}
	ct.innerHTML += "<br><br>"
}


loadPage(1).then(loadScript);

function loadScript(){
	for(let i in ade){
		document.getElementById(ade[i]).onclick = function(){
			document.getElementById(adv[i]).style = "";
      		document.getElementById(ade[i]).style.display = "none";
		}
		document.getElementById(adv[i]).onclick = function(){
			document.getElementById(ade[i]).style = "";
      		document.getElementById(adv[i]).style.display = "none";
		}
		document.getElementById(ainp[i][0]).onclick = function(){
			var isIns = document.querySelector("#"+aist[i]).innerHTML;
			if(isIns == "Install"){
				//document.getElementById(`btn-ipl${Number(i)+1}`).style.display = "flex";
				//document.querySelector(`#sp-ipl${Number(i)+1}`).innerHTML = "Installing";
				//console.log(datajs.status.data.indexOf(document.querySelector(`#pln${Number(i)+1}`)))
				for (var z of datajs.status.data) {
					if(z.file == document.querySelector(`#pln${Number(i)+1}`).innerHTML){
						var ver = z.ver;
						break;
					}
				}
				listPlugins[document.querySelector(`#pln${Number(i)+1}`).innerHTML] = ver;
				fs.writeFileSync(path.join(__dirname, "..", "..", "plugins", "pluginList.json"), JSON.stringify(listPlugins), {encoding: "utf8"});
				//document.getElementById(aist[i]).style = "";
				//document.getElementById(`btn-ipl${Number(i)+1}`).style.display = "none";
				document.querySelector("#"+aist[i]).innerHTML = "Uninstall";
				document.querySelector("#"+ainp[i][1]).innerHTML = "Uninstall";
				document.getElementById(ainp[i][0]).classList.add("btn-uins");
			} else {
				delete listPlugins[document.querySelector(`#pln${Number(i)+1}`).innerHTML];
				fs.writeFileSync(path.join(__dirname, "..", "..", "plugins", "pluginList.json"), JSON.stringify(listPlugins), {encoding: "utf8"});
				document.querySelector("#"+aist[i]).innerHTML = "Install";
				document.getElementById(ainp[i][0]).classList.remove("btn-uins");
				document.querySelector("#"+ainp[i][1]).innerHTML = "Install";
			}
		}
	}
	console.log(apid)
	for(let i in apid){
		document.getElementById(apid[i]).onclick = function (){
			loadPage(Number(i)+1).then(loadScript)
		}
	}
}