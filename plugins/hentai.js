var tagsPerPage = 20;
var randomPostForSearchTags = 3;
var newPostForNew = 3;
var relatedPostForSearch = 3;

var TYPE = {
	j: '.jpg',
	p: '.png',
	g: '.gif'
};
var doujinPageLimit = 40;
var popularDoujin = 3;
var newDoujin = 3;
var relatedDoujin = 3;
var tagsPage = 20;
var randomDoujinForSearchTags = 3;

/*
"/wp/v2": "API help",
"/wp/v2/posts": "list phim tren trang chu"
"/wp/v2/posts/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/posts/1218"
"/wp/v2/pages":"list tus tren trang chu"
"/wp/v2/pages/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/pages/7002"
"/wp/v2/media": "file anh? nah co moi logo hentaiz lmao"
"/wp/v2/media/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/media/18"
"/wp/v2/types": "idk..."
"/wp/v2/types/(?P<type>[\\w-]+)": "https://hentaiz.top/wp-json/wp/v2/types/attachment"
"/wp/v2/categories": "the loai :>>>"
"/wp/v2/categories/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/categories?per_page=100&page=1"
"/wp/v2/tags": "tim anh em cua bo truyen hoac check ten bo truyen"
"/wp/v2/tags/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/tags/1220"
"/wp/v2/studio": "tim studio, studio data"
"/wp/v2/studio/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/studio/1727"
"/wp/v2/series": "tim series truyen"
"/wp/v2/series/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/series/1628"
"/wp/v2/release_year": "bo truyen theo nam"
"/wp/v2/release_year/(?P<id>[\\d]+)": "https://hentaiz.top/wp-json/wp/v2/release_year/2108"
"/wp/v2/search": "dung de tim kiem :>>>"
*/
//https://nhentai.net/api/gallery/"ID"
//https://i.nhentai.net/galleries/"MediaID"/"page""type"
//https://t5.nhentai.net/galleries/"MediaID"/thumb"type"
//https://t7.nhentai.net/galleries/"MediaID"/thumb"type"

