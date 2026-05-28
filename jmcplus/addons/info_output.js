var addon = {};

addon.ID = "info_output";

addon.Name = "Special information output";
/*
*/
addon.Init = 
    function() {
        this.patterns = [];
        this.suspend = [];
        JMCPlus.Storage.EnsureExistance(this.Config, "Patterns", 
            ["^(?:\x1b\\[(?:[0-9]{1,2};?)+m)*\\*(?:\x1b\\[(?:[0-9]{1,2};?)+m)*: (\\S+) "
            ,"^(?:\x1b\\[(?:[0-9]{1,2};?)+m)*(\\S+) (?:помечтал.?|спел.?|говорит.?|сказал.? всем|говорит вам|сказал.? \\S+|обратились к \\S+|шепчет вам на ухо|спросил.?|говорит группе|заорал.?|закричал.?|прогнусил.?|простонал.?|сказал.? расе|сказал.? клану|сказал.? ордену|сказал.? атакующим|сказал.? состязающимся) \'"
             ]);
        JMCPlus.Storage.EnsureExistance(this.Config, "PublicCommands", 
            ["^(мечта?|болта?|гну?|гра?) (.+)$"]);
        JMCPlus.Storage.EnsureExistance(this.Config, "PrivateCommands", 
            ["^(гг|г|ответ?|retell) (.+)$", 
            "^(сказ?|шепта?|tell) (\\S+) (.+)$"]);
        
        JMCPlus.Storage.EnsureExistance(this.Config, "Window", null);
        JMCPlus.Storage.EnsureExistance(this.Data, "SuspendPatterns", 
            []);
        JMCPlus.Storage.EnsureExistance(this.Data, "SuspendNames", 
            {});
        for (var i = 0; i < this.Config.Patterns.length; i++)
            this.patterns.push(new RegExp(this.Config.Patterns[i], "i"));
        for (var i = 0; i < this.Data.SuspendPatterns.length; i++)
            this.suspend.push(new RegExp(this.Data.Suspend[i], "i"));
        
        this.Config.Window = JMCPlus.AllocateWindow("Info", this.Config.Window, null, "info");
        
        this.PublicCommands = [];
        for (var i = 0; i < this.Config.PublicCommands.length; i++)
            this.PublicCommands.push(new RegExp(this.Config.PublicCommands[i], "i"));
        this.PrivateCommands = [];
        for (var i = 0; i < this.Config.PrivateCommands.length; i++)
            this.PrivateCommands.push(new RegExp(this.Config.PrivateCommands[i], "i"));
        
        this.PublicTransforms = [
            function(str) { return "&C" + str; },
            function(str) { return "&c" + str; },
            function(str) { return "&Y" + str; },
            function(str) { return "&g" + str; },
            function(str) { return "&O" + str; },
            function(str) { 
                var len = Math.round(str.length / 4);
                if (len < 1)
                    len = 1;
                var ret = "&g" + str.substr(0*len, len) +
                          "&G" + str.substr(1*len, 2*len) + 
                          "&g" + str.substr(3*len);
                return ret; 
            },
            function(str) { 
                var len = Math.round(str.length / 4);
                if (len < 1)
                    len = 1;
                var ret = "&O" + str.substr(0*len, len) +
                          "&Y" + str.substr(1*len, 2*len) + 
                          "&O" + str.substr(3*len);
                return ret; 
            },
            
            function(str) { return "&G " + str; },
            function(str) { return "&R " + str; },
            function(str) { return "&r" + str; },
            function(str) { return "&zЖ " + str; },
            function(str) { 
                var len = Math.round(str.length / 6);
                if (len < 1)
                    len = 1;
                var ret = "&z" + str.substr(0*len, len) +
                          "&w" + str.substr(1*len, len) + 
                          "&W" + str.substr(2*len, 2*len) + 
                          "&w" + str.substr(4*len, len) + 
                          "&z" + str.substr(5*len);
                return ret; 
            }
        ];
        this.PrivateTransforms = [
        /*
            function(str) { return "&W[R]  &R" + str; },
            function(str) { return "&R<&GGiltor&R>  &G" + str; },
            function(str) { return "&W(&RCorsair&W) &G" + str; },
            function(str) { return "&z..::го&cло&zс &cиз па&zсти::..  &R " + str; },
            function(str) { 
                var len = Math.floor(str.length / 6);
                if (len < 1)
                    len = 1;
                var ret = "&z" + str.substr(0*len, len) +
                          "&w" + str.substr(1*len, len) + 
                          "&W" + str.substr(2*len, 2*len) + 
                          "&w" + str.substr(4*len, len) + 
                          "&z" + str.substr(5*len);
                return ret; 
            }
            */
        ];
        
        JMCPlus.Storage.Flush(this);
    };

