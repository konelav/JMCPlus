var addon = {};

addon.ID = "arda_bots";

addon.Name = "Bots information for Arda-MUD";

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Data, "Exits", [
            "Вы не можете идти в этом направлении\\.",
            "У вас не хватит денег, чтобы заплатить за"
            ]);
        JMCPlus.Storage.EnsureExistance(this.Data, "Zaps", [
            "Вы легли на землю и погрузились в сон\\."
            ]);
        
        this.CharName = "";
        this.CharPassword = "";
        
        this.res_exit = [];
        for (var i = 0; i < this.Data.Exits.length; i++)
            this.res_exit.push(new RegExp(this.Data.Exits[i], "i"));
        this.res_zap = [];
        for (var i = 0; i < this.Data.Zaps.length; i++)
            this.res_zap.push(new RegExp(this.Data.Zaps[i], "i"));
    };

addon.Handlers = {};

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var lines = promptdata[0];
        if (addon.DoActions) {
            JMCPlus.Jmc.Parse("встать;пить бочк;сз;з;сз;с;з;с;куп рыб;есть рыб;ю;в;ю;юв;в;юв;очки;сохранить;спать");
            addon.DoActions = false;
        } else if (!addon.Fault && addon.CharName.length > 0) {
            for (var i = 0; i < lines.length; i++) {
                for (var j = 0; j < addon.res_exit.length; j++)
                    if (addon.res_exit[j].test(lines[i])) {
                        JMCPlus.Jmc.Parse("конец");
                        addon.Fault = true;
                        return;
                    }
            }
            for (var i = 0; i < lines.length; i++) {
                for (var j = 0; j < addon.res_zap.length; j++)
                    if (addon.res_zap[j].test(lines[i])) {
                        JMCPlus.Cmd.Zap();
                        return;
                    }
            }
        }
    };

addon.Handlers.OnConnect = 
    function(event) {
        
        
    };

addon.Handlers.OnPPM = 
    function(totalminutes) {
        if ((totalminutes % 10 == 0) && !addon.Fault && addon.CharName.length > 0) {
            addon.DoActions = true;
            JMCPlus.Jmc.Parse("#connect arda.pp.ru 4000");
        }
    };

addon.Handlers.OnIncoming = 
    function(line) {
        if (/Введите ваше имЯ \(английскими буквами\)/.test(line) && !addon.Fault && addon.CharName.length > 0) {
            JMCPlus.Jmc.Parse(addon.CharName + ";#daa " + addon.CharPassword);
        }
    };

JMCPlus.AddExtCommand("бот",
    ["бот \\:(\\S*) \\:(\\S*)", "bot \\:(\\S*) \\:(\\S*)"],
    function(arguments, executer) {
        addon.CharName = arguments[0];
        addon.CharPassword = arguments[1];
        addon.Fault = false;
        return true;
    },
    addon,
    "бот :[<логин>] :[<пароль>]");

JMCPlus.AddAddon(addon);
