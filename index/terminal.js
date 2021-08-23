var term = new Terminal();
term.open(document.getElementById("terminal"));
term.write("lol");
term.onData(e => {
	term.write(e);
})