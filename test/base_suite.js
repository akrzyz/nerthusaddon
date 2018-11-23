suite("Base")

before(function()
{
    log = function(msg){console.log(msg)}

    nerthus = {}
    nerthus.addon = {}
    nerthus.addon.store = function(){}
    nerthus.lvlNames = ["lvl1-8","lvl9-16"]
    nerthus.vips = []

    g = {}
    g.chat = {}
    g.chat.txt = []
    g.loadQueue = []
    g.tips = {}
    g.tips.npc = function(){}
    hero = {}
    chatScroll = function(){}
    _message = null
    message = function(m){_message = m}

    jqObjMock = {}
    jqObjMock.hasClass = function(){}
    jqObjMock.html = function(){}
    jqObjMock.attr = function(){}
    $ = function (){return jqObjMock}

    expect = require("expect.js")
    require("../NN_base.js")


    g.names = {}
    g.names.ranks =
    {
        0 : "ADMIN",
        1 : "SMG",
        2 : "MG",
        3 : "MC",
        4 : "SMC",
        5 : "BARD",
        6 : "BARD_MC",
        7 : "RADNY"
    }
    rights = {ADMIN : 1, SMG : 16, MG : 2, MC : 4}

})

beforeEach(function()
{
    g.loadQueue = []
    g.chat.txt = []
    nerthus.NerthusRad = []

    player = {rights:0, nick:"NAME", id:42, lvl:1}
})

test("defer a functio", function()
{
    var foo = function(){}
    nerthus.defer(foo)

    expect(g.loadQueue).to.have.length(1)
    expect(g.loadQueue[0].fun).to.be.equal(foo)
})

test("defer a functio with args", function()
{
    var foo = function(){}
    var foo_args = 42
    nerthus.defer(foo, foo_args)

    expect(g.loadQueue).to.have.length(1)
    expect(g.loadQueue[0].fun).to.be.equal(foo)
    expect(g.loadQueue[0].data).to.be.equal(foo_args)
})

test("defer a non function arg throw error", function()
{
    expect(nerthus.defer).withArgs("invalid arg").to.throwException()
})

test("has special privilege" , function()
{
    var RADNY = "radny"
    var SPEC = "specialny"
    var NARR = "narrator"
    var DUMMY = "dummy"
    nerthus.NerthusRad = [RADNY]
    nerthus.NerthusSpec = [SPEC]
    nerthus.NerthusNarr = [NARR]

    expect(nerthus.isRad(RADNY)).to.be.ok()
    expect(nerthus.isSpec(SPEC)).to.be.ok()
    expect(nerthus.isNarr(NARR)).to.be.ok()

    expect(nerthus.isRad(DUMMY)).to.not.be.ok()
    expect(nerthus.isSpec(DUMMY)).to.not.be.ok()
    expect(nerthus.isNarr(DUMMY)).to.not.be.ok()
})

test("season", function()
{
    var seasons = { SPRING : 1, SUMMER : 2, AUTUMN : 3, WINTER : 4 }
    var _date = Date

    var setDate = function(day, month)
    {
        Date = function()
        {
            var date = new _date(0)
            date.setUTCDate(day)
            date.setUTCMonth(month-1)
            return date
        }
    }

    var expectSeasonToBeBetween = function(season, begin, end)
    {
        setDate(begin.day, begin.month)
        expect(nerthus.season()).to.be(season)
        setDate(end.day, end.month)
        expect(nerthus.season()).to.be(season)
    }

    //SPRING <21.3-22.6)
    expectSeasonToBeBetween(seasons.SPRING,{day:21,month:3},{day:20,month:6}) //bug should be 21.6

    //SUMMER <22.6-23.9)
    expectSeasonToBeBetween(seasons.SUMMER,{day:22,month:6},{day:22,month:9})

    //AUTUMN <23.9-22.12) // -22.11 ..
    expectSeasonToBeBetween(seasons.AUTUMN,{day:23,month:9},{day:21,month:11})

    //WINTER <22.12-21.3) // 22.11 - .. let it snow a bit longer :D
    expectSeasonToBeBetween(seasons.WINTER,{day:22,month:11},{day:20,month:3})

    Date = _date
})

test("setChatInfo : info not present", function()
{
    nerthus.chatInfoStr = ""
    nerthus.setChatInfo()
    expect(g.chat.txt).to.be.empty()
})

test("setChatInfo : info present", function()
{
    nerthus.chatInfoStr = "INFO"
    nerthus.setChatInfo()
    expect(g.chat.txt).to.have.length(1)
    expect(g.chat.txt[0]).to.contain(nerthus.chatInfoStr)
})

test("setEnterMsg : msg not present", function()
{
    nerthus.EnterMsg = ""
    nerthus.setEnterMsg()
    expect(_message).to.not.be.ok()
})

test("setEnterMsg : msg present", function()
{
    nerthus.EnterMsg = "MSG"
    nerthus.setEnterMsg()
    expect(_message).to.be.equal(nerthus.EnterMsg)
})