async function init(){
	!global.data.hentai ? global.data.hentai = {
		tags: {},
		doujin: {}
	}: "";
	delete global.data.hentai.tags;
	delete global.data.hentai.doujin;
	!global.data.hentai.tags ? global.data.hentai.tags = {}: "";
	!global.data.hentai.doujin ? global.data.hentai.doujin = {}: "";
	var res = await getdata(`https://hentaiz.top/wp-json/wp/v2/categories?per_page=100`);
	!global.data.hentai.tags.res ? global.data.hentai.tags.res = []: "";
	res.forEach(x => {
		global.data.hentai.tags.res.push({
			id: x.id,
			name: x.name,
			count: x.count,
			desc: x.description,
			slug: x.slug,
		})
	});
	global.data.hentai.tags.pages = [];
	global.data.hentai.tags.names = [];
	global.data.hentai.tags.slugs = [];
	var i = 0;
	var count = 0;
	var count1 = 0;
	while(count1 < res.length){
		!global.data.hentai.tags.pages[i] ? global.data.hentai.tags.pages[i] = [] : "";
		global.data.hentai.tags.pages[i].push({
			id: res[count1].id,
			name: res[count1].name,
			desc: res[count1].description != "" ? res[count1].description : "Search google thử đi :>>"
		});
		if(count == tagsPerPage - 1){
			count = 0;
			i++;
		}
		else {
			count++;
			count1++;
		}
	}
	for(i=0;i<res.length;i++){
		global.data.hentai.tags.names.push(res[i].name);
		global.data.hentai.tags.slugs.push(res[i].slug.replace("-", " "));
	}
	global.data.hentai.doujin.main = (await gethref("https://nhentai.net/")).filter(x => x.slice(0, 3) == "/g/");
	var tags = [];
	for(i=0;i<3;i++){
		var res = (await gethref(`https://nhentai.net/tags/popular?page=${i + 1}`)).filter(x => x.slice(0, 5) == "/tag/").map(x => x.slice(5, x.length - 1).replaceAll("-", " "));
		tags = tags.concat(res);
	}
	global.data.hentai.doujin.pages = [];
	var i = 0;
	var count = 0;
	var count1 = 0;
	while(count1 < tags.length){
		!global.data.hentai.doujin.pages[i] ? global.data.hentai.doujin.pages[i] = [] : "";
		global.data.hentai.doujin.pages[i].push(tags[count1]);
		if(count == tagsPage - 1){
			count = 0;
			i++;
		}
		else {
			count++;
			count1++;
		}
	}
    return{
        "pluginName": "Hentai",
        "pluginMain": "hentai.js",
        "commandList": {
			"hentaiztags": {
                "help": {
                    "vi_VN": "[trang]",
                    "en_US": "[page]"
                },
                "tag": {
                    "vi_VN": "Tags trên Hentaiz",
                    "en_US": "Tags on Hentaiz"
                },
                "mainFunc": "hentaiz_tags"
            },
			"hentaizposts": {
                "help": {
                    "vi_VN": "<ID truyện>",
                    "en_US": "<story ID>"
                },
                "tag": {
                    "vi_VN": "Truyện trên Hentaiz",
                    "en_US": "Stories on Hentaiz"
                },
                "mainFunc": "hentaiz_posts"
            },
			"hentaizsearch": {
                "help": {
                    "vi_VN": "<Tên>",
                    "en_US": "<Name>"
                },
                "tag": {
                    "vi_VN": "Tìm truyện trên Hentaiz",
                    "en_US": "Find stories on Hentaiz"
                },
                "mainFunc": "hentaiz_search"
            },
			"hentaizrandom": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Random truyện trên Hentaiz",
                    "en_US": "Random stories on Hentaiz"
                },
                "mainFunc": "hentaiz_random"
            },
			"hentaiznew": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Truyện mới nhất trên Hentaiz",
                    "en_US": "Newest stories on Hentaiz"
                },
                "mainFunc": "hentaiz_new"
            },
			"hentaizcrawl": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Cào ảnh trên kho ảnh Hentaiz",
                    "en_US": "Crawl image from Hentaiz's storage"
                },
                "mainFunc": "hentaiz_crawl"
            },
			"nhentaiposts": {
                "help": {
                    "vi_VN": "<ID doujin>",
                    "en_US": "<ID doujin>"
                },
                "tag": {
                    "vi_VN": "Thông tin của doujin trên Nhentai",
                    "en_US": "Doujin's info on Nhentai"
                },
                "mainFunc": "nhentai_posts"
            },
			"nhentairead": {
                "help": {
                    "vi_VN": "<ID doujin>",
                    "en_US": "<ID doujin>"
                },
                "tag": {
                    "vi_VN": "Đọc doujin trên Nhentai",
                    "en_US": "Read doujin on Nhentai"
                },
                "mainFunc": "nhentai_read"
            },
			"nhentaipopular": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Doujin phổ biến trên Nhentai",
                    "en_US": "Popular doujin on Nhentai"
                },
                "mainFunc": "nhentai_popular"
            },
			"nhentainew": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Doujin mới nhất trên Nhentai",
                    "en_US": "Newest doujin on Nhentai"
                },
                "mainFunc": "nhentai_new"
            },
			"nhentaisearch": {
                "help": {
                    "vi_VN": "<Tên>",
                    "en_US": "<Name>"
                },
                "tag": {
                    "vi_VN": "Tìm kiếm doujin trên Nhentai",
                    "en_US": "Find doujin on Nhentai"
                },
                "mainFunc": "nhentai_search"
            },
			"nhentairandom": {
                "help": {
                    "vi_VN": "",
                    "en_US": ""
                },
                "tag": {
                    "vi_VN": "Random doujin trên Nhentai",
                    "en_US": "Random doujin on Nhentai"
                },
                "mainFunc": "nhentai_random"
            },
			"nhentaitags": {
                "help": {
                    "vi_VN": "[trang]",
                    "en_US": "[page]"
                },
                "tag": {
                    "vi_VN": "Tags trên Nhentai",
                    "en_US": "Tags on Nhentai"
                },
                "mainFunc": "nhentai_tags"
            }
        },
        "nodeDepends":{
            "puppeteer-extra": "",
			"puppeteer-extra-plugin-stealth": "",
			"random-useragent": "",
			"he": "",
			"cherio": "",
			"axios": ""
        },
        "langMap":{
            "notInbox":{
                "desc": "lang khi bot nhận lệnh devupload mà không phải trong inbox với bot",
                "vi_VN": "Hãy sử dụng lệnh trong inbox của bot để tránh lộ thông tin đăng nhập!",
                "en_US": "Please inbox bot to use this command to avoid account leaks!",
                "args": {}
            }
		},
        "author": "HyTommy",
        "version": "0.0.1"
    }
}

