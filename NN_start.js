/**
    Start dodatku. Najpierw pobiera wersje dodatku, która jest rewizją z mastera, potem resztę plików dodatku w tej wersji.
    Wersia jest w pliku version.json
    Jeżeli jest zdefiniowana zmienna localStorage.NerthusAddonDebug = true odpala debug moda i ciągnie świeże pliki bezpośrednio z master z pominięciem cdn
    Flaga localStorage.NerthusAddonDebug = true blokuje wczytywanie z localStorage
**/
try{

nerthus = {}
nerthus.addon = {}
nerthus.addon.version = "master"
nerthus.addon.filesPrefix = 'http://cdn.rawgit.com/akrzyz/nerthusaddon'
nerthus.addon.fileUrl = function(filename)
{
    return this.filesPrefix + "/" + this.version + "/" + filename;
}
nerthus.addon.store = function()
{
    if(typeof localStorage !== 'undefined' && !Boolean(eval(localStorage.NerthusAddonNoStorage)))
        localStorage.nerthus = NerthusAddonUtils.parser.stringify(nerthus)
}

//utilities for addon start up
NerthusAddonUtils = (function()
{
    var utils = {}
    utils.runner = (function()
    {
        var addonLoaded = function(){log('Nerthus addon started in version ' + nerthus.addon.version)}
        var runner = {}
        runner.run = function()
        {
            if(typeof localStorage !== 'undefined' && Boolean(eval(localStorage.NerthusAddonDebug)))
                this.__runInDebugMode()
            else if(typeof localStorage !== 'undefined' && localStorage.nerthus && !Boolean(eval(localStorage.NerthusAddonNoStorage)))
                this.__loadFromLocalStorage()
            else
                this.__loadFromGitHub()
        }
        runner.__runInDebugMode = function()
        {
            log("Nerthus addon in debug mode")
            nerthus.addon.filesPrefix = 'http://rawgit.com/akrzyz/nerthusaddon'
            nerthus.addon.version = "master"
            utils.gitHubLoader.__loadScripts(addonLoaded)
        }
        runner.__loadFromLocalStorage = function()
        {
            log("Load nerthus addon from local storage")
            utils.storageLoader.load(addonLoaded)
        }
        runner.__loadFromGitHub = function()
        {
            log("Load nerthus addon from github")
            utils.gitHubLoader.load(this.__loaded.bind(this))
        }
        runner.__loaded = function()
        {
            addonLoaded()
            this.__store()
        }
        runner.__store = function()
        {
            if(typeof localStorage !== 'undefined')
            {
                nerthus.addon.store()
                log("Nerthus addon stored")
            }
        }
        return runner
    })()

    utils.gitHubLoader = (function()
    {
        var loader = {}
        loader.load = function(onLoaded)
        {
            utils.versionLoader.load(function(version)
            {
                nerthus.addon.version = version
                this.__loadScripts(onLoaded)
            }.bind(this))
        }
        loader.__loadScripts = function(onLoaded)
        {
            utils.scriptsLoader.load(['NN_dlaRadnych.js'], function(){
                utils.scriptsLoader.load(['NN_base.js'], function(){
                    utils.scriptsLoader.load(nerthus.scripts, onLoaded)
            })});
        }
        return loader
    })()

    utils.storageLoader = (function()
    {
        var loader = {}
        loader.load = function(onLoaded)
        {
            nerthus = utils.parser.parse(localStorage.nerthus)
            this.__run()
            if(typeof onLoaded === 'function')
                onLoaded()
            utils.versionLoader.load(this.__checkVersion)
        }
        loader.__run = function()
        {
            for(var i in nerthus) try
            {
                if(typeof nerthus[i] === 'object' && typeof nerthus[i].start === 'function')
                    nerthus[i].start()
            }
            catch(error){log("nerthus." + i + " : " + error.message)}
        }
        loader.__checkVersion = function(version)
        {
            if(version != nerthus.addon.version)
            {
                log("Nerthus addon has not actual version")
                delete localStorage.nerthus
            }
        }
        return loader
    })()

    utils.versionLoader = (function()
    {
        var loader = {}
        loader.__url = "http://raw.githubusercontent.com/akrzyz/nerthusaddon/master/version.json"
        loader.load = function(onLoaded)
        {
            $.getJSON(this.__url, function(data)
            {
                if(typeof onLoaded === 'function')
                    onLoaded(data.version)
            })
        }
        return loader
    })()

    utils.scriptsLoader = (function()
    {
        var loader = {}
        loader.__to_load = 0
        loader.__callback = null
        loader.load = function (files, callback)
        {
            this.__callback = callback
            this.__to_load += files.length

            if(this.__to_load === 0)
                this.__callback()

            for(var i in files)
                $.getScript(nerthus.addon.fileUrl(files[i]), this.__loaded.bind(this))
        }
        loader.__loaded = function()
        {
            this.__to_load--
            if(this.__to_load === 0 && typeof this.__callback === 'function')
                this.__callback()
        }
        return loader
    })()

    utils.parser = (function()
    {
        var parser = {}
        parser.stringify = function(obj)
        {
            return JSON.stringify(obj, this.__stringifyFunction)
        }
        parser.__stringifyFunction = function(key,val)
        {
            if(typeof val === "function")
                return "("+ val.toString() +")"
            return val
        }
        parser.parse = function(obj)
        {
            return JSON.parse(obj, this.__parseFunction)
        }
        parser.__parseFunction = function(key,val)
        {
            if(typeof val === "string" && val.indexOf("function") === 1)
                return eval(val)
            return val
        }
        return parser
    })()
    return utils
})()

NerthusAddonUtils.runner.run()

}catch(e){log('NerthusStart Error: '+e.message,1)}
