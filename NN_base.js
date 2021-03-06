/**
 * Name: NerthusBaseFunctions
 * Pierwszy plik z dodatku Nerthusa
 * Zawiera stworzenie obiktu nerthus i jego podstawowe funkcje
 * Zawiera stare opcja jak opisy zamiast lvli
**/

nerthus.defer = function(fun,data)
{
    if(typeof fun !== 'function')
        throw new TypeError('fun must be function when it is ' + typeof fun)
    g.loadQueue.push({'fun':fun, 'data':data})
}

nerthus.loadQueue = []
nerthus.loadOnEveryMap = function (fun, data)
{
    nerthus.loadQueue.push([fun, data])
}
nerthus.loadNewMapQueue = function ()
{
    for (const i in this.loadQueue)
    {
        this.loadQueue[i][0](this.loadQueue[i][1])
    }
}

//observe map change if user have some kind of fast map switcher (e.g. 'Szybsze przechodzenie' by Adi Wilk)
nerthus.startObservingMapChange_SI = function ()
{
    window.map.__loaded = window.map.loaded
    Object.defineProperty(window.map, "loaded", {
        set(val)
        {
            this.__loaded = val
            nerthus.loadNewMapQueue()

            return val
        },
        get()
        {
            return this.__loaded
        }
    })
}

nerthus.seasons = {SPRING: 1, SUMMER: 2, AUTUMN: 3, WINTER: 4}
nerthus.season = function()
{
    var makeStartDate = function(day,month)
    {
        var date = new Date()
        date.setUTCDate(day)
        date.setUTCMonth(month - 1)
        return date
    }
    const date = new Date()
    const SPRING_BEGIN = makeStartDate(21,3)
    const SUMMER_BEGIN = makeStartDate(22,6)
    const AUTUMN_BEGIN = makeStartDate(23,9)
    const WINTER_BEGIN = makeStartDate(22,11) //long winter

    if(date >= WINTER_BEGIN)
        return this.seasons.WINTER
    if(date >= AUTUMN_BEGIN)
        return this.seasons.AUTUMN
    if(date >= SUMMER_BEGIN)
        return this.seasons.SUMMER
    if(date >= SPRING_BEGIN)
        return this.seasons.SPRING
    return this.seasons.WINTER
}

nerthus.setChatInfo = function()
{
    if(this.chatInfoStr)
    {
        g.chat.txt[0] = '<div class="sys_red">' + this.chatInfoStr + '</div>' + g.chat.txt[0];
        if($("#chb0").hasClass("choosen"))
            $("#chattxt").html(g.chat.txt[0])
        chatScroll(-1)
    }
}

nerthus.setEnterMsg = function()
{
    if(this.EnterMsg)
        message(this.EnterMsg)
}

nerthus.isNarr = function(nick)
{
    return this.NerthusNarr.indexOf(nick) >= 0
}

nerthus.isRad = function(nick)
{
    return this.NerthusRad.indexOf(nick) >= 0
}

nerthus.isSpec = function(nick)
{
    return this.NerthusSpec.indexOf(nick) >= 0
}

nerthus.options = {'night': true, 'weather': true, 'zodiac': true, 'hideNpcs': false}
nerthus.loadSettings = function()
{
    if(typeof localStorage !== 'undefined')
    {
        if(localStorage.nerthus_options)
        {
            var options = JSON.parse(localStorage.nerthus_options)
            for(const opt in options)
                if(this.options.hasOwnProperty(opt))
                    this.options[opt] = options[opt]
        }
        this.storeSettings(this.options)
    }
}

nerthus.storeSettings = function(options)
{
    this.options = options
    if(typeof localStorage !== 'undefined')
        localStorage.nerthus_options = JSON.stringify(this.options)
}

