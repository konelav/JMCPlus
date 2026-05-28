var addon = {};

addon.ID = "inp_replacer";

addon.Name = "Input replacer";

addon.Init = 
    function() {
        this.replaces = [];
        JMCPlus.Storage.EnsureExistance(this.Config, "Replaces", 
            {
                'ÿ': 'ß', 
                'ú': 'Ú',
                '\\((?:C|c|Ñ|ñ)\\)': '©',
                '\\((?:R|r\\))': '®',
                //'--': '—',
                '\\+-': '±',
                '>>': '»',
                '<<': '«',
                '\\.\\.\\.': '…'/*,
                '%0': '‰',
                '': '†',
                '': '‡',
                '': '‹',
                '': '›'*/
                
            });
        for (var str in this.Config.Replaces)
            if (str != null && str.length > 0)
                this.replaces.push([new RegExp(str, "g"), this.Config.Replaces[str]]);
    };

addon.Handlers = {};
addon.Handlers.OnInput = 
    function(input) {
        var ret = input;
        for (var i = 0; i < addon.replaces.length; i++)
            ret = ret.replace(addon.replaces[i][0], addon.replaces[i][1]);
        return ret;
    };

JMCPlus.AddAddon(addon);
