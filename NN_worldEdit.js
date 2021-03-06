nerthus.worldEdit = {}
nerthus.worldEdit.collisions = []
nerthus.worldEdit.npcs = []
nerthus.worldEdit.lights = []
nerthus.worldEdit.mapImages = []
nerthus.worldEdit.additionalDrawList = []
nerthus.worldEdit.nightDimValue = -1
nerthus.worldEdit.lightDrawList = []
nerthus.worldEdit.lightTypes = {}

nerthus.worldEdit.weatherDisplayOn = false
nerthus.worldEdit.weatherCurrentFrameNumbers = {
    "rain": -1,
    "snow": -1
}
nerthus.worldEdit.weatherLastFrameNumber = {
    "rain": -1,
    "snow": -1
}
nerthus.worldEdit.weatherInterval = {
    "rain": -1,
    "snow": -1
}
nerthus.worldEdit.weatherImages = {
    "rain": [],
    "snow": []
}
nerthus.worldEdit.currentWeatherEffects = []

nerthus.worldEdit.defaultEmotionsDraw = function () {}

// unified id for nerthus npcs
nerthus.worldEdit.coordsToId = function (x, y)
{
    return 50000000 + (x * 1000) + y
}

nerthus.worldEdit.setWeatherUrls = function ()
{
    const rainFramesCount = 3
    const snowFramesCount = 5
    const rainInterval = 100
    const snowInterval = 400


    this.weatherLastFrameNumber = {
        "rain": rainFramesCount - 1,
        "snow": snowFramesCount - 1
    }
    this.weatherInterval = {
        "rain": rainInterval,
        "snow": snowInterval
    }

    this.weatherImages.rain[0] = new Image()
    this.weatherImages.rain[0].src = nerthus.graf.rain
    for (let i = 1; i <= rainFramesCount; i++)
    {
        this.weatherImages.rain[i] = new Image()
        this.weatherImages.rain[i].src = nerthus.addon.fileUrl("img/weather/rain_frame_" + i + ".png")
    }

    this.weatherImages.snow[0] = new Image()
    this.weatherImages.snow[0].src = nerthus.graf.snow
    for (let i = 1; i <= snowFramesCount; i++)
    {
        this.weatherImages.snow[i] = new Image()
        this.weatherImages.snow[i].src = nerthus.addon.fileUrl("img/weather/snow_frame_" + i + ".png")
    }
}

nerthus.worldEdit.currentWeatherInterval = 0
nerthus.worldEdit.weatherIntervalClock = function ()
{
    nerthus.worldEdit.currentWeatherInterval += 100
    if (nerthus.worldEdit.currentWeatherInterval === 1600)
        nerthus.worldEdit.currentWeatherInterval = 0


    const len = nerthus.worldEdit.currentWeatherEffects.length
    for (let i = 0; i < len; i++)
    {
        const name = nerthus.worldEdit.currentWeatherEffects[i][0]
        if (nerthus.worldEdit.currentWeatherInterval % nerthus.worldEdit.weatherInterval[name] === 0)
        {
            nerthus.worldEdit.weatherCurrentFrameNumbers[name]++
            if (nerthus.worldEdit.weatherCurrentFrameNumbers[name] > nerthus.worldEdit.weatherLastFrameNumber[name])
                nerthus.worldEdit.weatherCurrentFrameNumbers[name] = 0
        }
    }
}

nerthus.worldEdit.setWeatherClock = function ()
{
    setInterval(this.weatherIntervalClock, 100)
}

nerthus.worldEdit.clearWeather = function ()
{
    $(".nWeather").remove()
}
nerthus.worldEdit.clearWeather_ni = function ()
{
    this.currentWeatherEffects = []
}
nerthus.worldEdit.displayWeatherEffect = function (name, opacity)
{
    $("<div class='nWeather'/>")
        .css({
            width: map.x * 32,
            height: map.y * 32,
            backgroundImage: 'url(' + nerthus.graf[name] + ')',
            zIndex: map.y * 2 + 9,
            position: "absolute",
            top: "0",
            left: "0",
            pointerEvents: 'none',
            opacity: opacity ? opacity : 1
        })
        .appendTo("#ground")
}

nerthus.worldEdit.displayWeatherEffect_ni = function (name, opacity)
{
    this.currentWeatherEffects.push([name, opacity])
}


