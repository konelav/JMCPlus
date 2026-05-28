var addon = {};

addon.ID = "prompter";

addon.Name = "Prompt line handler";

addon.PROMPT_BEGIN_RE = "›";
addon.PROMPT_END_RE = "»";
addon.PROMPT_DELIMITER_RE = "¦";

addon.re_PROMPT_GENERAL = 
    new RegExp(addon.PROMPT_BEGIN_RE + ".+" + addon.PROMPT_END_RE, "g");
addon.re_INDENT = 
    new RegExp("\\$([0-9]{1,3})\\$", "g");

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Config, "Window", null);
        JMCPlus.Storage.EnsureExistance(this.Config, "LinesBufferMaxSize", 100);
        
        var non_delimiter = "[^" + this.PROMPT_DELIMITER_RE + "]";
        
        JMCPlus.Storage.EnsureExistance(this.Data, "PromptSetup", 
            {
                "HP"    :   ["%h", "[0-9\\-\x1b\\[;m]+"],
                "MAX_HP":   ["%H", "[0-9]{1,5}"],
                "MA"    :   ["%m", "[0-9]{1,5}"],
                "MAX_MA":   ["%M", "[0-9]{1,5}"],
                "MV"    :   ["%v", "[0-9]{1,5}"],
                "MAX_MV":   ["%V", "[0-9]{1,5}"],
                "BL"    :   ["%b", "[0-9]{1,5}"],
                "MAX_BL":   ["%B", "[0-9]{1,5}"],
                
                "GOLD"  :   ["%g", "[0-9]{1,10}"],
                "EXP"   :   ["%x", "[0-9]{1,12}"],
                "NL_EXP":   ["%X", "[0-9]{1,12}"],
                "CB_EXP":   ["%y", "[0-9\\-]{1,10}"],
                "REP"   :   ["%a", non_delimiter + "+"],
                "STYLE" :   ["%S", non_delimiter + "+"],
                "TOD"   :   ["%T", "утро|день|вечер|ночь"],
                "TIME"  :   ["%t", "[0-9]{1,2}ч"],
                "AFFECT":   ["%A", non_delimiter + "+"],
                "EXITS" :   ["%e", non_delimiter + "+"],
                "ENEMY" :   ["%c", non_delimiter + "+"],
                "ENEMY_OF_ENEMY":   ["%C", non_delimiter + "+"]
            });
        JMCPlus.Storage.EnsureExistance(this.Data, "FullPrompt", 
            ["&wСейчас  : &C$HP$ &20&c$MA$ &35&G$MV$ &50&w| ЭКСП: &W$EXP$ &79&wзолото: &Y$GOLD$",
             "&wМаксимум: &C$MAX_HP$ &20&c$MAX_MA$ &35&G$MAX_MV$   &50&w|  ДСУ: &W$NL_EXP$ &79&wза бой: &G$CB_EXP$",
             "&W$TIME$ &w($TOD$) Выходы: <&W$EXITS$&w> Вы: [&W$REP$&w] [&P$AFFECT$&w] [&R$STYLE$&w]",
             "&wПротивник : &W$ENEMY$",
             "&wОн атакует: &W$ENEMY_OF_ENEMY$"]);
        JMCPlus.Storage.EnsureExistance(this.Data, "BriefPrompt", 
            "$HP$&G &c$MA$ &g$MV$  &W$EXITS$  &z$TOD$  &W$ENEMY$" + this.PROMPT_END_RE);
        JMCPlus.Storage.EnsureExistance(this.Data, "PromptCommand", 
            "prompt $PROMPT$; fprompt $PROMPT$");
        
        this.Config.Window = JMCPlus.AllocateWindow("Prompt", this.Config.Window, null);
        
        this.re_field = {};
        for (var field in this.Data.PromptSetup)
            this.re_field[field] = new RegExp("\\$" + field + "\\$", "g");
        
        this.LinesBuffer = [];
        this.SetFullPrompt(this.Data.FullPrompt);
        this.PromptData = {};
    };