test("only store settings", function()
{
    let opt = {op1:true, op2:false, op3:"Hmm"}
    nerthus.storeSettings(opt)

    expect(nerthus.options.op1).to.be.equal(opt.op1)
    expect(nerthus.options.op2).to.be.equal(opt.op2)
    expect(nerthus.options.op3).to.be.equal(opt.op3)
})

test("store and load settings", function()
{
    var opt = {op1:true, op2:false, op3:"Hmm"}
    nerthus.storeSettings(opt)

    expect(nerthus.options.op1).to.be.equal(opt.op1)
    expect(nerthus.options.op2).to.be.equal(opt.op2)
    expect(nerthus.options.op3).to.be.equal(opt.op3)

    nerthus.options = {}

    nerthus.loadSettings()

    expect(nerthus.options.op1).to.be.equal(opt.op1)
    expect(nerthus.options.op2).to.be.equal(opt.op2)
    expect(nerthus.options.op3).to.be.equal(opt.op3)
})

test("tips.rank : player without any privilages", function()
{
    expect(nerthus.tips.rank(player)).to.be.equal("")
})

test("tips.rank : admin", function()
{
    player.rights = rights.ADMIN
    expect(nerthus.tips.rank(player)).to.be.equal("ADMIN")
})

test("tips.rank : smg", function()
{
    player.rights = rights.SMG
    expect(nerthus.tips.rank(player)).to.be.equal("SMG")
})

test("tips.rank : mg", function()
{
    player.rights = rights.MG
    expect(nerthus.tips.rank(player)).to.be.equal("MG")
})

test("tips.rank : radny", function()
{
    nerthus.NerthusRad = [player.nick]
    expect(nerthus.tips.rank(player)).to.be.equal("RADNY")
})

test("tips.rank : bard", function()
{
    nerthus.NerthusNarr = [player.nick]
    expect(nerthus.tips.rank(player)).to.be.equal("BARD")
})

test("tips.rank : bard + mc", function()
{
    nerthus.NerthusNarr = [player.nick]
    player.rights = rights.MC
    expect(nerthus.tips.rank(player)).to.be.equal("BARD_MC")
})

test("tips.rank : bard is overrided by radny", function()
{
    nerthus.NerthusNarr = [player.nick]
    nerthus.NerthusRad = [player.nick]
    expect(nerthus.tips.rank(player)).to.be.equal("RADNY")
})

test("tips.title : non lvl", function()
{
    player.lvl = 0
    expect(nerthus.tips.title(player)).to.be.equal("")
})

test("tips.title : lvl 1-8", function()
{
    player.lvl = 1
    expect(nerthus.tips.title(player)).to.be.equal("lvl1-8")
    player.lvl = 8
    expect(nerthus.tips.title(player)).to.be.equal("lvl1-8")
})

test("tips.title : lvl 9-16", function()
{
    player.lvl = 9
    expect(nerthus.tips.title(player)).to.be.equal("lvl9-16")
    player.lvl = 16
    expect(nerthus.tips.title(player)).to.be.equal("lvl9-16")
})

test("tips.title : lvl*8 above lvl names lenght", function()
{
    player.lvl = nerthus.lvlNames.length * 8 + 10
    expect(nerthus.tips.title(player)).to.be.equal(nerthus.lvlNames[nerthus.lvlNames.length - 1])
})

test("tips.title : vip, special names for vips", function()
{
    nerthus.vips[player.id] = "VIP"
    expect(nerthus.tips.title(player)).to.be.equal("VIP")
})

test("tips.other : nick only", function()
{
    var other = {nick:"NICK"}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>")
})

test("tips.other : nick + clan", function()
{
    var other = {nick:"NICK", clan : "CLAN"}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>" +
                                            "[" + other.clan +"]<br>")
})

test("tips.other : nick + mute", function()
{
    var other = {nick:"NICK", attr : 1}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>" +
                                            "<img src=img/mute.gif>")
})

test("tips.other : nick + title", function()
{
    var _title = nerthus.tips.title
    nerthus.tips.title = function(){return "VIP"}

    var other = {nick:"NICK"}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>" +
                                            "VIP")
    nerthus.tips.title = _title
})

test("tips.other : nick + rank", function()
{
    var _rank = nerthus.tips.rank
    nerthus.tips.rank = function(){return "RANK"}

    var other = {nick:"NICK"}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>" +
                                            "<i>RANK</i>")
    nerthus.tips.rank = _rank
})

test("tips.other : nick + clan + title + rank + mute", function()
{
    var _rank = nerthus.tips.rank
    var _title = nerthus.tips.title
    nerthus.tips.title = function(){return "VIP"}
    nerthus.tips.rank = function(){return "RANK"}

    var other = {nick:"NICK", clan:"CLAN", attr:1}
    expect(nerthus.tips.other(other)).equal("<b>" + other.nick + "</b>" +
                                            "[" + other.clan + "]<br>" +
                                            "VIP" +
                                            "<i>RANK</i>" +
                                            "<img src=img/mute.gif>")
    nerthus.tips.rank = _rank
    nerthus.tips.title = _title
})