nerthus.tips = {}
nerthus.tips.ranks = {NONE : -1, ADM : 0, SMG : 1, MG : 2, MC : 3, SMC : 4, BARD : 5, BARD_MC : 6, RADNY : 7}
nerthus.tips.rights = {ADM : 1, MG : 2, SMG : 16}
nerthus.tips.rights2rank = function(rights)
{
    if(rights & this.rights.ADM) return this.ranks.ADM
    if(rights & this.rights.SMG) return this.ranks.SMG
    if(rights & this.rights.MG)  return this.ranks.MG
    if(rights) return this.ranks.MC
    return this.ranks.NONE
}

nerthus.tips.rank = function(player)
{
    var rank = this.ranks.NONE
    if(player.rights)
        rank = this.rights2rank(player.rights)
    if(nerthus.isNarr(player.nick))
    {
        if(rank == this.ranks.MC)
            rank = this.ranks.BARD_MC
        else
            rank = this.ranks.BARD
    }
    if(nerthus.isRad(player.nick))
        rank = this.ranks.RADNY
    return rank != this.ranks.NONE ? g.names.ranks[rank] : ""
}

nerthus.tips.rank_ni = function (player)
{
    let rank = this.ranks.NONE
    if (player.rights)
        rank = this.rights2rank(player.rights)
    if (nerthus.isNarr(player.nick))
    {
        if (rank === this.ranks.MC)
            rank = this.ranks.BARD_MC
        else
            rank = this.ranks.BARD
    }
    if (nerthus.isRad(player.nick))
        rank = this.ranks.RADNY
    return rank === -1 ? "" : nerthus.ranks.rankName[rank]
}

nerthus.tips.title = function(player)
{
    //sprawdza czy vip, jeśli tak, to daje inny opis
    var title = nerthus.vips[parseInt(player.id)]
    if(title)
        return title
    if (player.lvl)
        return nerthus.lvlNames[Math.min(nerthus.lvlNames.length - 1, (parseInt(player.lvl) - 1) >> 3)]
    return ""
}

nerthus.tips.other = function(other)
{
    var tip = "<b>" + other.nick + "</b>"
    tip += other.clan ? "[" + other.clan.name + "]<br>" : ""
    tip += this.title(other)
    var rank = this.rank(other)
    tip += rank ? "<i>" + rank + "</i>" : ""
    tip += (other.attr & 1) ? "<img src=img/mute.gif>" : ""
    return tip
}

nerthus.tips.other_ni = function ()
{
    nerthus.othersDrawableList = Engine.others.getDrawableList
    Engine.others.getDrawableList = function ()
    {
        let list = nerthus.othersDrawableList()
        for (const i in list)
        {
            if (list[i].isPlayer)
                list[i].tip[0] = nerthus.tips.parseNiTip(list[i], false)
        }
        return list
    }
    return Engine.others.getDrawableList
}

nerthus.tips.hero = function(hero)
{
    var title = this.title(hero)
    var rank =  this.rank(hero)
    var tip = "<b><font color='white'>" + hero.nick + "</font></b>"
    tip += hero.clan ? "<center>[" + hero.clan.name + "]</center>" : ""
    tip += title ? "<center>" + title + "</center>" : ""
    tip += rank ? "<i><font color='red'>" + rank + "</font></i>" : ""
    return tip
}

nerthus.tips.hero_ni = function ()
{
    nerthus.heroCreateStrTip = Engine.hero.createStrTip
    Engine.hero.createStrTip = function ()
    {
        return nerthus.tips.parseNiTip(Engine.hero, true)
    }
    Engine.hero.tip[0] = Engine.hero.createStrTip()
    return Engine.hero.createStrTip
}

