var addon = {};

addon.ID = "arda_items";

addon.Name = "Items information for Arda-MUD";

addon.re_ITEM_INFO_START = /^Предмет '(.+)'\s*$/; //+
addon.re_ITEM_TYPE = /^ это ([^\.,]+)(?:, эту вещь можно ([^\.]+))?\.?\s*$/; //+
addon.re_ITEM_PROPERTIES = /^Особые свойства: (.+)\s*$/; //+
addon.re_ITEM_PARAMS = /^Вес: ([0-9]+), стоимость: ([0-9]+), уровень: ([0-9\-]+)\.\s*$/; //+
addon.re_ITEM_STORING = /^(Вы не сможете хранить эту вещь|Хранение этой вещи будет стоить [0-9]+ монет.? в день)\.\s*$/;
addon.re_ITEM_DURABILITY = /^Прочность: ([0-9]+)\.\s*$/; //+
addon.re_ITEM_CHANGE_STAT = /^ИзменЯет (.+) на ([0-9\-]+)\.?\s*$/; //+
addon.re_ITEM_CHANGE_SKILL = /^Улучшает умение '([^']+)' на ([0-9\-]+)%\s*$/; //+
addon.re_ITEM_AFFECTS = /^Дает постоЯнный эффект: (.+)\s*$/;
addon.re_ITEM_ADD_RESIST = /^Дает сопротивлЯемость к (.+)\s*$/; //+
addon.re_ITEM_ADD_VULNERABILITY = /^Дает уЯзвимость к (.+)\s*$/; //+
addon.re_ITEM_CAPACITY = /^(.+) имеет (.+) емкость\.\s*$/; //+
addon.re_ITEM_WEAPON_CLASS = /^ОтноситсЯ к классу '([^']+)'\.\s*$/; //+
addon.re_ITEM_WEAPON_DAMAGE = /^Наносит врагу от ([0-9]+) до ([0-9]+) единиц.? повреждений \(в среднем ([0-9]+)\)(?: и может его отравить)?\.\s*$/; //+
addon.re_ITEM_CHARGES = /^Содержит ([0-9]+)(?: ?\( ?из ([0-9]+)\))? порци. ([0-9]+) уровнЯ магии '([^']+)'\.\s*$/; //+
addon.re_ITEM_SPELLS = /^Содержит заклинани. ([0-9]+) уровнЯ: ([^\.]+)\.\s*$/; //+
addon.re_ITEM_IS_ARTEFACT = /^Это артефакт!\s*$/; //+
addon.re_ITEM_THICKNESS = /^Толщина этой вещи \->([\:\*]{8})\s*$/; //+

addon.SHORT_MODIFIERS = 
    {
        "хитролл": "хр",
        "дамролл": "др",
        "здоровье": "хп",
        "магию": "ма",
        "армор класс": "АС",
        "класс доспехов": "АС"
    };

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Data, "Items", {});
		JMCPlus.Storage.EnsureExistance(this.Config, "MAX_LIST_LENGTH", 200);
        
        var a_code = "a".charCodeAt(0), z_code = "z".charCodeAt(0);
        var to_rename = {};
        for (var item in this.Data.Items) {
            var names = item.split(' ');
            var eng_names = [], rus_names = [];
            for (var i = 0; i < names.length; i++) {
                if (names[i].charCodeAt(0) > z_code || names[i].charCodeAt(0) < a_code)
                    rus_names.push(names[i]);
                else
                    eng_names.push(names[i]);
            }
            var new_names = eng_names.join(' ') + ' ' + rus_names.join(' ');
            if (new_names != item) {
                to_rename[item] = new_names;
            }
        }
        
        function clone_obj(obj) {
            return JSON.parse(JSON.stringify(obj));
            var ret = {};
            for (var member in obj)
                if (typeof obj[member] === 'object')
                    ret[member] = clone_obj(obj[member]);
                else
                    ret[member] = obj[member];
            return ret;
        }
        for (var item in to_rename) {
            if (!(to_rename[item] in this.Data.Items))
                this.Data.Items[to_rename[item]] = clone_obj(this.Data.Items[item]);
            else if (this.Data.Items[item].Comments.length > 0)
                this.Data.Items[to_rename[item]].Comments = 
                    this.Data.Items[to_rename[item]].Comments.concat(this.Data.Items[item].Comments);
            delete this.Data.Items[item];
        }
    };