nerthus.worldEdit.addCollision = function (x, y)
{
    g.npccol[x + 256 * y] = true
}

nerthus.worldEdit.addCollision_ni = function (x, y)
{
    Engine.map.col.set(x, y, 2)
}

nerthus.worldEdit.deleteCollision = function (x, y)
{
    delete g.npccol[x + 256 * y]
}

nerthus.worldEdit.deleteCollision_ni = function (x, y)
{
    Engine.map.col.unset(x, y, 2)
}

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

/*
 * There are two types of *map you can do
 * Normal *map that should work on every map
 * And *map with mapId that should only work on map with that id
 *
 * *map with map id always beat *map without map id
 *
 * To reset map with id use *resetMap [mapId]
 * To reset map without id use *map (without arguments)
 */
nerthus.worldEdit.checkMaps = function (mapId)
{
    for (let i = this.mapImages.length - 1; 0 <= i; i--)
    {
        if (i > 1)
        {
            for (let j = this.mapImages[i].length - 1; 0 <= j; j--)
                if (this.mapImages[i][j] && (this.mapImages[i][j].mapId === mapId || isNaN(this.mapImages[i][j].mapId)))
                    return this.mapImages[i][j].img
        }
        else if (this.mapImages[i] && (this.mapImages[i].mapId === mapId || isNaN(this.mapImages[i].mapId)))
            return this.mapImages[i].img
    }
}

nerthus.worldEdit.checkCurrentMap = function ()
{
    const customMapImage = this.checkMaps(map.id)
    if (customMapImage)
        $("#ground").css("background", "url(" + customMapImage.src + ")")
    else
        $("#ground").css("background", "")
}

nerthus.worldEdit.changeMap = function (url, layer, mapId)
{
    mapId = parseInt(mapId)

    if (layer > 1 && !this.mapImages[layer]) this.mapImages[layer] = []

    if (url)
    {
        const img = new Image()
        img.src = url

        if (layer > 1)
            this.mapImages[layer].push({
                img: img,
                mapId: mapId
            })
        else
            this.mapImages[layer] = {
                img: img,
                mapId: mapId
            }
    }
    else
    {
        if (layer > 1)
            this.mapImages[layer] = this.mapImages[layer].filter(function (el)
            {
                return el.mapId !== mapId
            })
        else
            delete this.mapImages[layer]
    }
    if (typeof map !== "undefined")
        this.checkCurrentMap()
}

nerthus.worldEdit.startMapChanging_ni = function ()
{
    //manipulation of map
    const tmpMapDraw = Engine.map.draw
    Engine.map.draw = function (Canvas_rendering_context)
    {
        //draw normal map
        tmpMapDraw.call(Engine.map, Canvas_rendering_context)

        //draw new maps on top of map
        const customMapImage = nerthus.worldEdit.checkMaps(Engine.map.d.id)
        if (customMapImage)
        {
            Canvas_rendering_context.drawImage(
                customMapImage,
                0 - Engine.map.offset[0],
                0 - Engine.map.offset[1])
        }


        //draw goMark (red X on ground that shows you where you've clicked)
        if (Engine.map.goMark)
            Engine.map.drawGoMark(Canvas_rendering_context)

        //draw additional things/png npcs after map
        const drawListLength = nerthus.worldEdit.additionalDrawList.length
        for (let i = 0; i < drawListLength; i++)
        {
            if (typeof nerthus.worldEdit.additionalDrawList[i].map_id === "undefined" ||
                nerthus.worldEdit.additionalDrawList[i].map_id === Engine.map.d.id)

                Canvas_rendering_context.drawImage(
                    nerthus.worldEdit.additionalDrawList[i].image,
                    nerthus.worldEdit.additionalDrawList[i].x - Engine.map.offset[0],
                    nerthus.worldEdit.additionalDrawList[i].y - Engine.map.offset[1])
        }
    }
}

nerthus.worldEdit.getCurrentDarknessPaint = function ()
{
    return {
        draw: function (e)
        {
            const style = e.fillStyle
            e.fillStyle = "#000"
            e.globalAlpha = nerthus.worldEdit.nightDimValue === -1 ? 0 : nerthus.worldEdit.nightDimValue
            e.fillRect(0 - Engine.map.offset[0], 0 - Engine.map.offset[1], Engine.map.width, Engine.map.height)
            e.globalAlpha = 1.0
            e.fillStyle = style
        },
        getOrder: function ()
        {
            return 950 //darkness bellow lights but above everything else
        }
    }
}

