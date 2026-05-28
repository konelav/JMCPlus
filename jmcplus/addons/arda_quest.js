var addon = {};

addon.ID = "arda_quest";

addon.Name = "Questing stats and helpers for Arda-MUD";

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Config, "StatusBar", null);
        //{<mobname>: {"MinLevel": x, "MaxLevel": y, "Places": {<areaname_roomname>: true, ...}, "QP": {<statistics>}, "Money": {<statistics>}}}
        JMCPlus.Storage.EnsureExistance(this.Data, "QuestMobs", null);
        
        this.ToNextQuest = null;
        this.ToQuestTimeout = null;
        
        this.Config.StatusBar = JMCPlus.AllocateStatusBar(this.Config.StatusBar);
    };

addon.UpdateQuestStatus = 
    function() {
    };

addon.Handlers = {};

addon.Handlers.OnConnected = 
    function(event) {
    };

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var lines = promptdata[0];
        
    };

addon.Handlers.OnTick = 
    function(time) {
        addon.UpdateQuestStatus();
    };

//JMCPlus.AddAddon(addon);