addon.AddItem = 
    function(fullname, description) {
        if (typeof fullname !== 'string')
            return;
            
        if (fullname in this.Data.Items) {
            if (!("Comments" in this.Data.Items[fullname]))
                this.Data.Items[fullname].Comments = [];
            if (!("Properties" in this.Data.Items[fullname]))
                this.Data.Items[fullname].Properties = {};
            
            if ("Comments" in description && description.Comments.length > 0)
                this.Data.Items[fullname].Comments = [];
            
            this.Data.Items[fullname].Comments = this.Data.Items[fullname].Comments.concat(description.Comments);
            
            var runned_db = ("рунное" in this.Data.Items[fullname].Properties);
            var runned_it = ("рунное" in description.Properties);
            var magic_db = ("волшебное" in this.Data.Items[fullname].Properties);
            var magic_it = ("волшебное" in description.Properties);
            
            if (runned_it && !runned_db)
                return;
            if (runned_it == runned_db) {
                if (description.Type == "оружие" && magic_it && !magic_db)
                    return;
            }
            
            description.Comments = this.Data.Items[fullname].Comments;
            
            if (description.MinLevel > this.Data.Items[fullname].MinLevel)
                description.MinLevel = this.Data.Items[fullname].MinLevel;
            if (description.MaxLevel < this.Data.Items[fullname].MaxLevel)
                description.MaxLevel = this.Data.Items[fullname].MaxLevel;
        }
        this.Data.Items[fullname] = description;
    };

addon.ScanForItemsData = 
    function(lines) {
        var fullname = null;
        var description = {};
        var match;
        
        function my_split(str, delimiter) {
            var ret = {};
            var tmp = str.split(delimiter);
            for (var k = 0; k < tmp.length; k++)
                if (tmp[k].length > 0)
                    ret[tmp[k]] = true;
            return ret;
        }
        
        for (var i = 0; i < lines.length; i++) {
            var ln = JMCPlus.AnsiColors.RemoveANSI(lines[i]);
            if (ln.length == 0)
                continue;
            if (ln.substr(0, 1) == '<') {
                if (fullname != null)
                    this.AddItem(fullname, description);
                fullname = null;
            }
            if ((match = this.re_ITEM_INFO_START.exec(ln)) != null) {
                if (fullname != null)
                    this.AddItem(fullname, description);
                fullname = match[1];
                description = {"Properties": {}, "Modifiers": {}, "Skills": {}, "Comments": []};
            } else if (fullname != null) {
                if ((match = this.re_ITEM_TYPE.exec(ln)) != null) {
                    description.Type = match[1];
                    description.Usage = my_split(match[2].replace(/ или /g, ", "), ", ");
                } else if ((match = this.re_ITEM_PROPERTIES.exec(ln)) != null) {
                    var props = my_split(match[1], ' ');
                    if (match[1] == "нет")
                        description.Properties = {};
                    else
                        description.Properties = props;
                } else if ((match = this.re_ITEM_PARAMS.exec(ln)) != null) {
                    description.Weight = parseInt(match[1]);
                    description.Cost = parseInt(match[2]);
                    var tmp = match[3].split('-');
                    description.MinLevel = parseInt(tmp[0]);
                    description.MaxLevel = parseInt(tmp[tmp.length - 1]);
                } else if ((match = this.re_ITEM_STORING.exec(ln)) != null) {
                    //??
                } else if ((match = this.re_ITEM_DURABILITY.exec(ln)) != null) {
                    description.Durability = parseInt(match[1]);
                } else if ((match = this.re_ITEM_CHANGE_STAT.exec(ln)) != null) {
                    if (match[1] in description.Modifiers)
                        description.Modifiers[match[1]] += parseInt(match[2]);
                    else
                        description.Modifiers[match[1]] = parseInt(match[2]);
                } else if ((match = this.re_ITEM_CHANGE_SKILL.exec(ln)) != null) {
                    description.Skills[match[1]] = parseInt(match[2]);
                } else if ((match = this.re_ITEM_AFFECTS.exec(ln)) != null) {
                    description.Affects = my_split(match[1], ' ');
                } else if ((match = this.re_ITEM_ADD_RESIST.exec(ln)) != null) {
                    description.Resists = my_split(match[1], ' ');
                } else if ((match = this.re_ITEM_ADD_VULNERABILITY.exec(ln)) != null) {
                    description.Vulnerabilities = my_split(match[1], ' ');
                } else if ((match = this.re_ITEM_CAPACITY.exec(ln)) != null) {
                    description.Capacity = match[2];
                } else if ((match = this.re_ITEM_WEAPON_CLASS.exec(ln)) != null) {
                    description.WeaponClass = match[1];
                } else if ((match = this.re_ITEM_WEAPON_DAMAGE.exec(ln)) != null) {
                    description.MinDamage = parseInt(match[1]);
                    description.MaxDamage = parseInt(match[2]);
                    description.AvgDamage = parseInt(match[3]);
                } else if ((match = this.re_ITEM_CHARGES.exec(ln)) != null) {
                    description.MaxCharges = parseInt(match[2]);
                    if (isNaN(description.MaxCharges))
                        description.MaxCharges = parseInt(match[1]);
                    description.ChargedSpellLevel = parseInt(match[3]);
                    description.ChargedSpell = match[4];
                } else if ((match = this.re_ITEM_SPELLS.exec(ln)) != null) {
                    description.SpellsLevel = parseInt(match[1]);
                    description.Spells = my_split(match[2].replace(/' +'/g, "'"), "'");
                } else if ((match = this.re_ITEM_IS_ARTEFACT.exec(ln)) != null) {
                    description.IsArtefact = true;
                } else if ((match = this.re_ITEM_THICKNESS.exec(ln)) != null) {
                    description.Thickness = match[1];
                    description.ThicknessInt = parseInt(match[1].replace(/:/g, "0").replace(/\*/g, "1"),2);
                } else {
                    description.Comments.push(ln);
                }
            }
        }
        if (fullname != null) {
            this.AddItem(fullname, description);
            JMCPlus.Storage.Flush(this);
        }
    };

