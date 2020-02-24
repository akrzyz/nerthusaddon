import {setCollision} from './collision'

nerthus.worldEdit.addNpc = function (x, y, url, name, collision, map_id)
{
    if (typeof map_id === 'undefined' || parseInt(map_id) === map.id)
    {
        const img = new Image()
        const $npc = $('<div id="npc' + this.coordsToId(x,y) + '" class="npc nerthus-npc"></div>')
            .css({
                zIndex: y * 2 + 9,
                left: x * 32,
                top: y * 32 - 16
            })
            .appendTo('#base')
        img.onload = function ()
        {
            const width = img.width
            const height = img.height

            const tmpLeft = x * 32 + 16 - Math.round(width / 2)
            const wpos = Math.round(x) + Math.round(y) * 256
            let wat
            if (map.water && map.water[wpos])
                wat = map.water[wpos] / 4
            $npc.css({
                backgroundImage: 'url(' + img.src + ')',
                left: tmpLeft,
                top: y * 32 + 32 - height + (wat > 8 ? 0 : 0),
                width: (tmpLeft + width > map.x * 32 ? map.x * 32 - tmpLeft : width),
                height: height - (wat > 8 ? ((wat - 8) * 4) : 0)
            })
        }
        img.src = url

        if (name)
            $npc.attr({
                ctip: 't_npc',
                tip: '<b>' + name + '</b>'
            })
        if (collision)
            this.addCollision(x, y)

        this.npcs.push([$npc, x, y, url, name, collision, map_id])
    }
}

nerthus.worldEdit.addNpc_ni = function (x, y, url, name, collision, map_id)
{
    this.npcs.push([x, y, url, name, collision, map_id])
    if (typeof map_id === "undefined" || parseInt(map_id) === Engine.map.d.id)
        this.paintNpc_ni(x, y, url, name, collision, map_id)
}

nerthus.worldEdit.paintNpc_ni = function (x, y, url, name, collision, map_id)
{
    const exp = /(.*\/)(?!.*\/)((.*)\.(.*))/
    const match = exp.exec(url)

    const id = this.coordsToId(x, y)
    let data = {}
    data[id] = {
        actions: 0,
        grp: 0,
        nick: name === "" ? "Bez nazwy" : name,
        type: name === "" ? 4 : 0,
        wt: 0,
        x: x,
        y: y
    }
    console.log(data)
    if (match[4] === "gif")
    {
        data[id].icon = url
        const npath = CFG.npath
        CFG.npath = ""
        Engine.npcs.updateData(data)
        CFG.npath = npath
    }
    else
    {
        data[id].icon = "obj/cos.gif"
        Engine.npcs.updateData(data)
        const image = new Image()
        image.src = url

        const _x = 32 * x + 16 - Math.floor(image.width / 2)
        const _y = 32 * y + 32 - image.height
        const obj = {
            image: image,
            x: _x,
            y: _y,
            id: id,
            map_id: map_id
        }
        nerthus.worldEdit.additionalDrawList.push(obj)
    }


    if (collision && (typeof map_id === "undefined" || parseInt(map_id) === Engine.map.d.id))
        this.addCollision_ni(x, y)
    else
        this.deleteCollision_ni(x, y, 2) //apparently NI adds default collision when adding NPC
}


nerthus.worldEdit.readdNpcList_ni = function ()
{
    this.npcs.forEach(function (npc)
    {
        console.log(npc)
        console.log(parseInt(npc[5]))
        console.log(Engine.map.d.id)
        if (typeof npc[5] === "undefined" || parseInt(npc[5]) === Engine.map.d.id)
            nerthus.worldEdit.paintNpc_ni(npc[0], npc[1], npc[2], npc[3], npc[4], npc[5])
    })
}

nerthus.worldEdit.deleteNpc = function (x, y, map_id)
{
    if (typeof map_id === "undefined" || parseInt(map_id) === map.id)
    {
        $("#npc" + this.coordsToId(x, y)).remove()
        this.deleteCollision(x, y)
    }
}

nerthus.worldEdit.deleteNpc_ni = function (x, y, map_id)
{
    if (typeof map_id === "undefined" || parseInt(map_id) === Engine.map.d.id)
    {
        const id = this.coordsToId(x, y)
        if (Engine.npcs.getById(id))
        {
            Engine.npcs.removeOne(id)
        }
        for (const i in nerthus.worldEdit.additionalDrawList)
        {
            if (nerthus.worldEdit.additionalDrawList[i].id === id)
                delete nerthus.worldEdit.additionalDrawList[i]
            nerthus.worldEdit.additionalDrawList = nerthus.worldEdit.additionalDrawList.filter(function (el)
            {
                return el !== null
            })
        }
        this.deleteCollision_ni(x, y)
    }


    for (let i = 0; i < this.npcs.length; i++)
        if (this.npcs[i][0] === x && this.npcs[i][1] === y)
            if (typeof map_id === "undefined" || parseInt(map_id) === parseInt(this.npcs[i][5]))
                this.npcs.splice(i, 1)
}


function clickWrapper(npc, click_handler)
{
    if (!click_handler)
        return
    return function (event)
    {
        if (Math.abs(npc.x - hero.x) > 1 || Math.abs(npc.y - hero.y) > 1)
            hero.mClick(event)
        else
            click_handler()
    }
}

export function addNpc(npc)
{
    if (INTERFACE === 'NI')
    {
        const data = {}
        data[npc.id] = npc

        const npath = CFG.npath
        CFG.npath = ''
        Engine.npcs.updateData(data)
        CFG.npath = npath

        //this.dialog.list[npc.id] = npc.dialog TODO
        setCollision(npc)
        return data
    }
    else
    {
        const click = null
        //const click = npc.dialog ? this.dialog.open.bind(this.dialog, npc, 0) : null //TODO

        const $npc = $('<div id="npc' + npc.id + '" class="npc nerthus-npc"></div>')
            .css({
                backgroundImage: 'url(' + npc.icon + ')',
                zIndex: npc.y * 2 + 9,
                left: npc.x * 32,
                top: npc.y * 32 - 16,
                pointerEvents: npc.type === 4 ? 'none' : 'auto'
            })

        const img = new Image()
        img.onload = function ()
        {
            const width = img.width
            const height = img.height

            const tmpLeft = npc.x * 32 + 16 - Math.round(width / 2) + ((npc.type > 3 && !(width % 64)) ? -16 : 0)
            const wpos = Math.round(this.x) + Math.round(this.y) * 256
            let wat
            if (map.water && map.water[wpos])
                wat = map.water[wpos] / 4
            $npc.css({
                left: tmpLeft,
                top: npc.y * 32 + 32 - height + (wat > 8 ? 0 : 0),
                width: (tmpLeft + width > map.x * 32 ? map.x * 32 - tmpLeft : width),
                height: height - (wat > 8 ? ((wat - 8) * 4) : 0)
            })
        }
        img.src = npc.icon
        $npc.appendTo('#base')
        if (npc.nick)
            $npc.attr({
                ctip: 't_npc',
                tip: npc.nick
            })
        if (click) $npc.click(clickWrapper(npc, click))
        setCollision(npc)
        return $npc
    }


}