addon.Handlers = {};

addon.Handlers.OnInput = 
    function(line) {
        var match;
        if (addon.PublicTransforms.length > 0)
            for (var i = 0; i < addon.PublicCommands.length; i++)
                if ((match = addon.PublicCommands[i].exec(line)) != null) {
                    var rnd = Random.NextInt(0, addon.PublicTransforms.length - 1);
                    match[match.length - 1] = addon.PublicTransforms[rnd](match[match.length - 1]);
                    match.shift();
                    return match.join(' ');
                }
        if (addon.PrivateTransforms.length > 0)
            for (var i = 0; i < addon.PrivateCommands.length; i++)
                if ((match = addon.PrivateCommands[i].exec(line)) != null) {
                    var rnd = Random.NextInt(0, addon.PrivateTransforms.length - 1);
                    match[match.length - 1] = addon.PrivateTransforms[rnd](match[match.length - 1]);
                    match.shift();
                    return match.join(' ');
                }
    };

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var lines = promptdata[0];
        var match;
        var outputs = {};
        for (var i = 0; i < lines.length; i++) {
            var suspended = false;
            for (var j = 0; j < addon.suspend.length; j++)
                if (addon.suspend[j].test(lines[i])) {
                    suspended = true;
                    break;
                }
            if (suspended)
                continue;
            for (var j = 0; j < addon.patterns.length; j++)
                if ((match = addon.patterns[j].exec(lines[i])) != null) {
                    name = match[1];
                    if (!(name in addon.Data.SuspendNames)) {
                        if (name in outputs) {
                            outputs[name] = "";
                            //addon.Data.SuspendNames[name] = true;
                            //JMCPlus.Storage.Flush(addon);
                        } else {
                            outputs[name] = lines[i];
                        }
                    }
                    break;
                }
        }
        var prefix = "";
        for (name in outputs)
            if (outputs[name].length > 0) {
                if (prefix.length == 0)
                    prefix = "[" + (new Date()).toLocaleTimeString() + "] "
                var line = prefix + outputs[name];
                JMCPlus.Jmc.wOutput(addon.Config.Window, line);
            }
    };

JMCPlus.AddExtCommand("вигнор", 
    ["вигнор (.+)", "ignore (.+)"],
    function(arguments, executer) {
        var arg = arguments[0];
        if (arg in addon.Data.SuspendNames) {
            delete addon.Data.SuspendNames[arg];
            JMCPlus.Jmc.ShowMe(arg + " is no longer suspended");
        } else {
            addon.Data.SuspendNames[arg] = true;
            JMCPlus.Jmc.ShowMe(arg + " is now suspended");
        }
        JMCPlus.Storage.Flush(addon);
        return true;
    },
    addon,
    "вигнор <им€ игнорируемого>");

JMCPlus.AddExtCommand("вигнорвсе", 
    ["вигнорвсе (.+)", "ignoreall (.+)"],
    function(arguments, executer) {
        var arg = arguments[0];
        for (var i = 0; i < addon.suspend.length; i++)
            if (addon.suspend[i].source == arg) {
                addon.suspend.splice(i, 1);
                addon.Data.SuspendPatterns.splice(i, 1);
                JMCPlus.Jmc.ShowMe(arg + " is no longer suspended");
                JMCPlus.Storage.Flush(addon);
                return true;
            }
        addon.suspend.push(new RegExp(arg, "i"));
        addon.Data.SuspendPatterns.push(arg);
        JMCPlus.Storage.Flush(addon);
        JMCPlus.Jmc.ShowMe(arg + " is now suspended");
        return true;
    },
    addon,
    "вигнорвсе <шаблон игнорируемых строк>");

JMCPlus.AddAddon(addon);