addon.ItemBriefDescription =
    function(fullname) {
        var i;
        var re_rus = /['a-z \-]*([а-я \-]+)['a-z \-]*/i;
        var rus_name = re_rus.exec(fullname);
        if (rus_name == null)
            rus_name = fullname;
        else
            rus_name = rus_name[1];
        var ret = "&Y" + rus_name + "&w: ";
        if (!(fullname in this.Data.Items))
            return ret + "&r: нет информации о таком предмете";
        var desc = this.Data.Items[fullname];
        ret += "&WL&G" + desc.MinLevel;
        if (desc.MaxLevel != desc.MinLevel)
            ret += "&W-&G" + desc.MaxLevel;
        ret += " ";
        i = 0;
        for (var mod in desc.Modifiers) {
            if (i == 0)
                ret += "&W[";
            else
                ret += " ";
            var negative_is_good = ((mod in this.SHORT_MODIFIERS) && (this.SHORT_MODIFIERS[mod] == "АС"));
            if (( negative_is_good && desc.Modifiers[mod] < 0) ||
                (!negative_is_good && desc.Modifiers[mod] > 0))
                ret += "&G";
            else
                ret += "&R";
            if (mod in this.SHORT_MODIFIERS)
                ret += this.SHORT_MODIFIERS[mod];
            else {
                ret += mod.replace("бросок по ", "*").replace("save vs ", "*").substr(0, 3);
            }
            if (desc.Modifiers[mod] > 0)
                ret += "+";
            ret += "" + desc.Modifiers[mod];
            i += 1;
        }
        if (i > 0)
            ret += "&W]";
        if ("AvgDamage" in desc)
            ret += " &Wдмг: &R" + desc.AvgDamage + " &W[&P" + desc.WeaponClass + "&W]";
        if ("Thickness" in desc)
            ret += " &W" + desc.Thickness;
        return ret;
    };