async function hentaiz_tags (data, api){
	var htmlDecode = require("he");
	var axios = require("axios");
	var page;
	data.body != "" && data.body != " " ? page = data.body : page = "1";
	if(isNaN(page) || page.indexOf(".") != -1){
		page = removeVietnameseTones(page);
		var x = findBestMatch(page, global.data.hentai.tags.names);
		var y = findBestMatch(page, global.data.hentai.tags.slugs);
		var z;
		if(x.bestMatch.rating <= 0.3 && y.bestMatch.rating <= 0.3) return api.sendMessage("Không tìm thấy tag!", data.threadID, data.messageID)
		x.bestMatch.rating > y.bestMatch.rating ? z = x : z = y;
		var res2 = await getdata(`https://hentaiz.top/wp-json/wp/v2/posts?categories=${global.data.hentai.tags.res[z.bestMatchIndex].id}&per_page=100`);
		var random = [];
		for(i=0;i<randomPostForSearchTags;i++){
			var eng;
			eng = Math.floor(Math.random() * res2.length);
			while (random.indexOf(eng) != -1){
				eng = Math.floor(Math.random() * res2.length);
			}
			random.push(eng);
		}
		var imagelinks = [];
		for(i=0;i<random.length;i++){
			var link = await getimage(res2[random[i]].link, "img");
			imagelinks.push(link[1]);
		};
		var filename = [];
		imagelinks.forEach((x) => {
			filename.push(axios({
				url: x,
				method: "GET",
				responseType: "stream",
				headers: {
					'Content-Type': 'application/json'
				}
			}));
		});
		var filename = (await Promise.all(filename)).map(x => x.data);
		var str  = `${global.data.hentai.tags.names[z.bestMatchIndex]}\n  - ${global.data.hentai.tags.res[z.bestMatchIndex].desc}\n  - Số bộ truyện hiện có: ${global.data.hentai.tags.res[z.bestMatchIndex].count}\n  - Một số truyện thuộc thể loại này:`;
		for(i=0;i<randomPostForSearchTags;i++){
			str += `\n    + ${htmlDecode.decode(res2[random[i]].title.rendered)} (ID: ${res2[random[i]].id})`;
		}
		api.sendMessage({
			body: str,
			attachment: filename
		}, data.threadID, data.messageID);
	}
	else {
		var str = "Các tags:\n";
		for(i=0;i<global.data.hentai.tags.pages[page - 1].length;i++){
			str += `${global.data.hentai.tags.pages[page - 1][i].name}:\n  - ${global.data.hentai.tags.pages[page - 1][i].desc}\n\n`;
		};
		str += `\nTrang ${page}/${global.data.hentai.tags.pages.length}`;
		api.sendMessage(str, data.threadID, data.messageID);
	}
}	

async function hentaiz_posts (data, api){
	var htmlDecode = require("he");
	var axios = require("axios");
	if(data.body == "") return api.sendMessage("Thiếu ID!", data.threadID, data.messageID);
	var res = await getdata(`https://hentaiz.top/wp-json/wp/v2/posts/${data.body}`);
	if(res.data != undefined) return api.sendMessage(`Không tồn tại bộ truyện với ID này!`, data.threadID, data.messageID);
	var str = `${htmlDecode.decode(res.title.rendered)}\n`;
	if(res.categories.length != 0){
		var category = [];
		global.data.hentai.tags.res.forEach(x => { 
			if(res.categories.indexOf(x.id) != -1) category.push(x.name);
		});
		str += `  - Thể loại: ${category.join(", ")}\n`;
	}
	if(res.studio.length != 0){
		var studio = [];
		for(i=0;i<res.studio.length;i++){
			var res2 = await getdata(`https://hentaiz.top/wp-json/wp/v2/studio/${res.studio[i]}`);
			studio.push(htmlDecode.decode(res2.name));
		}
		str += `  - Tác giả: ${studio.join(", ")}\n`;
	}
	if(res.release_year.length != 0){
		var release_year = [];
		for(i=0;i<res.release_year.length;i++){
			var res2 = await getdata(`https://hentaiz.top/wp-json/wp/v2/release_year/${res.release_year[i]}`);
			release_year.push(htmlDecode.decode(res2.name));
		}
		str += `  - Năm sáng tác: ${release_year.join(", ")}\n`;
	}
	if(res.tags.length != 0){
		str += `  - Một số bộ truyện liên quan:\n`
		for(i=0;i<res.tags.length;i++){
			var res2 = await getdata(`https://hentaiz.top/wp-json/wp/v2/tags/${res.tags[i]}`);
			str += `    + ${htmlDecode.decode(res2.name)} (ID: ${res2.id})\n`
		}
	}
	str += `  - Miêu tả: ${removeHTMLTags(htmlDecode.decode(res.content.rendered))}`
	var link = await getimage(res.link, "img");
	var filename = [
		axios({
			url: link[1],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		})
	];
	var filename = (await Promise.all(filename)).map(x => x.data);
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
	
}

