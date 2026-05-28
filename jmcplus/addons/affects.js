var addon = {};

addon.ID = "affects";

addon.Name = "Affects monitoring";

addon.MANY_SPACES = "                                                                                ";

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Config, "Window", null);
        JMCPlus.Storage.EnsureExistance(this.Config, "MaxLines", 35);
        
        JMCPlus.Storage.EnsureExistance(this.Data, "ClearAffectsRegExp", 
            "(?:Вы находитесь под действием эффектов:\\s*$)|(?:Вы не находитесь под действием каких-либо эффектов\\.\\s*$)");
        
        JMCPlus.Storage.EnsureExistance(this.Data, "GeneralRegExps", 
        {
            "On" : ["^$AFFECT$\\s*$",
                   "^\\|[ 0-9]+\\|[ 0-9]+\\| $AFFECT$"],
            "Off": ["^$AFFECT$ больше на вас не действует\\.\\s*$"]
        });
        
        JMCPlus.Storage.EnsureExistance(this.Data, "AffectsList", 
            {   
                "сила предков"      : 
                {
                    "On"    : ["^Сила предков влилась в ваши жилы, вы стали сильнее\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                "драконий интеллект" : 
                {
                    "On"    : ["^Ваш интеллект повысилсЯ\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                "прозорливость" : 
                {
                    "On"    : ["^Вы стали мудрее и прозорливее\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                "быстрота" : 
                {
                    "On"    : ["^Ваши движениЯ ускорились\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                "выносливость троллЯ" : 
                {
                    "On"    : ["^Ваша выносливость увеличилась\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                "эльфийскаЯ красота" : 
                {
                    "On"    : ["^Ваши черты осветились эльфийской красотой\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Статсы"
                },
                
                "антимагическаЯ защита" : 
                {
                    "On"    : ["^Прозрачный экран, отталкивающий любую магию, окружил вас\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "эфирный щит" : 
                {
                    "On"    : ["^Вы защищены от влиЯниЯ вредных энергий\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "шкура троллЯ" : 
                {
                    "On"    : ["^Ваша кожа стала толстой, как шкура троллЯ\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "шкура дракона" : 
                {
                    "On"    : ["^Ваша кожа стала прочной, как шкура дракона\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "доблесть" : 
                {
                    "On"    : ["^Вы начали доблестно сопротивлЯтьсЯ любым попыткам оглушить и парализовать вас\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "закаменеть" : 
                {
                    "On"    : ["^Ваша кожа стала твердой, как камень\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "щит" : 
                {
                    "On"    : ["^Перед вами возник мерцающий волшебный щит\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                "доспех" : 
                {
                    "On"    : ["^Ваше тело окружилось подобием магического доспеха\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Основная защита"
                },
                
                "тени мрака" : 
                {
                    "On"    : ["^Черные тени закрывают вас от врагов\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Продвинутая защита"
                },
                "ледЯной щит" : 
                {
                    "On"    : ["^Хоровод смертельно холодных льдинок окружил вас\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Продвинутая защита"
                },
                "огненный щит" : 
                {
                    "On"    : ["^Языки бушующего пламени окружили вас обжигающей стеной\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Продвинутая защита"
                },
                "электрощит" : 
                {
                    "On"    : ["^Небольшие шаровые молнии начали кружить вокруг вашего тела\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Продвинутая защита"
                },
                "мистическаЯ сфера" : 
                {
                    "On"    : ["^Вокруг вас поЯвилась мистическаЯ сфера\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Продвинутая защита"
                },
                
                "плавать" : 
                {
                    "On"    : ["^Ваша плавучесть повысилась\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Передвижение"
                },
                "полет" : 
                {
                    "On"    : ["^Вы поднЯлись в воздух\\.\\s*$"],
                    "Off"   : [],
                    "Positive": null,
                    "Group" : "Передвижение"
                },
                "подводное дыхание" : 
                {
                    "On"    : ["^На вашей шее выросли жабры\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Передвижение"
                },
                "сквозь двери" : 
                {
                    "On"    : ["^Вы получили возможность проходить сквозь двери\\.\\s*$"],
                    "Off"   : [],
                    "Positive": null,
                    "Group" : "Передвижение"
                },
                "невидимость" : 
                {
                    "On"    : ["^Вы стали невидимым\\.\\s*$"],
                    "Off"   : [],
                    "Positive": null,
                    "Group" : "Передвижение"
                },
                
                "инфразрение" : 
                {
                    "On"    : ["^Вы получили способность видеть в темноте\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Наблюдательность"
                },
                "предвидение" : 
                {
                    "On"    : ["^Вы предвидите будущее\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Наблюдательность"
                },
                "видеть невидимое" : 
                {
                    "On"    : ["^Вы обрели возможность видеть невидимое\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Наблюдательность"
                },
                "истинное зрение" : 
                {
                    "On"    : ["^Вы видите все и всЯ\\.\\s*$"],
                    "Off"   : [],
                    "Positive": true,
                    "Group" : "Наблюдательность"
                }
                
            });
        
        this.Config.Window = JMCPlus.AllocateWindow("Affects", this.Config.Window, null);
        
        this.AffectedBy = {};
        this.LastAffectsShown = {};
        this.RefreshInternals();
    };

addon.RefreshInternals = 
    function() {
        var re_affect = /\$AFFECT\$/gi;
        
        this.re_clear_affects = new RegExp(this.Data.ClearAffectsRegExp, "");
        
        this.re_affects_on = {};
        this.re_affects_off = {};
        for (var affect in this.Data.AffectsList) {
            this.re_affects_on[affect] = [];
            for (var i = 0; i < this.Data.AffectsList[affect].On.length; i++)
                this.re_affects_on[affect].push(new RegExp(this.Data.AffectsList[affect].On[i].replace(re_affect, affect), "i"));
            for (var i = 0; i < this.Data.GeneralRegExps.On.length; i++)
                this.re_affects_on[affect].push(new RegExp(this.Data.GeneralRegExps.On[i].replace(re_affect, affect), "i"));
            
            this.re_affects_off[affect] = [];
            for (var i = 0; i < this.Data.AffectsList[affect].Off.length; i++)
                this.re_affects_off[affect].push(new RegExp(this.Data.AffectsList[affect].Off[i].replace(re_affect, affect), "i"));
            for (var i = 0; i < this.Data.GeneralRegExps.Off.length; i++)
                this.re_affects_off[affect].push(new RegExp(this.Data.GeneralRegExps.Off[i].replace(re_affect, affect), "i"));
        }
        
        this.Groups = {};
        for (var affect in this.Data.AffectsList) {
            var data = this.Data.AffectsList[affect];
            if (!(data.Group in this.Groups))
                this.Groups[data.Group] = [];
            this.Groups[data.Group].push(affect);
        }
        
        JMCPlus.Storage.Flush(this);
        this.Redisplay = true;
        this.ShowAffectsList();
    };

addon.ShowAffectsList = 
    function() {
        var groups_list = [];
        
        for (var group in this.Groups) {
            var list = [];
            
            var line = "  &W[ " + group + " ]";
            list.push(line);
            
            for( var i = 0; i < this.Groups[group].length; i++) {
                var affect = this.Groups[group][i];
                var color = "&z";
                if ((affect in this.AffectedBy) && (this.AffectedBy[affect] == true)) {
                    if (this.Data.AffectsList[affect].Positive == true)
                        color = "&G";
                    else if (this.Data.AffectsList[affect].Positive == false)
                        color = "&R";
                    else 
                        color = "&Y";
                }
                if (!(affect in this.LastAffectsShown) || this.LastAffectsShown[affect] != this.AffectedBy[affect]) {
                    if ((affect in this.AffectedBy) && (this.AffectedBy[affect] == true))
                        color += "[+] ";
                    else
                        color += "[-] ";
                } else {
                    color += "    ";
                }
                this.LastAffectsShown[affect] = this.AffectedBy[affect];
                line = color + affect;
                list.push(line);
            }
            groups_list.push(list);
        }
        
        var full_list = [];
        for (var i = 0; i < this.Config.MaxLines; i++)
            full_list.push({"Line": "", "Length": 0});
        
        var index = 0;
        var max_width = 0;
        for (var i = 0; i < groups_list.length; i++) {
            if (index + groups_list[i].length > this.Config.MaxLines) {
                for (var j = 0; j < full_list.length; j++) {
                    var n_spaces = 2 + max_width - full_list[j].Length;
                    if (n_spaces <= 0)
                        continue;
                    full_list[j].Line += this.MANY_SPACES.substr(0, n_spaces);
                    full_list[j].Length += n_spaces;
                }
                index = 0;
            }
            for (var j = 0; j < groups_list[i].length && index < this.Config.MaxLines; j++) {
                full_list[index].Line += groups_list[i][j];
                full_list[index].Length += JMCPlus.AnsiColors.RemoveSMAUG(groups_list[i][j]).length;
                if (full_list[index].Length > max_width)
                    max_width = full_list[index].Length;
                index++;
            }
            if (index < this.Config.MaxLines) {
                index++;
            }
        }
        
        JMCPlus.Cmd.Wclear(this.Config.Window);
        for (var i = 0; i < full_list.length; i++)
            JMCPlus.Jmc.wOutput(this.Config.Window, JMCPlus.AnsiColors.ConvertToANSI(full_list[i].Line));
        this.Redisplay = false;
    };

addon.Handlers = {};

addon.Handlers.OnConnected = 
    function(event) {
        addon.AffectedBy = {};
        addon.RefreshInternals();
    };

addon.Handlers.OnIncoming = 
    function(incoming) {
        var raw_text = JMCPlus.AnsiColors.RemoveANSI(incoming);
        if (addon.re_clear_affects.test(raw_text)) {
            for (affect in addon.AffectedBy)
                if (addon.AffectedBy[affect] == true) {
                    addon.AffectedBy[affect] = false;
                    addon.Redisplay = true;
                    JMCPlus.FireEvent("AffectOff", affect);
                }
            return;
        }
        for (var affect in addon.Data.AffectsList) {
            for (var i = 0; i < addon.re_affects_on[affect].length; i++)
                if (addon.re_affects_on[affect][i].test(raw_text)) {
                    if (!(affect in addon.AffectedBy) || (addon.AffectedBy[affect] != true)) {
                        addon.AffectedBy[affect] = true;
                        addon.Redisplay = true;
                        JMCPlus.FireEvent("AffectOn", affect);
                    }
                    break;
                }
            for (var i = 0; i < addon.re_affects_off[affect].length; i++)
                if (addon.re_affects_off[affect][i].test(raw_text)) {
                    if (!(affect in addon.AffectedBy) || (addon.AffectedBy[affect] != false)) {
                        addon.AffectedBy[affect] = false;
                        addon.Redisplay = true;
                        JMCPlus.FireEvent("AffectOff", affect);
                    }
                    break;
                }
        }
    };

addon.Handlers.OnPrompt = 
    function(promptdata) {
        if (addon.Redisplay)
            addon.ShowAffectsList();
    };

JMCPlus.AddExtCommand("эффект+", 
    ["эффект\\+ ([^\\.]+)\\.([^\\.]+)(?:\\.(хороший|плохой))?",
     "affect\\+ ([^\\.]+)\\.([^\\.]+)(?:\\.(positive|negative))?"],
    function(arguments, executer) {
        var group = arguments[0];
        var affect = arguments[1];
        var positive = null;
        if (arguments.length > 2) {
            var str = arguments[2].toLowerCase();
            if ((str == "хороший") || (str == "good"))
                positive = true;
            else if ((str == "плохой") || (str == "bad"))
                positive = false;
        }
        if (affect in addon.Data.AffectsList) {
            addon.Data.AffectsList[affect].Group = group;
            if (positive != null)
                addon.Data.AffectsList[affect].Positive = positive;
            JMCPlus.DebugOutput("affects: affect[" + affect + "]: group = [" + group + "], positive = " + positive);
        } else {
            addon.Data.AffectsList[affect] = 
            {
                "On"    : [],
                "Off"   : [],
                "Positive": positive,
                "Group" : group
            };
            JMCPlus.DebugOutput("New affect: [" + affect + "], group = [" + group + "], positive = " + positive);
        }
        addon.RefreshInternals();
        return true;
    },
    addon,
    "эффект+ <группа>.<название эффекта>[.(хороший|плохой)]");

JMCPlus.AddExtCommand("эффект-", 
    ["эффект\\- (.+)", 
     "affect\\- (.+)"],
    function(arguments, executer) {
        var affect = arguments[0];
        if (affect in addon.Data.AffectsList) {
            delete addon.Data.AffectsList[affect];
            addon.RefreshInternals();
        }
        return true;
    },
    addon,
    "эффект- <название эффекта>");

JMCPlus.AddExtCommand("эффект", 
    ["эффект (вкл|выкл) ([^\\.]+)\\.(.+)",
     "affect (on|off) ([^\\.]+)\\.(.+)"],
    function(arguments, executer) {
        var onoff_str = arguments[0].toLowerCase();
        var affect = arguments[1];
        var pattern = arguments[2];
        var onoff = (onoff_str == "on") || (onoff_str == "вкл");
        if (affect in addon.Data.AffectsList) {
            if (onoff)
                addon.Data.AffectsList[affect].On.push(pattern);
            else
                addon.Data.AffectsList[affect].Off.push(pattern);
            JMCPlus.DebugOutput("Add pattern for affect " + affect + " [" + (onoff ? "on" : "off") + "]: " + pattern);
            addon.RefreshInternals();
        }
        return true;
    },
    addon,
    "эффект (вкл/выкл) <название эффекта>.<шаблон строки>");

JMCPlus.AddEvent("AffectOn");
JMCPlus.AddEvent("AffectOff");

JMCPlus.AddAddon(addon);