addon.ItemFullDescription =
    function(fullname) {
        var i;
        var re_rus = /['a-z \-]*([а-я \-]+)['a-z \-]*/i;
        var rus_name = re_rus.exec(fullname);
        if (rus_name == null)
            rus_name = fullname;
        else
            rus_name = rus_name[1];
        
        var ret = [];
        ret.push("&YШмотка &W" + rus_name + "&Y: ");
        ret.push("  &CПолное название и синонимы: &35&W" + fullname);
        if (!(fullname in this.Data.Items)) {
            ret.push("  &Rнет информации о таком предмете");
            return ret;
        }
        
        var desc = this.Data.Items[fullname];
        
        var line = "";
        line += "  &CЭто &W" + desc.Type;
        if (desc.IsArtefact == true)
            line += " (&Rартефакт!&W)";
        line += " &Cвесом &W" + desc.Weight + "&C, стомостью &Y" + desc.Cost;
        if (desc.Durability != null)
            line += "&C, прочностью &W" + desc.Durability;
        ret.push(line);
        
        if (desc.MaxLevel != desc.MinLevel)
            ret.push("  &CУровень: &20от &W" + desc.MinLevel + "&C до &W" + desc.MaxLevel);
        else
            ret.push("  &CУровень: &20&W" + desc.MinLevel);
        
        function dict_to_str(dict, replaces) {
            var ret = "";
            for (var key in dict) {
                if (ret.length > 0)
                    ret += ", ";
                var val;
                if (dict[key] == true)
                    val = key;
                else
                    val = key + ": " + dict[key];
                if (replaces != null)
                    val = val.replace(replaces[0], replaces[1]);
                ret += val;
            }
            return ret;
        }
        
        if ("WeaponClass" in desc)
            ret.push("  &CТип оружиЯ: &20&W" + desc.WeaponClass);
        if ("AvgDamage" in desc)
            ret.push("  &CПовреждения: &20&W" + desc.AvgDamage + "&C (от &W" + desc.MinDamage + "&C до &W" + desc.MaxDamage + "&C)");
        if ("Thickness" in desc)
            ret.push("  &CТолщина: &20&W" + desc.Thickness);
        
        if ("ChargedSpell" in desc)
            ret.push("  &CЗарЯжено: &20&W" + desc.MaxCharges + "&C зарЯдов '&W" + desc.ChargedSpell + "&C' уровнЯ &W" + desc.ChargedSpellLevel);
        if ("Spells" in desc)
            ret.push("  &CС заклами: &20&W" + dict_to_str(desc.Spells) + "&C уровнЯ &W" + desc.SpellsLevel);
        
        var mods = "";
        i = 0;
        for (var mod in desc.Modifiers) {
            if (i > 0)
                mods += "&W, ";
            mods += mod;
            var negative_is_good = ((mod in this.SHORT_MODIFIERS) && (this.SHORT_MODIFIERS[mod] == "АС"));
            if (( negative_is_good && desc.Modifiers[mod] < 0) ||
                (!negative_is_good && desc.Modifiers[mod] > 0))
                mods += "&G";
            else
                mods += "&R";
            if (desc.Modifiers[mod] > 0)
                mods += "+";
            mods += "" + desc.Modifiers[mod];
            i += 1;
        }
        if (mods.length > 0)
            ret.push("  &CМодфикаторы: &20&W" + mods);
        
        var usages = dict_to_str(desc.Usage, [/одеть /gi, "надеть "]);
        if (usages.length > 0)
            ret.push("  &CПрименение: &20&W" + usages);
        var props = dict_to_str(desc.Properties);
        if (props.length > 0)
            ret.push("  &CСвойства: &20&W" + props);
        var affects = dict_to_str(desc.Affects);
        if (affects.length > 0)
            ret.push("  &CДаёт эффекты: &20&W" + affects);
        var resists = dict_to_str(desc.Resists);
        if (resists.length > 0)
            ret.push("  &CДаёт сопротивлЯемость: &20&W" + resists);
        var vulnerabilities = dict_to_str(desc.Vulnerabilities);
        if (vulnerabilities.length > 0)
            ret.push("  &CДаёт уЯзвимость: &20&W" + vulnerabilities);
        var skills = dict_to_str(desc.Skills);
        if (skills.length > 0)
            ret.push("  &CУмениЯ: &20&W" + skills);
        
        if (desc.Comments != null && desc.Comments.length > 0) {
            ret.push("  &Cкомментарии:");
            for (var i = 0; i < desc.Comments.length; i++)
                ret.push("&10&g" + desc.Comments[i]);
        }
        
        return ret;
    };