async function hentaiz_search (data, api){
	var htmlDecode = require("he");
	var axios = require("axios");
	var args = data.body;
	var res = await getdata(`https://hentaiz.top/wp-json/wp/v2/posts?search=${args}&per_page=${relatedPostForSearch}`);
	var str = "Có phải bạn đang tìm kiếm:\n\n";
	var imagelinks = [];
	for(i=0;i<res.length;i++){
		var imagelink = await getimage(res[i].link, "img");
		imagelinks.push(imagelink[1]);
	}
	for(i=0;i<res.length;i++){
		str += `${i + 1}. ${htmlDecode.decode(res[i].title.rendered)} (ID: ${res[i].id})\n  - ${removeHTMLTags(htmlDecode.decode(res[i].content.rendered))}\n\n`;
	}
	var filename = [];
	imagelinks.forEach((x) => {
		filename.push(axios({
			url: x,
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	var filename = (await Promise.all(filename)).map(x => x.data);
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function hentaiz_random (data, api){
	var htmlDecode = require("he");
	var axios = require("axios");
	var res = await getdata("https://hentaiz.top/wp-json/wp/v2/posts?per_page=100");
	var post = res[Math.floor(Math.random() * res.length)];
	var str = `${htmlDecode.decode(post.title.rendered)} (ID: ${post.id})\n  - ${removeHTMLTags(htmlDecode.decode(post.content.rendered))}\n\n`;
	var link = await getimage(post.link, "img");
	var filename = [
		axios({
			url: link[1],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		})
	];
	var filename = (await Promise.all(filename)).map(x => x.data);
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function hentaiz_new (data, api){
	var htmlDecode = require("he");
	var axios = require("axios");
	var res = await getdata(`https://hentaiz.top/wp-json/wp/v2/posts?per_page=${newPostForNew}`);
	var str = "";
	var imagelinks = [];
	for(i=0;i<res.length;i++){
		var imagelink = await getimage(res[i].link, "img");
		imagelinks.push(imagelink[1]);
	}
	for(i=0;i<res.length;i++){
		str += `${i + 1}. ${htmlDecode.decode(res[i].title.rendered)} (ID: ${res[i].id})\n  - ${removeHTMLTags(htmlDecode.decode(res[i].content.rendered))}\n\n`;
	}
	var filename = [];
	imagelinks.forEach((x) => {
		filename.push(axios({
			url: x,
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	var filename = (await Promise.all(filename)).map(x => x.data);
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function hentaiz_crawl (data, api){
	var axios = require("axios");
	var args = data.body.split(" ");
	var choice = ["anime", "hentai", "gai", "gai18", "yuri", "yaoi", "futa", "furry"];
	if(data.body == "") return api.sendMessage(`Thêm 1 trong các yếu tốt sau để tìm hiểu chi tiết hơn:\n\n  - "anime": Ảnh anime, ecchi\n  - "hentai": Ảnh hentai\n  - "gai": Ảnh gái thường\n  - "gai18": Ảnh gái 18+\n  - "yuri": Ảnh gái x gái\n  - "yaoi": Ảnh trai x trai\n  - "futa": Ảnh cú có gai\n  - "furry": Ảnh furry\n\n  - Thêm số trang để lựa trang, mặc định để trống là 1`, data.threadID, data.messageID);
	args[1] == undefined ? args[1] = "1": "";
	var url = "";
	var tpe = "";
	switch(args[0]){
		case "anime": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=616622316356501515`; type = "img"; break;
		case "hentai": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=616616204781617152`; type = "img"; break;
		case "gai": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=781870041862897684`; type = "img"; break;
		case "gai18": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=781870218192355329`; type = "img"; break;
		case "yuri": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=616622475773476884`; type = "img"; break;
		case "yaoi": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=622677459690717185`; type = "img"; break;
		case "futa": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=616622496765968427`; type = "img"; break;
		case "furry": url = `https://hentaiz.top/gallery/page/${args[1]}/?channels%5B%5D=622677550065516554`; type = "img"; break;
		default: return api.sendMessage(`Sai yếu tố, sau đây là những yếu tố hiện có:\n\n  - "anime": Ảnh anime, ecchi\n  - "hentai": Ảnh hentai\n  - "gai": Ảnh gái thường\n  - "gai18": Ảnh gái 18+\n  - "yuri": Ảnh gái x gái\n  - "yaoi": Ảnh trai x trai\n  - "futa": Ảnh cú có gai\n  - "furry": Ảnh furry\n\n  - Thêm số trang để lựa trang, mặc định để trống là 1`, data.threadID, data.messageID); break;
	}
	var res = await getimage(url, type);
	res = res.filter(url => url.slice(0, 40) == "https://media.discordapp.net/attachments");
	var res2 = [];
	for(i=0;i<res.length;i++){
		var test = await axios(res[i]).catch(err => err);
		if(test.status == 200){
			//test.config.url.slice(test.config.url.length - 5, test.config.url.length) != ".webp" ? res2.push(res[i]) : res3.push(res[i]);
			res2.push(res[i]);
		}
	}
	var filename = [];
	res2.forEach((x) => {
		filename.push(axios({
			url: x,
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	var filename = (await Promise.all(filename)).map(x => x.data);
	api.sendMessage({
		body: `${args[0]} trang ${args[1]}:`,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function nhentai_posts (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	var args = data.body;
	if(args == "") return api.sendMessage(`Thiếu ID!`, data.threadID, data.messageID)
	var id = parseInt(data.args[1], 10);
	if(isNaN(id) == true) return api.sendMessage("ID không chính xác! (VD: 240912)", data.threadID, data.messageID);
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() === 'image') {
			  req.abort();
			} else {
			  req.continue();
			}
		  });
	await page.goto("https://nhentai.net/api/gallery/" + id,{
		waitUntil: 'networkidle2',
	});
	var content = await page.content(); 
    var res = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 
	await browser.close();
	if(res.error == "does not exist") return api.sendMessage("ID không tồn tại! (VD: 240912)", data.threadID, data.messageID);
	var uploadtime = new Date(res.upload_date*1000);
	var title = res.title.english;
	var id = res.id;
	var pages = res.num_pages;
	var tags = res.tags.filter(x => x.type == "tag").map(y => y.name);
	var artist = res.tags.filter(x => x.type == "artist").map(y => y.name);
	var category = res.tags.filter(x => x.type == "category").map(y => y.name);
	var language = res.tags.filter(x => x.type == "language").map(y => y.name);
	var parody = res.tags.filter(x => x.type == "parody").map(y => y.name);
	var character = res.tags.filter(x => x.type == "character").map(y => y.name);
	var mediaid = res.media_id;
	var tail = TYPE[res.images.pages[0].t];
	try{
		var imageres = await axios({
			url: `https://i.nhentai.net/galleries/${mediaid}/1${tail}`,
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: `${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())} (ID: ${id})\n  - Tác giả: ${artist.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n  - Ngày phát hành: ${uploadtime.getDate()}/${uploadtime.getMonth()+1}/${uploadtime.getFullYear()}\n` + ((parody.length > 0) ? `  - Parody: ${parody.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((character.length > 0) ? `  - Characters: ${character.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((language.length > 0) ? `  - Language: ${language.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((category.length > 0) ? `  - Category: ${category.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((tags.length > 0) ? `  - Tags: ${tags.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``),
		attachment: imageres.data
	}, data.threadID, data.messageID);
}

async function nhentai_read (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	var args = data.body;
	if(args == "") return api.sendMessage(`Thiếu ID!`, data.threadID, data.messageID);
	var id = parseInt(data.args[1], 10);
	if(isNaN(id) == true) return api.sendMessage("ID không chính xác! (VD: 240912)", data.threadID, data.messageID);
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.setRequestInterception(true);
	page.on('request', (req) => {
		if (req.resourceType() === 'image') {
		  req.abort();
		} else {
		  req.continue();
		}
	  });
	await page.goto("https://nhentai.net/api/gallery/" + id,{
		waitUntil: 'networkidle2',
	});
	var content = await page.content(); 
    var res = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 
	await browser.close();
	if(res.error == "does not exist"){
		return{
			handler: "internal",
			data: "ID không tồn tại! (VD: 240912)"
		}
	}
	var title = res.title.english;
	var id = res.id;
	var pages = parseInt(res.num_pages, 10);
	var mediaid = res.media_id;
	var filename = [];
	if(pages > doujinPageLimit) return api.sendMessage(`Bộ này bot đọc hong nổi do có đến ${pages} trang lận nên bot cho link nè, tự đi đọc đê (")>\r\n-Link: https://nhentai .net/g/${id}`, data.threadID, data.messageID);
	api.sendMessage(`Vui lòng đợi ${pages*2}s để bot đọc nhé ^^. Hãy đọc trên điện thoại vì trên máy tính thứ tự trang sẽ bị loạn!`, data.threadID, data.messageID);
	var limitarr = Array.from(Array(pages).keys());
	limitarr.forEach((x) => {
		filename.push(axios({
			url: "https://i.nhentai.net/galleries/" + mediaid + `/${x + 1}` + TYPE[res.images.pages[x].t],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	try{
		var filename = (await Promise.all(filename)).map(x => x.data);
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: `${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\r\n  - Số trang: ${pages} trang`,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function nhentai_popular (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	popularDoujin > 5 ? popularDoujin = 5 : "";
	var popular = [];
	var str = "";
	for(i=0;i<popularDoujin;i++){
		var id = global.data.hentai.doujin.main[i].slice(3, global.data.hentai.doujin.main[i].length - 1);
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.setDefaultNavigationTimeout(0);
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() === 'image') {
			  req.abort();
			} else {
			  req.continue();
			}
		  });
		await page.goto("https://nhentai.net/api/gallery/" + id,{
			waitUntil: 'networkidle2',
		});
		var content = await page.content(); 
		var res = await page.evaluate(() =>  {
			return JSON.parse(document.querySelector("body").innerText); 
		}); 
		await browser.close();
		var artist = res.tags.filter(x => x.type == "artist").map(y => y.name);
		var title = res.title.english;
		var id = res.id;
		var pages = res.num_pages;
		popular.push([
			res.media_id,
			res.images.pages[0].t
		]);
		str += `${i + 1}. ${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())} (ID: ${id})\n  - Tác giả: ${artist.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n  - Số trang: ${pages}\n\n`
	}
	var filename = [];
	popular.forEach((x) => {
		filename.push(axios({
			url: "https://i.nhentai.net/galleries/" + x[0] + `/1` + TYPE[x[1]],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	try{
		var filename = (await Promise.all(filename)).map(x => x.data);
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function nhentai_new (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	newDoujin > 5 ? newDoujin = 5 : "";
	var neww = [];
	var str = "";
	for(i=0;i<newDoujin;i++){
		var id = global.data.hentai.doujin.main[i + 5].slice(3, global.data.hentai.doujin.main[i + 5].length - 1);
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.setDefaultNavigationTimeout(0);
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() === 'image') {
			  req.abort();
			} else {
			  req.continue();
			}
		  });
		await page.goto("https://nhentai.net/api/gallery/" + id,{
			waitUntil: 'networkidle2',
		});
		var content = await page.content(); 
		var res = await page.evaluate(() =>  {
			return JSON.parse(document.querySelector("body").innerText); 
		}); 
		await browser.close();
		var artist = res.tags.filter(x => x.type == "artist").map(y => y.name);
		var title = res.title.english;
		var id = res.id;
		var pages = res.num_pages;
		neww.push([
			res.media_id,
			res.images.pages[0].t
		]);
		str += `${i + 1}. ${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())} (ID: ${id})\n  - Tác giả: ${artist.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n  - Số trang: ${pages}\n\n`
	}
	var filename = [];
	neww.forEach((x) => {
		filename.push(axios({
			url: "https://i.nhentai.net/galleries/" + x[0] + `/1` + TYPE[x[1]],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	try{
		var filename = (await Promise.all(filename)).map(x => x.data);
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function nhentai_search (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	var args = data.body;
	var str = "Có phải bạn đang tìm kiếm:";
	var search = [];
	var res = (await gethref(`https://nhentai.net/search/?q=${args}`)).filter(x => x.slice(0, 3) == "/g/");
	relatedDoujin > res.length ? relatedDoujin = res.length : "";
	for(i=0;i<relatedDoujin;i++){
		var id = res[i].slice(3, global.data.hentai.doujin.main[i].length - 1);
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.setDefaultNavigationTimeout(0);
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() === 'image') {
			  req.abort();
			} else {
			  req.continue();
			}
		  });
		await page.goto("https://nhentai.net/api/gallery/" + id,{
			waitUntil: 'networkidle2',
		});
		var content = await page.content(); 
		var res2 = await page.evaluate(() =>  {
			return JSON.parse(document.querySelector("body").innerText); 
		}); 
		await browser.close();
		var artist = res2.tags.filter(x => x.type == "artist").map(y => y.name);
		var title = res2.title.english;
		var id = res2.id;
		var pages = res2.num_pages;
		search.push([
			res2.media_id,
			res2.images.pages[0].t
		]);
		str += `\n\n${i + 1}. ${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())} (ID: ${id})\n  - Tác giả: ${artist.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n  - Số trang: ${pages}`
	}
	var filename = [];
	search.forEach((x) => {
		filename.push(axios({
			url: "https://i.nhentai.net/galleries/" + x[0] + `/1` + TYPE[x[1]],
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		}));
	});
	try{
		var filename = (await Promise.all(filename)).map(x => x.data);
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: str,
		attachment: filename
	}, data.threadID, data.messageID);
}

async function nhentai_random (data, api){
	var puppeteer = require("puppeteer-extra");
	var axios = require("axios");
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.setRequestInterception(true);
	page.on('request', (req) => {
		if (req.resourceType() === 'image') {
		  req.abort();
		} else {
		  req.continue();
		}
	  });
	const response = await page.goto("https://nhentai.net/random",{
		waitUntil: 'networkidle2',
	});
	const chain = response.request().redirectChain(); 
	var url = "https://nhentai.net/api/gallery/"+(chain[0]._frame. _url).slice(22, (chain[0]._frame. _url).length-1);
	await page.goto(url,{
		waitUntil: 'networkidle2',
	});
	var content = await page.content(); 
    var res = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 
	await browser.close();
	if(res.error == "does not exist") return api.sendMessage("ID không tồn tại! (VD: 240912)", data.threadID, data.messageID);
	var uploadtime = new Date(res.upload_date*1000);
	var title = res.title.english;
	var id = res.id;
	var pages = res.num_pages;
	var tags = res.tags.filter(x => x.type == "tag").map(y => y.name);
	var artist = res.tags.filter(x => x.type == "artist").map(y => y.name);
	var category = res.tags.filter(x => x.type == "category").map(y => y.name);
	var language = res.tags.filter(x => x.type == "language").map(y => y.name);
	var parody = res.tags.filter(x => x.type == "parody").map(y => y.name);
	var character = res.tags.filter(x => x.type == "character").map(y => y.name);
	var mediaid = res.media_id;
	var tail = TYPE[res.images.pages[0].t];
	try{
		var imageres = await axios({
			url: `https://i.nhentai.net/galleries/${mediaid}/1${tail}`,
			method: "GET",
			responseType: "stream",
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	catch(err){
		return api.sendMessage("Lệnh bị lỗi, vui lòng thử lại", data.threadID, data.messageID);
	}
	api.sendMessage({
		body: `${title.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())} (ID: ${id})\n  - Tác giả: ${artist.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n  - Ngày phát hành: ${uploadtime.getDate()}/${uploadtime.getMonth()+1}/${uploadtime.getFullYear()}\n` + ((parody.length > 0) ? `  - Parody: ${parody.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((character.length > 0) ? `  - Characters: ${character.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((language.length > 0) ? `  - Language: ${language.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((category.length > 0) ? `  - Category: ${category.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``) + ((tags.length > 0) ? `  - Tags: ${tags.join(', ').replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase())}\n` : ``),
		attachment: imageres.data
	}, data.threadID, data.messageID);
}

async function nhentai_tags (data, api){
	var axios = require("axios");
	var page;
	data.body != "" && data.body != " " ? page = data.body : page = "1";
	if(isNaN(page) || page.indexOf(".") != -1){
		page = removeVietnameseTones(page);
		var arr = [];
		global.data.hentai.doujin.pages.forEach(x => {
			arr = arr.concat(x);
		});
		var z = findBestMatch(page, arr);
		if(z.bestMatch.rating <= 0.3) return api.sendMessage("Không tìm thấy tag!", data.threadID, data.messageID)
		var res2 = (await gethref(`https://nhentai.net/tag/${arr[z.bestMatchIndex].replaceAll(" ", "-")}/`)).filter(x => x.slice(0, 3) == "/g/").map(x => x.slice(3, x.lenght - 1));
		var random = [];
		for(i=0;i<randomDoujinForSearchTags;i++){
			var eng;
			eng = Math.floor(Math.random() * res2.length);
			while (random.indexOf(eng) != -1){
				eng = Math.floor(Math.random() * res2.length);
			}
			random.push(eng);
		}
		var imagelinks = [];
		for(i=0;i<random.length;i++){
			var base = await getdata(`https://nhentai.net/api/gallery/${random[i]}`);
			imagelinks.push([
				base.media_id,
				base.images.pages[0].t,
				base.id,
				base.title.english
			]);
		};
		var filename = [];
		imagelinks.forEach((x) => {
			filename.push(axios({
				url: `https://i.nhentai.net/galleries/${x[0]}/1${TYPE[x[1]]}`,
				method: "GET",
				responseType: "stream",
				headers: {
					'Content-Type': 'application/json'
				}
			}));
		});
		var filename = (await Promise.all(filename)).map(x => x.data);
		var str = `Một số truyện thuộc thể loại ${arr[z.bestMatchIndex]}:`;
		for(i=0;i<randomDoujinForSearchTags;i++){
			str += `\n  - ${imagelinks[i][3]} (ID: ${imagelinks[i][2]})`
		}
		api.sendMessage({
			body: str,
			attachment: filename
		}, data.threadID, data.messageID);
	}
	else {
		var str = "Các tags:\n\n";
		for(i=0;i<global.data.hentai.doujin.pages[page - 1].length;i++){
			str += `${global.data.hentai.doujin.pages[page - 1][i]}\n`;
		};
		str += `\nTrang ${page}/${global.data.hentai.doujin.pages.length}`;
		api.sendMessage(str, data.threadID, data.messageID);
	}
}	

async function getdata(uri){
	var puppeteer = require("puppeteer-extra");
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
	puppeteer.use(StealthPlugin());
	const randomUseragent = require('random-useragent');
	const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
	var test = true;
	let browser = await puppeteer.launch(
	  { headless: true, executablePath: process.env.CHROME_BIN || null, args: [
		'--enable-features=NetworkService', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'
	  ], ignoreHTTPSErrors: true, dumpio: false}
	);
	while (test) {
		//console.log("test");
		let page = await browser.newPage();
		const userAgent = randomUseragent.getRandom();
		const UA = userAgent || USER_AGENT;
		await page.setViewport({
			width: 1920 + Math.floor(Math.random() * 100),
			height: 3000 + Math.floor(Math.random() * 100),
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: false,
			isMobile: false,
		});
		await page.setUserAgent(UA);
		await page.setJavaScriptEnabled(true);
		await page.setDefaultNavigationTimeout(0);
		await page.goto(uri, { waitUntil: 'networkidle0' });
		var content = await page.content();
		//console.log(content);
		var res = await page.evaluate(() =>  {
			return document.querySelector("body").innerText; 
		});
		try{
			res = JSON.parse(res);
			test = false;
		}
		catch (e){
			test = true;
		}
		//test == true ? console.log("cloudflare lon. Retry") : "";
		//console.log(test, res);
	}
	await browser.close();
	return res;
}

async function getimage(uri, type){
	const cherio = require('cherio');
	var puppeteer = require("puppeteer-extra");
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
	puppeteer.use(StealthPlugin());
	const randomUseragent = require('random-useragent');
	const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
	let browser = await puppeteer.launch(
	  { headless: true, executablePath: process.env.CHROME_BIN || null, args: [
		'--enable-features=NetworkService', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'
	  ], ignoreHTTPSErrors: true, dumpio: false}
	);
	var test = true;
	while (test){
		let page = await browser.newPage();
		const userAgent = randomUseragent.getRandom();
		const UA = userAgent || USER_AGENT;
		await page.setViewport({
			width: 1920 + Math.floor(Math.random() * 100),
			height: 3000 + Math.floor(Math.random() * 100),
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: false,
			isMobile: false,
		});
		await page.setUserAgent(UA);
		await page.setJavaScriptEnabled(true);
		await page.setDefaultNavigationTimeout(0);
		await page.goto(uri, { waitUntil: 'networkidle0' });
		var content = await page.content();
		//console.log(content);
		var $ = cherio.load(content);
		var links = [];
		$(type).each((index, image) => {
			links.push($(image).attr('src'));
		});
		test = false;
		//console.logg(links);
		links[1] == undefined ? test = true : (links[1].slice(0, 4) != "http" ? links[1] = "https://hentaiz.top" + links[1] : "");
		//test == true ? console.log("cloudflare lon. Retry") : "";
	}
	await browser.close();
	return links
}

async function gethref(uri){
	const cherio = require('cherio');
	var puppeteer = require("puppeteer-extra");
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
	puppeteer.use(StealthPlugin());
	const randomUseragent = require('random-useragent');
	const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
	let browser = await puppeteer.launch(
	  { headless: true, executablePath: process.env.CHROME_BIN || null, args: [
		'--enable-features=NetworkService', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'
	  ], ignoreHTTPSErrors: true, dumpio: false}
	);
	var test = true;
	while (test){
		let page = await browser.newPage();
		const userAgent = randomUseragent.getRandom();
		const UA = userAgent || USER_AGENT;
		await page.setViewport({
			width: 1920 + Math.floor(Math.random() * 100),
			height: 3000 + Math.floor(Math.random() * 100),
			deviceScaleFactor: 1,
			hasTouch: false,
			isLandscape: false,
			isMobile: false,
		});
		await page.setUserAgent(UA);
		await page.setJavaScriptEnabled(true);
		await page.setDefaultNavigationTimeout(0);
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() === 'image') {
			  req.abort();
			} else {
			  req.continue();
			}
		  });
		await page.goto(uri, { waitUntil: 'networkidle0' });
		var content = await page.content();
		//console.log(content);
		var $ = cherio.load(content);
		var links = [];
		$("a").each((index, link) => {
			links.push($(link).attr('href'));
		});
		test = false;
		//console.logg(links);
		links[1] == undefined ? test = true : "";
		//test == true ? console.log("cloudflare lon. Retry") : "";
	}
	await browser.close();
	return links
}

function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')
  if (!first.length && !second.length) return 1;                   // if both are empty strings
  if (!first.length || !second.length) return 0;                   // if only one is empty string
  if (first === second) return 1;                      // identical
  if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
  if (first.length < 2 || second.length < 2) return 0;       // if either is a 1-letter string
  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
    firstBigrams.set(bigram, count);
  }
  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }
  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(mainString, targetStrings) {
  if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
  const ratings = [];
  let bestMatchIndex = 0;
  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentRating = compareTwoStrings(mainString, currentTargetString)
    ratings.push({
      target: currentTargetString, 
      rating: currentRating
    });
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i
    }
  }
  const bestMatch = ratings[bestMatchIndex]
  return { 
    ratings, 
    bestMatch, 
    bestMatchIndex 
  };
}

function areArgsValid(mainString, targetStrings) {
  if (typeof mainString !== 'string') return false;
  if (!Array.isArray(targetStrings)) return false;
  if (!targetStrings.length) return false;
  if (targetStrings.find(s => typeof s !== 'string')) return false;
  return true;
}

function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g," ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    //str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}

function removeHTMLTags (str){
	str=str.replace(/<br>/gi, "");
	str=str.replace(/<br\s\/>/gi, "");
	str=str.replace(/<br\/>/gi, "");
	str=str.replace(/<p.*>/gi, "");
	str=str.replace("</p>", "");
	str=str.replace(/(\r\n|\n|\r)/gi, "");
	return str
}

module.exports = {
	init,
	hentaiz_tags,
	hentaiz_posts,
	hentaiz_search,
	hentaiz_random,
	hentaiz_new,
	hentaiz_crawl,
	nhentai_posts,
	nhentai_read,
	nhentai_popular,
	nhentai_new,
	nhentai_search,
	nhentai_random,
	nhentai_tags
}