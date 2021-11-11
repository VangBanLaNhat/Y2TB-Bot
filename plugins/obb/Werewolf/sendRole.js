var map = {
    werewolf: "Bạn là sói thường. Hằng ngày bạn ẩn thân trong hình dạng dân làng, nhưng đến đêm bạn sẽ cùng đồng đội chọn ra 1 dân làng bất kì và ăn thịt.",
    village: "Bạn là dân làng. Hằng ngày bạn làm việc, tìm ra lũ sói độc ác và treo cổ chúng.",
    seer: "Bạn là tiên tri. Hằng đêm, bạn có thể dùng pháp thuật để xem vai trò của 1 người chơi bất kì.",
    guard: "Bạn là người bảo vệ. Hằng đêm, bạn có thể dùng sức mạnh của mình để bảo vệ 1 người chơi bất kì (bạn có thể bảo vệ chính bạn 1 lần).",
    witch: "Bạn là phù thủy! Bạn có 1 bình thuốc độc và 1 bình thuốc hồi sinh để cứu người chơi bị giết trong đêm nay, bạn hãy dùng 2 bình thuốc này để cứu hoặc giết 1 người chơi bất kì, hệ thống sẽ cho bạn biết tối nay ai sẽ chết!",
    mage: "Bạn là pháp sư! Bạn hãy dùng năng lực của mình để xem 1 người bất kì có phải là tiên tri không! Bạn thuộc phe sói."
}

function send(data, api, id) {
    var dt = global.data.werewolf[data.threadID];
    if (dt.started.life[id]){
        var msg = map[dt.started.life[id].role]
    }
    if (dt.started.death[id]){
        var msg = map[dt.starstarted.death[id].role]
    }
    api.sendMessage("(Werewolf)"+msg , id, (err) => {
        if(err){
            console.log(err);
            api.sendMessage("(Werewolf)"+`Không thể gửi role cho ${dt.player[id]}. Vùi lòng Inbox cho Bot trước và gõ lệnh "${global.config.facebook.prefix}ww myrole" ở Group này để xem vai trò của mình!`, data.threadID);
        }
    });
}

module.exports = send;