addon.DisplayItemsList = 
    function(text, list) {
        JMCPlus.ShowWithColors("&Y" + text);
        if (list.length == 0)
            JMCPlus.ShowWithColors("&RNONE");
        for (var i = 0; i < list.length && i < this.Config.MAX_LIST_LENGTH; i++) {
            JMCPlus.ShowWithColors("  &W" + (i + 1) + ". &w" + addon.ItemBriefDescription(list[i]));
            if (list.length < 10) {
                var lines = addon.ItemFullDescription(list[i]);
                for (var j = 0; j < lines.length; j++)
                    JMCPlus.ShowWithColors("  " + lines[j]);
            }
        }
        if (list.length > this.Config.MAX_LIST_LENGTH)
            JMCPlus.ShowWithColors("&Y... another &G" + (list.length - this.Config.MAX_LIST_LENGTH) + " &Yitems");
    };

addon.Handlers = {};

addon.Handlers.OnPrompt = 
    function(promptdata) {
        addon.ScanForItemsData(promptdata[0]);
    };

JMCPlus.AddExtCommand("шмоткоммент",
    ["шмоткоммент (.+): (.+)", "itemcomment (.+): (.+)"],
    function(arguments, executer) {
        var re_item = new RegExp(arguments[0].replace("-", "\\-"), "i");
        
        var list = [];
        for (var item in addon.Data.Items)
            if (re_item.test(item))
                list.push(item);
        
        if (list.length == 0) {
            JMCPlus.ShowWithColors("&RНет шмоток по запросу <" + re_item.source + "> ");
        } else if (list.length > 1) {
            addon.DisplayItemsList("По запросу <" + re_item.source + "> найдено несколько шмоток, укажите более точное название", list);
        } else {
            if (!("Comments" in addon.Data.Items[list[0]]))
                addon.Data.Items[list[0]].Comments = [];
            if (arguments[1] == "очистить") {
                addon.Data.Items[list[0]].Comments = [];
                JMCPlus.ShowWithColors("&YУ шмотки <&W" + list[0] + "&Y> удалены все комментарии");
            } else {
                addon.Data.Items[list[0]].Comments.push(arguments[1]);
                JMCPlus.ShowWithColors("&YШмотке <&W" + list[0] + "&Y> добавлен комментарий: &C" + arguments[1]);
            }
            JMCPlus.Storage.Flush(addon);
        }
        return true;
    },
    addon,
    "шмоткоммент <название шмотки>: <комментарий>");

JMCPlus.AddExtCommand("шмотки+",
    ["шмотки\\+ (.+)\\.db", "items\\+ (.+)\\.db"],
    function(arguments, executer) {
        var lines = FS.ReadFile(arguments[0] + ".db").replace(/\r\n/g, "\n").split("\n");
        addon.ScanForItemsData(lines);
        return true;
    },
    addon,
    "шмотки+ <имя файла>.db");

JMCPlus.AddExtCommand("шмотка",
    ["шмотка (.+)", "item (.+)"],
    function(arguments, executer) {
        var re_item = new RegExp(arguments[0].replace("-", "\\-"), "i");
        
        var list = [];
        for (var item in addon.Data.Items)
            if (re_item.test(item))
                list.push(item);
        
        addon.DisplayItemsList("Шмотки по запросу <" + re_item.source + ">: ", list);
        return true;
    },
    addon,
    "шмотка <название шмотки>");

JMCPlus.AddExtCommand("шмотка-",
    ["шмотка- (.+)", "item- (.+)"],
    function(arguments, executer) {
        var re_item = new RegExp(arguments[0].replace("-", "\\-"), "i");
        
        var list = [];
        for (var item in addon.Data.Items)
            if (re_item.test(item))
                list.push(item);
        
        if (list.length == 0) {
            JMCPlus.ShowWithColors("&RНет шмоток по запросу <" + re_item.source + ">");
        } else if (list.length > 1) {
            addon.DisplayItemsList("По запросу <" + re_item.source + "> найдено несколько шмоток, укажите более точное название", list);
        } else {
            delete addon.Data.Items[list[0]];
            JMCPlus.Storage.Flush(addon);
            JMCPlus.ShowWithColors("&YШмотка <&W" + list[0] + "&Y> удалена");
        }
        
        return true;
    },
    addon,
    "шмотка- <название шмотки>");