nerthus.tips.parseNiTip = function (player, isHero)
{
    let tip = ""
    if (isHero)
        tip += "<div class=\"rank\">" + _t("my_character", null, "map") + "</div>"
    const rank = this.rank_ni(player)
    if (rank)
        tip += "<div class=\"rank\">" + rank + "</div>"

    if (player.d.guest)
        tip += "<div class=\"rank\">" + _t("deputy") + "</div>"

    const nick = "<div class=\"nick\">" + player.d.nick + "</div>"
    const prof = player.d.prof ? "<div class=\"profs-icon " + player.d.prof + "\"></div>" : ""
    tip += "<div class=\"info-wrapper\">" + nick + prof + "</div>"

    if (parseInt(player.wanted) === 1)
        tip += "<div class=wanted></div>"
    if (player.d.clan)
        tip += "<div class=\"clan-in-tip\">[" + player.d.clan.name + "]</div>"

    const title = this.title(player.d)
    tip += "<div class=\"clan-in-tip\">" + title + "</div>"

    let buffs = ""
    const line = player.d.clan ? "<div class=\"line\"></div>" : ""
    const wanted = player.d.wanted ? "<div class=\"wanted-i\"></div>" : ""
    const bless = player.d.ble ? "<div class=\"bless\"></div>" : ""
    const mute = player.d.attr & 1 ? "<div class=\"mute\"></div>" : ""
    const kB = player.d.vip === "1" ? "<div class=\"k-b\"></div>" : ""
    const warn = player.d.attr & 2 ? "<div class=\"warn\"></div>" : ""

    if (bless !== "" || mute !== "" || kB !== "" || warn !== "" || wanted !== "")
        buffs = "<div class=\"buffs-wrapper\">" + line + wanted + bless + mute + kB + warn + "</div>"
    tip += buffs

    return tip
}

nerthus.tips.npcType = function(npc)
{
    if(npc.wt > 99)
        return "tytan"
    if(npc.wt > 79)
        return "heros"
    if(npc.wt > 29)
        return "elita III"
    if(npc.wt > 19)
        return "elita II"
    if(npc.wt > 9)
        return "elita"
    return ""
}

nerthus.tips.npcDanger = function(npc)
{
    if (npc.type == 2 || npc.type == 3)
    {
        var lvlDiff = npc.lvl - hero.lvl;
        if(lvlDiff < -13)
            return {style:'style="color:#888"', str:"Niewarty uwagi"}
        if(lvlDiff > 19)
           return {style:'style="color:#f50"', str:"Potężny przeciwnik"}
        if(lvlDiff > 9)
            return {style:'style="color:#ff0"', str:"Poważny rywal"}
        return {style:"", str:"Zwykły przeciwnik"}
    }
    return {style:"", str:""}
}

nerthus.tips.npc = function (npc)
{
    var tip = "<b>" + npc.nick + "</b>"
    if (npc.type == 4)
        return tip

    var type =  this.npcType(npc)
    tip += type ? "<i>" + type + "</i>" : ""

    if (npc.type <= 0)
        return tip

    var danger = this.npcDanger(npc)
    var grp = npc.grp ? ", w grupie" : ""
    tip += "<span " + danger.style + ">" + danger.str + grp + "</span>"
    return tip
}

nerthus.tips.start = function()
{
    nerthus.defer(function()
    {
        hero.rights = hero.uprawnienia
        $("#hero").attr('tip', this.hero.bind(this, hero))
    }.bind(this))

    g.tips.other = this.other.bind(this)
    g.tips.npc = this.npc.bind(this)
}

nerthus.tips.start_ni = function ()
{
    nerthus.loadSettings()
    if (typeof Engine.hero.tip === "undefined")
        setTimeout(this.start_ni.bind(this), 500)
    else
    {
        this.other_ni()
        this.hero_ni()
        API.addCallbackToEvent("clear_map_npcs",
            function ()
            {
                setTimeout(function ()
                {
                    nerthus.loadNewMapQueue()
                }, 500)
            })
    }
}

nerthus.onDefined = function (valueToBeDefined, callback)
{
    const valArr = valueToBeDefined.toString().split(".")
    const len = valArr.length
    let object = window
    for (let i = 0; i < len; i++)
    {
        if (typeof object[valArr[i]] === "undefined")
            return setTimeout(nerthus.onDefined.bind(this, valueToBeDefined, callback), 500)
        else
            object = object[valArr[i]]
    }
    callback()
}

nerthus.base = {}
nerthus.base.start = function()
{
    nerthus.loadSettings()
    nerthus.setChatInfo()
    nerthus.setEnterMsg()

    nerthus.startObservingMapChange_SI()
}
