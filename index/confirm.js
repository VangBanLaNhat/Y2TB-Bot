var ipc = require("electron").ipcRenderer;

const msg = document.querySelector('.msg');

let dataSend;


ipc.on("confirm", (event, data)=>{
	dataSend = data;
	msg.innerHTML = data.msg;
})

$(document).ready(function (e) {
	$('.btn').on('mouseenter', function(e){
		x = e.pageX - $(this).offset().left;
		y = e.pageY - $(this).offset().top;
		$(this).find('span').css({top:y, left:x})
	})
	$('.btn').on('mouseout', function(e){
		x = e.pageX - $(this).offset().left;
		y = e.pageY - $(this).offset().top;
		$(this).find('span').css({top:y, left:x})
	})
})

const ok = document.querySelector('.btn-okk');
ok.onclick = function () {
	ipc.send("confirm.return", {
		accept: true,
		from: dataSend.type
	});
}

const cancel = document.querySelector('.btn-cancel');
cancel.onclick = function () {
	ipc.send("confirm.return", {
		accept: false,
		from: dataSend.type
	});
}

//ipc.on("confirm.msg", (event, data)=>{})