JMCPlus.AddExtCommand("шмотка:",
    ["шмотка: (.+)", "item: (.+)"],
    function(arguments, executer) {
        var patterns = arguments[0].split(',');
        var re_patterns_plus = [], re_patterns_minus = [];
        
        for (var i = 0; i < patterns.length; i++)
            if (patterns[i].substr(0, 1) == '!')
                re_patterns_minus.push(new RegExp(patterns[i].substr(1).replace("-", "\\-"), "i"));
            else
                re_patterns_plus.push(new RegExp(patterns[i].replace("-", "\\-"), "i"));
        
        function success(parts) {
            for (var i = 0; i < re_patterns_plus.length; i++) {
                var ok = false;
                for (var j = 0; j < parts.length; j++)
                    if ((typeof parts[j] === 'string') && re_patterns_plus[i].test(parts[j])) {
                        ok = true;
                        break;
                    }
                if (!ok)
                    return false;
            }
            for (var i = 0; i < re_patterns_minus.length; i++) {
                var ok = true;
                for (var j = 0; j < parts.length; j++)
                    if ((typeof parts[j] === 'string') && re_patterns_minus[i].test(parts[j])) {
                        ok = false;
                        break;
                    }
                if (!ok)
                    return false;
            }
            return true;
        }
        
        var fields = ["Properties", "Modifiers", "Skills", "Usage", "Resists", "Vulnerabilities", "Spells"];
        var list = [];
        for (var item in addon.Data.Items) {
            var parts = [item, addon.Data.Items[item].Type, addon.Data.Items[item].WeaponClass, addon.Data.Items[item].ChargedSpell];
            for (var i = 0; i < fields.length; i++)
                if (fields[i] in addon.Data.Items[item])
                    for (field in addon.Data.Items[item][fields[i]])
                        parts.push(field);
            if (success(parts))
                list.push(item);
        }
        
        addon.DisplayItemsList("Шмотки по запросу <" + arguments[0] + ">: ", list);
        
        return true;
    },
    addon,
    "шмотка: <свойства, статсы, применение,...>");

JMCPlus.AddExtCommand("шмотка?",
    ["шмотка\\? ([0-9]{1,2})\\-([0-9]{1,2}) \\+([^ ]*) (.*)", "item\\? ([0-9]{1,2})\\-([0-9]{1,2}) \\+([^ ]*) (.*)"],
    function(arguments, executer) {
        var min_lvl = parseInt(arguments[0]);
        var max_lvl = parseInt(arguments[1]);
        var mods_list = arguments[2].replace(/армор.?класс/ig, "армор класс").split(',');
        var re_usage = new RegExp((arguments[3].length == 0 ? ".*" : arguments[3]), "i");
        
        var list = [];
        for (var item in addon.Data.Items) {
            var descr = addon.Data.Items[item];
            try {
                if (descr.MaxLevel < min_lvl)
                    continue;
                if (descr.MinLevel > max_lvl)
                    continue;
                
                var ok = false;
                for (var usage in descr.Usage)
                    if (re_usage.test(usage)) {
                        ok = true;
                        break;
                    }
                if (!ok)
                    continue;
                if (!(mods_list.length == 1 && mods_list[0].length == 0))
					ok = false;
                    for (var i = 0; i < mods_list.length; i++) {
                        if (mods_list[i] in descr.Modifiers) {
                            if (mods_list[i] == "армор класс") {
                                if (descr.Modifiers[mods_list[i]] < 0)
                                    ok = true;
                            } else {
                                if (descr.Modifiers[mods_list[i]] > 0)
                                    ok = true;
                            }
                        }
                        if (ok)
                            break;
                    }
                if (ok)
                    list.push(item);
            } catch(e) {
                JMCPlus.ErrorOutput(e, "items");
                break;
            }
        }
        JMCPlus.Jmc.ShowMe("");
        addon.DisplayItemsList("Найденные шмотки: ", list);
        
        return true;
    },
    addon,
    "шмотка? <мин. уровень>-<макс. уровень> +[<характеристики через запятую без пробелов>] [<как использовать>]");

JMCPlus.AddAddon(addon);
