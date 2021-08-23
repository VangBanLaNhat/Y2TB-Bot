document.getElementById('content').style.display= 'none';
document.getElementById('header').style.display= 'none';
document.getElementById('footer').style.display= 'none';
setTimeout(function(){
    document.getElementById('onload').style.display= 'none';
    document.getElementById('content').style.position= 'relative';
    document.getElementById('content').style.display= 'block';
    document.getElementById('header').style.display= 'flex';
    document.getElementById('footer').style.display= 'flex';
}, 5.5*1000*1)
//gnr setting tab
const gnr = document.querySelector('header #gnr')
document.getElementById('gnr').style.background= '#29282d';
document.getElementById('gnr').style.color= 'cyan';
document.getElementById('avcct').style.display= 'none';
document.getElementById('gnrct').style.display= 'block';

gnr.onclick = function () {
    document.getElementById('gnr').style.background= '#29282d';
    document.getElementById('gnr').style.color= 'cyan';
    document.getElementById('avc').style.background= 'none';
    document.getElementById('avc').style.color= '#fff';
    document.getElementById('tmn').style.background= 'none';
    document.getElementById('tmn').style.color= '#fff';
    document.getElementById('gnrct').style.display= 'block';
    document.getElementById('avcct').style.display= 'none';
    document.getElementById('tmnct').style.display= 'none';
    document.getElementById('footer').style.display= 'flex';
}
//document.getElementById('footer').style.display= 'none';


//avc setting tab
const avc = document.querySelector('header #avc')
avc.onclick = function () {
    document.getElementById('gnr').style.background= 'none';
    document.getElementById('gnr').style.color= '#fff';
    document.getElementById('avc').style.background= '#29282d';
    document.getElementById('avc').style.color= 'cyan';
    document.getElementById('tmn').style.background= 'none';
    document.getElementById('tmn').style.color= '#fff';
    document.getElementById('gnrct').style.display= 'none';
	document.getElementById('avcct').style.display= 'block';
    document.getElementById('tmnct').style.display= 'none';
    document.getElementById('footer').style.display= 'flex';
}


//terminal tab
const tmn = document.querySelector('header #tmn')
tmn.onclick = function () {
    document.getElementById('gnr').style.background= 'none';
    document.getElementById('gnr').style.color= '#fff';
    document.getElementById('avc').style.background= 'none';
    document.getElementById('avc').style.color= '#fff';
    document.getElementById('tmn').style.background= '#29282d';
    document.getElementById('tmn').style.color= 'cyan';
    document.getElementById('gnrct').style.display= 'none';
    document.getElementById('avcct').style.display= 'none';
    document.getElementById('tmnct').style.display= 'block';
    document.getElementById('footer').style.display= 'none';
}
//show/hide password
const show = document.querySelector('#showpass')
document.getElementById('hidepass').style.display="none";
document.getElementById('hidepassa').style.display="none";
show.onclick = function () {
    document.getElementById('fbpass').type="text"
    document.getElementById('hidepass').style.display= "flex";
    document.getElementById('showpass').style.display="none";
    document.getElementById('showpassa').style.display="none";
    document.getElementById('hidepassa').style.display="flex";
}
var hide = document.querySelector('#hidepass')
hide.onclick = function () {
    document.getElementById('fbpass').type="password"
    document.getElementById('hidepass').style.display= "none";
    document.getElementById('showpass').style.display="flex";
    document.getElementById('showpassa').style.display="flex";
    document.getElementById('hidepassa').style.display="none";
}
//checkbox
var checkboxd = document.querySelector('#cb1')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[0].checked == false){
        document.getElementsByName('cb')[0].checked = true
    }
    else{
        document.getElementsByName('cb')[0].checked = false
    }
}

var checkboxd = document.querySelector('#cb2')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[1].checked == false){
        document.getElementsByName('cb')[1].checked = true
    }
    else{
        document.getElementsByName('cb')[1].checked = false
    }
}

var checkboxd = document.querySelector('#cb3')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[2].checked == false){
        document.getElementsByName('cb')[2].checked = true
    }
    else{
        document.getElementsByName('cb')[2].checked = false
    }
}

var checkboxd = document.querySelector('#cb4')
checkboxd.onclick = function () {
    if(document.getElementsByName('cb')[3].checked == false){
        document.getElementsByName('cb')[3].checked = true
    }
    else{
        document.getElementsByName('cb')[3].checked = false
    }
}