nerthus.worldEdit.getCurrentWeatherPaint = function ()
{
    return {
        draw: function (e)
        {
            if (nerthus.worldEdit.weatherDisplayOn)
            {
                const len = nerthus.worldEdit.currentWeatherEffects.length
                for (let i = 0; i < len; i++)
                {
                    const name = nerthus.worldEdit.currentWeatherEffects[i][0]
                    const opacity = nerthus.worldEdit.currentWeatherEffects[i][1]
                    const img = nerthus.worldEdit.weatherImages[name][nerthus.worldEdit.weatherCurrentFrameNumbers[name] + 1]

                    //check if img has been loaded correctly to not stop entire game in case of error
                    if (img.complete && img.naturalWidth !== 0)
                    {
                        const pattern = e.createPattern(img, "repeat")
                        const style = e.fillStyle
                        const alpha = e.globalAlpha
                        e.fillStyle = pattern
                        e.globalAlpha = opacity
                        e.translate(0 - Engine.map.offset[0], 0 - Engine.map.offset[1])
                        e.fillRect(0, 0, Engine.map.width, Engine.map.height)
                        e.translate(Engine.map.offset[0], Engine.map.offset[1])
                        e.fillStyle = style
                        e.globalAlpha = alpha
                    }
                }
            }
        },
        getOrder: function ()
        {
            return 940 //weather bellow lights and weather but above everything else
        }
    }
}

nerthus.worldEdit.startOtherChanging_ni = function ()
{
    const tmpEmotionsDraw = Engine.emotions.getDrawableList
    Engine.emotions.getDrawableList = function ()
    {
        let ret = tmpEmotionsDraw()
        //Darkness
        ret.push(nerthus.worldEdit.getCurrentDarknessPaint())
        //weather
        ret.push(nerthus.worldEdit.getCurrentWeatherPaint())
        return ret
    }
    this.defaultEmotionsDraw = Engine.emotions.getDrawableList
}


nerthus.worldEdit.startWorldEdit_ni = function ()
{
    this.startMapChanging_ni()
    this.startOtherChanging_ni()
}

nerthus.worldEdit.resetLightChanging_ni = function ()
{
    let tmpEmotionsDraw = this.defaultEmotionsDraw
    Engine.emotions.getDrawableList = function ()
    {
        let ret = tmpEmotionsDraw()
        //Lights
        let lightListLen = nerthus.worldEdit.lightDrawList.length || 0
        for (let i = 0; i < lightListLen; i++)
        {
            ret.push({
                draw: function (e)
                {
                    e.drawImage(
                        nerthus.worldEdit.lightDrawList[i].image,
                        nerthus.worldEdit.lightDrawList[i].x - Engine.map.offset[0],
                        nerthus.worldEdit.lightDrawList[i].y - Engine.map.offset[1])
                },
                getOrder: function ()
                {
                    //todo: make it bellow maploading
                    return 1000 //light always on top
                }
            })

        }
        return ret
    }
}

nerthus.worldEdit.addLights = function (lights)
{
    nerthus.worldEdit.lightDrawList = []
    for (const i in lights)
    {
        let lt = nerthus.worldEdit.lightTypes[lights[i].type]
        $('<div></div>')
            .css({
                background: 'url(' + lt.url + ')',
                width: lt.width,
                height: lt.height,
                zIndex: map.y * 2 + 12,
                position: 'absolute',
                left: parseInt(lights[i].x),
                top: parseInt(lights[i].y),
                pointerEvents: "none"
            })
            .addClass("nightLight")
            .attr("type", lights[i].type)
            .appendTo("#ground")
    }
}

nerthus.worldEdit.addLights_ni = function (lights)
{
    nerthus.worldEdit.lightDrawList = []
    for (const i in lights)
    {
        let lt = nerthus.worldEdit.lightTypes[lights[i].type]

        let image = new Image()
        image.src = lt.url
        let obj = {
            image: image,
            x: parseInt(lights[i].x),
            y: parseInt(lights[i].y)
        }
        nerthus.worldEdit.lightDrawList.push(obj)
    }
    nerthus.worldEdit.resetLightChanging_ni()
}