test("tips.hero : nick", function()
{
    var hero = {nick:"NICK"}
    expect(nerthus.tips.hero(hero)).equal(
         "<b><font color='white'>" + hero.nick + "</font></b>")
})

test("tips.hero : nick + title", function()
{
    var _title = nerthus.tips.title
    nerthus.tips.title = function(){return "VIP"}

    var hero = {nick:"NICK"}
    expect(nerthus.tips.hero(hero)).equal(
         "<b><font color='white'>" + hero.nick + "</font></b>" +
         "<center>" + "VIP" + "</center>")

    nerthus.tips.title = _title
})

test("tips.hero : nick + rank", function()
{
    var _rank = nerthus.tips.rank
    nerthus.tips.rank = function(){return "RANK"}

    var hero = {nick:"NICK"}
    expect(nerthus.tips.hero(hero)).equal(
         "<b><font color='white'>" + hero.nick + "</font></b>" +
         "<i><font color='red'>" + "RANK" + "</font></i>")

    nerthus.tips.rank = _rank
})


test("tips.hero : nick + title + rank", function()
{
    var _rank = nerthus.tips.rank
    var _title = nerthus.tips.title
    nerthus.tips.title = function(){return "VIP"}
    nerthus.tips.rank = function(){return "RANK"}

    var hero = {nick:"NICK"}
    expect(nerthus.tips.hero(hero)).equal(
         "<b><font color='white'>" + hero.nick + "</font></b>" +
         "<center>" + "VIP" + "</center>" +
         "<i><font color='red'>" + "RANK" + "</font></i>")

    nerthus.tips.rank = _rank
    nerthus.tips.title = _title
})

test("nerthus.tips.npc : nick, type:0", function()
{
    var npc = {nick : "NICK", type:0}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>")
})

test("nerthus.tips.npc : nick + type=1 + wt>99 (tytan)", function()
{
    var npc = {nick : "NICK", type : -1, wt:100}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "tytan" + "</i>")
})

test("nerthus.tips.npc : nick + type=1 + wt>79 (heros)", function()
{
    var npc = {nick : "NICK", type : -1, wt:80}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "heros" + "</i>")
})

test("nerthus.tips.npc : nick + type=1 + wt>29 (elita III)", function()
{
    var npc = {nick : "NICK", type : -1, wt:30}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "elita III" + "</i>")
})

test("nerthus.tips.npc : nick + type=1 + wt>19 (elita II)", function()
{
    var npc = {nick : "NICK", type : -1, wt:20}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "elita II" + "</i>")
})

test("nerthus.tips.npc : nick + type=1 + wt>9 (elita)", function()
{
    var npc = {nick : "NICK", type : -1, wt:10}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "elita" + "</i>")
})

test("nerthus.tips.npc : nick + type=1 + wt<=9 ()", function()
{
    var npc = {nick : "NICK", type : -1, wt:9}
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>")
})

test("nerthus.tips.npc : nick + type=2|3 + lvl diff <= 9 (Zwykły przeciwnik)", function()
{
    var npc = {nick : "NICK", type : 2, lvl:9 }
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<span >" + 'Zwykły przeciwnik' + "</span>")
})

test("nerthus.tips.npc : nick + type=2|3 + lvl diff > 9 (Poważny rywal)", function()
{
    var npc = {nick : "NICK", type : 2, lvl:10 }
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        '<span style="color:#ff0">' + 'Poważny rywal' + '</span>')
})

test("nerthus.tips.npc : nick + type=2|3 + lvl diff > 19 (Potężny przeciwnik)", function()
{
    var npc = {nick : "NICK", type : 2, lvl:20 }
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        '<span style="color:#f50">' + 'Potężny przeciwnik' + '</span>')
})

test("nerthus.tips.npc : nick + type=2|3 + lvl diff < -13 (Niewarty uwagi)", function()
{
    var npc = {nick : "NICK", type : 2, lvl:0 }
    hero.lvl = 14
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        '<span style="color:#888">' + 'Niewarty uwagi' + '</span>')
})

test("nerthus.tips.npc : nick + type=2|3 + lvl diff > 19 (Potężny przeciwnik) +  wt>9 (elita) ", function()
{
    var npc = {nick : "NICK", type : 2, lvl:20, wt:10 }
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<i>" + "elita" + "</i>" +
                                        '<span style="color:#f50">' + 'Potężny przeciwnik' + '</span>')
})

test("nerthus.tips.npc : type=4 returns only nick ", function()
{
    var npc = {nick : "NICK", type : 4, lvl:20, wt:10 }
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>")
})

test("nerthus.tips.npc : type=1 in grup", function()
{
    var npc = {nick : "NICK", type : 1, grp:true}
    hero.lvl = 0
    expect(nerthus.tips.npc(npc)).equal("<b>" + npc.nick + "</b>" +
                                        "<span >" + ", w grupie" + "</span>")
})
