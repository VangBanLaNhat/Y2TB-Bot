var path = require("path");

function init(){
    ensureExists(path.join(__dirname, "cache", "ytmp4"));
    ensureExists(path.join(__dirname, "cache", "ytmp3"));
    return{
        "pluginName": "YTmp34",
        "pluginMain": "YTmp3.js",
        "commandList": {
            "ytmp4": {
                "help": {
                    "vi_VN": "<Link YouTube>",
                    "en_US": "<Link YouTube>"
                },
                "tag": {
                    "vi_VN": "Tải video về từ YouTube",
                    "en_US": "Download video from YouTube"
                },
                "mainFunc": "ytmp4"
            },
            "ytmp3": {
                "help": {
                    "vi_VN": "<Link YouTube>",
                    "en_US": "<Link YouTube>"
                },
                "tag": {
                    "vi_VN": "Tải audio về từ YouTube",
                    "en_US": "Download audio from YouTube"
                },
                "mainFunc": "ytmp3"
            }
        },
        "nodeDepends":{
            "ytdl-core": "",
            "@ffmpeg-installer/ffmpeg": "",
            "fluent-ffmpeg": ""
        },
        "author": "HerokeyVN",
        "version": "0.0.1"
    }
}

function ensureExists(path, mask) {
    var fs = require('fs');
  if (typeof mask != 'number') {
    mask = 0o777;
  }
  try {
    fs.mkdirSync(path, {
      mode: mask,
      recursive: true
    });
    return;
  } catch (ex) {
    return {
      err: ex
    };
  }
}

async function ytmp4(data, api){
    if (data.args[1] != undefined){
        var fs = require('fs');
        var ytdl = require("ytdl-core");
        
        try{
            var info = await ytdl.getInfo(data.args[1]);
            var dirr = path.join(__dirname, "cache", "ytmp4", ytdl.getVideoID(data.args[1])+".mp4")
            api.sendMessage("Downloading: "+info.player_response.videoDetails.title, data.threadID, data.messageID);
        
            ytdl(data.args[1]).pipe(fs.createWriteStream(dirr)).on("close", () => {
                if (fs.statSync(dirr).size > 26214400) api.sendMessage("Video lớn hơn 25MB", data.threadID, () => fs.unlinkSync(dirr), data.messageID);
                else api.sendMessage({
                    body: "Success: "+info.player_response.videoDetails.title, 
                    attachment: fs.createReadStream(dirr)
                }, data.threadID, () => fs.unlinkSync(dirr), data.messageID)
            })
        } catch (err){
            console.error("ytmp4", err);
            api.sendMessage(err, data.threadID, data.messageID);
        }
    } else {
        api.sendMessage("Vui lòng nhập link YouTube!", data.threadID, data.messageID);
    }
}

async function ytmp3(data, api){
    if (data.args[1] != undefined){
        var ytdl = require('ytdl-core');
        var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        var ffmpeg = require('fluent-ffmpeg');
        var fs = require("fs");
        ffmpeg.setFfmpegPath(ffmpegPath);
        
        let link = data.args[1];
        try{
        var id = ytdl.getVideoID(data.args[1])
        var info = await ytdl.getInfo(data.args[1]);
        
        var dirr = path.join(__dirname, "cache", "ytmp3", id+".mp3")
        
        let vdo = ytdl(link, {
          quality: 'highestaudio',
        });
        api.sendMessage("Downloading: "+info.player_response.videoDetails.title, data.threadID, data.messageID);
        
        ffmpeg(vdo).audioBitrate(128).save(dirr).on('progress', p => {
                console.log("ytmp3", `${p.targetSize}KB downloaded`);
            }).on('end', () => {
                if (fs.statSync(dirr).size > 26214400) api.sendMessage("Audio lớn hơn 25MB", data.threadID, () => fs.unlinkSync(dirr), data.messageID)
                else api.sendMessage({
                    body: "Success: "+info.player_response.videoDetails.title, 
                    attachment: fs.createReadStream(dirr)
                }, data.threadID, () => fs.unlinkSync(dirr), data.messageID)
            });
        } catch (err) {
            console.error("ytmp3", err);
            api.sendMessage(err, data.threadID, data.messageID)
        }
    } else {
        api.sendMessage("Vui lòng nhập link YouTube!", data.threadID, data.messageID);
    }
}
module.exports = {
    ytmp4,
    ytmp3,
    init
};