nerthus.worldEdit.changeLight = function (opacity)
{
    nerthus.worldEdit.nightDimValue = opacity

    let $night = $('#nerthus-night')
    if (!$night.length)
        $night = $('<div id="nerthus-night"></div>').appendTo('#ground')

    $night.css({
        height: map.y * 32,
        width: map.x * 32,
        zIndex: map.y * 2 + 11,
        opacity: opacity
    })
}

nerthus.worldEdit.changeLight_ni = function (opacity)
{
    if (typeof opacity === "undefined") opacity = 0

    nerthus.worldEdit.nightDimValue = opacity
}

nerthus.worldEdit.resetLight = function ()
{
    document.querySelectorAll("#ground .nightLight")
        .forEach(function (light)
        {
            light.parentNode.removeChild(light)
        })
}

nerthus.worldEdit.resetLight_ni = function()
{
    nerthus.worldEdit.lights = []
}

nerthus.worldEdit.changeGameNpc = function (npc)
{
    let $style = $('#nerthus-npc-changing')
    if (!$style.length)
        $style = $('<style id="nerthus-npc-changing" />').appendTo('head')

    $style.append('#npc' + npc.id + '{' +
        'background-repeat: no-repeat;' +
        'background-image: url(' + npc.newUrl + ') !important;' +
        '}')
}

nerthus.worldEdit.changeGameNpc_ni = function (npc)
{
    const callback = function (newNpc)
    {
        if (newNpc.d.id === npc.id.toString())
        {
            const img = new Image()
            img.src = npc.newUrl
            newNpc.sprite = img
            Object.defineProperty(newNpc, 'sprite', {
                get() {return img},
                set() {return img}
            })

            // Run only once
            // setTimeout so that it removes itself after all NPCs are checked by API,
            // otherwise it would throw error
            setTimeout(API.removeCallbackFromEvent.bind(API, 'newNpc', callback), 0)
        }
    }
    API.addCallbackToEvent('newNpc', callback)
}

nerthus.worldEdit.hideGameNpc = function (id, always)
{
    let $style = $('#nerthus-npc-hiding')
    if (!$style.length)
        $style = $('<style id="nerthus-npc-hiding" />').appendTo('head')

    if (nerthus.options.hideNpcs || always)
        $style.append('#npc' + id + '{display: none}')
}

nerthus.worldEdit.hideGameNpc_ni = function (id, always)
{
    if (nerthus.options.hideNpcs || always)
    {
        const callback = function (newNpc)
        {
            if (newNpc.d.id === id.toString())
            {
                // Remove in this fashion (instead of just calling .delete()
                // because we don't want to unset collisions when hiding
                API.callEvent('removeNpc', newNpc)
                Engine.npcs.removeOne(newNpc.d.id)
                Engine.emotions.removeAllFromSourceId(newNpc.d.id)

                // Run only once
                // setTimeout so that it removes itself after all NPCs are checked by API,
                // otherwise it would throw error
                setTimeout(API.removeCallbackFromEvent.bind(API, 'newNpc', callback), 0)
            }
        }
        API.addCallbackToEvent('newNpc', callback)
    }
}

nerthus.worldEdit.start = function ()
{
    nerthus.loadOnEveryMap(this.checkCurrentMap.bind(this))
}

nerthus.worldEdit.start_ni = function ()
{
    nerthus.onDefined("Engine.map.d.id", () =>
    {
        this.changeGameNpc = this.changeGameNpc_ni
        this.addCollision = this.addCollision_ni
        this.deleteCollision = this.deleteCollision_ni
        this.addNpc = this.addNpc_ni
        this.deleteNpc = this.deleteNpc_ni
        this.changeLight = this.changeLight_ni

        this.addLights = this.addLights_ni
        this.resetLight = this.resetLight_ni

        this.displayWeatherEffect = this.displayWeatherEffect_ni
        this.clearWeather = this.clearWeather_ni

        this.hideGameNpc = this.hideGameNpc_ni

        this.startWorldEdit_ni()

        nerthus.loadOnEveryMap(this.readdNpcList_ni.bind(this))
    })
}
