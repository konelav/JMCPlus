var addon = {};

addon.ID = "ticker";

addon.Name = "Ticks handler (dependent on prompter)";

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Config, "StatusBar", null);
        JMCPlus.Storage.EnsureExistance(this.Config, "TimeField", "TIME");
        
        JMCPlus.Storage.EnsureExistance(this.Data, "MinTickMs", 55000);
        JMCPlus.Storage.EnsureExistance(this.Data, "MaxTickMs", 90000);
        
        JMCPlus.Storage.EnsureExistance(this.Data, "LastTick", new Date());
        JMCPlus.Storage.EnsureExistance(this.Data, "LastTime", null);
        
        this.Config.StatusBar = JMCPlus.AllocateStatusBar(this.Config.StatusBar);
    };

addon.Handlers = {};

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var prompt = promptdata[1];
        if (!(addon.Config.TimeField in prompt)) {
            JMCPlus.DebugOutput("Can't find time field '" + addon.Config.TimeField + "' in " + JSON.stringify(prompt));
            return;
        }
        var time;
        try {
            time = parseInt(prompt[addon.Config.TimeField]);
        } catch(e) {
            JMCPlus.DebugOutput("Can't parse time field '" + addon.Config.TimeField + "' in " + JSON.stringify(prompt));
            return;
        }
        if (typeof addon.Data.LastTime !== 'number') {
            addon.Data.LastTime = time;
            return;
        }
        var dt = ((time + 24) - addon.Data.LastTime) % 24;
        if (dt == 0)
            return;
        if (dt != 1) {
            //addon.Data.LastTick = null;
            addon.Data.LastTick = new Date();
            addon.Data.LastTime = time;
            return;
        }
        var now = new Date();
        addon.Data.LastTick = now;
        addon.Data.LastTime = time;
        JMCPlus.ShowWithColors("&Y   *** ТИК! ***");
        JMCPlus.FireEvent("Tick", time);
    };

addon.Handlers.OnPPS = 
    function(totalseconds) {
        var now = new Date();
        var dt = (now - addon.Data.LastTick);
        var min_dt = (addon.Data.MinTickMs - dt) / 1000.0;
        var max_dt = (addon.Data.MaxTickMs - dt) / 1000.0;
        if (min_dt < 0)
            min_dt = 0;
        if (max_dt < 0)
            addon.Data.LastTick = new Date();
        var text;
        if (addon.Data.LastTick == null)
            text = "Tick in ?";
        else
            text = "До тика " + min_dt.toFixed(0) + ".." + max_dt.toFixed(0) + " с";
        JMCPlus.Jmc.SetStatus(addon.Config.StatusBar, text);
    };

JMCPlus.AddEvent("Tick");

JMCPlus.AddAddon(addon);