addon.SetFullPrompt = 
    function(pattern) {
        var pattern_joined = pattern.join();
        
        this.PromptRaw = "";
        this.PromptFields = {};
        var index = 0;
        for (var field in this.Data.PromptSetup)
            if (this.re_field[field].test(pattern_joined)) {
                if (this.PromptRaw.length > 0)
                    this.PromptRaw += this.PROMPT_DELIMITER_RE;
                this.PromptRaw += "$" + field + "$";
                index += 1;
                this.PromptFields[index] = field;
            }
        this.PromptRaw = this.PROMPT_BEGIN_RE + this.PromptRaw + this.PROMPT_END_RE;
        
        var re = this.PromptRaw;
        for (var field in this.Data.PromptSetup)
            re = re.replace(this.re_field[field], "(" + this.Data.PromptSetup[field][1] + ")");
        
        this.re_PROMPT = new RegExp(re, "g");
        
        JMCPlus.Storage.Flush(this);
    };

addon.GeneratePromptCmd = 
    function() {
        var prompt = this.PromptRaw;
        for (var field in this.Data.PromptSetup)
            prompt = prompt.replace(this.re_field[field], this.Data.PromptSetup[field][0]);
        return this.Data.PromptCommand.replace(/\$PROMPT\$/g, prompt);
    };

addon.Handlers = {};

addon.Handlers.OnConnected = 
    function(event) {
        addon.LinesBuffer = [];
        addon.PromptData = {};
    };

addon.Handlers.OnIncoming = 
    function(incoming) {
        var match;
        if (!addon.re_PROMPT_GENERAL.test(incoming)) {
            match = null;
        } else if (addon.re_PROMPT == null) {
            match = null;
        } else {
            addon.re_PROMPT.lastIndex = 0;
            match = addon.re_PROMPT.exec(incoming);
        }
        if (match == null) {
            if (incoming.length > 0) {
                addon.LinesBuffer.push(incoming);
                if (addon.LinesBuffer.length > addon.Config.LinesBufferMaxSize)
                    addon.LinesBuffer.shift();
            }
        } else { //prompt
            var values = {};
            var rest = incoming.substr(match.lastIndex);
            for (var i = 1; i < match.length; i++)
                if (i in addon.PromptFields) {
                    var field = addon.PromptFields[i];
                    var delta = 0;
                    var value = JMCPlus.AnsiColors.ConvertToSMAUG(match[i]);
                    var raw_value = JMCPlus.AnsiColors.RemoveANSI(match[i]);
                    delta = parseInt(raw_value) - parseInt(addon.PromptData[field]);
                    addon.PromptData[field] = raw_value;
                    values[field] = value;
                    if (isNaN(delta)) {
                    } else if (delta > 0) {
                        values[field] += "&W[+" + delta + "]";
                    } else if (delta < 0) {
                        values[field] += "&w[" + delta + "]";
                    }
                }
            JMCPlus.Cmd.Wclear(addon.Config.Window);
            for (var i = 0; i < addon.Data.FullPrompt.length; i++) {
                var line = addon.Data.FullPrompt[i];
                for (var j in addon.PromptFields) {
                    var field = addon.PromptFields[j];
                    line = line.replace(addon.re_field[field], values[field])
                }
                JMCPlus.Jmc.wOutput(addon.Config.Window, JMCPlus.AnsiColors.ConvertToANSI(line));
            }
            JMCPlus.FireEvent("Prompt", [addon.LinesBuffer, addon.PromptData]);
            addon.LinesBuffer = [];
            if (typeof addon.Data.BriefPrompt === 'string') {
                var line = addon.Data.BriefPrompt;
                for (var j in addon.PromptFields) {
                    var field = addon.PromptFields[j];
                    line = line.replace(addon.re_field[field], values[field])
                }
                line = "&W[" + (new Date()).toLocaleTimeString() + "] " + line;
                if (rest.length > 0) {
                    line += " " + rest;
                    addon.LinesBuffer.push(rest);
                }
                return JMCPlus.AnsiColors.ConvertToANSI(line);
            } else {
                if (rest.length > 0)
                    return JMCPlus.AnsiColors.ConvertToANSI(rest);
                JMCPlus.Jmc.DropEvent();
                return "";
            }
        }
    };

JMCPlus.AddExtCommand("устпригл", 
    ["устпригл", "setprompt"],
    function(arguments, executer) {
        JMCPlus.Jmc.Parse(addon.GeneratePromptCmd());
        return true;
    },
    addon);

JMCPlus.AddEvent("Prompt");

JMCPlus.AddAddon(addon);
