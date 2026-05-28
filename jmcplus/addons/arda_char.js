var addon = {};

addon.ID = "arda_char";

addon.Name = "Character information for Arda-MUD";

addon.re_CHAR_INFO_NAME = /^(\S{3,20}) (.*)\.$/;
addon.re_CHAR_INFO_START = /^-----------------------------------------------------------------------------$/;

addon.re_CHAR_INFO_HEADER1 = [/^”ровень: ([0-9]{1,2})\s+–аса : ([^ ]+)\s*¬ы провели здесь ([0-9]+) часов$/, "Level", "Race", "HoursOnLine"];
addon.re_CHAR_INFO_HEADER2 = [/^¬озраст: ([0-9]{1,2})\s+ ласс: ([^ ]+)\s*»граете с: (.+)$/, "Age", "Class", "PlaySince"];

addon.re_CHAR_INFO_LINE1  = [/^—ила     : ([0-9]{1,2})\(([0-9]{1,2})\)\s*(?:HitRoll: ([0-9\-]{1,3}))?(?:\s+Ќадежность заклинаний\s*:\s*([0-9\-]{1,3}))?\s*$/, "Str", "Str0", "Hitroll", "RelSpells"];
addon.re_CHAR_INFO_LINE2  = [/^»нтеллект: ([0-9]{1,2})\(([0-9]{1,2})\)\s*(?:DamRoll: ([0-9\-]{1,3}))?(?:\s+Ќадежность умений\s*:\s*([0-9\-]{1,3}))?\s*$/, "Int", "Int0", "Damroll", "RelSkills"];
addon.re_CHAR_INFO_LINE3  = [/^ћудрость : ([0-9]{1,2})\(([0-9]{1,2})\)\s*ƒоспехи  : (.+)(?:\s+—пасбросок по стойкости\s*:\s*([0-9\-]{1,3}))?\s*$/, "Wis", "Wis0", "Armor", "SvS"];
addon.re_CHAR_INFO_LINE4  = [/^ѕроворн  : ([0-9]{1,2})\(([0-9]{1,2})\)\s*–епутация: (\S+)(?:\s+—пасбросок по рефлексам\s*:\s*([0-9\-]{1,3}))?\s*$/, "Dex", "Dex0", "Alignment", "SvR"];
addon.re_CHAR_INFO_LINE5  = [/^—ложение : ([0-9]{1,2})\(([0-9]{1,2})\)\s*¬ы (стоите|сидите|спите|отдыхаете) (?:\s+—пасбросок по воле\s*:\s*([0-9\-]{1,3}))?\s*$/, "Con", "Con0", "State", "SvW"];
addon.re_CHAR_INFO_LINE61 = [/^ѕривлекат: ([0-9]{1,2})\(([0-9]{1,2})\)\s*¬ес вещей: ([0-9]{1,3})\s*\/ не более ([0-9]{1,3})\s*¬ы не убегаете из боя\s*$/, "Cha", "Cha0", "ItemsWeight", "ItemsWeightMax"];
addon.re_CHAR_INFO_LINE62 = [/^ѕривлекат: ([0-9]{1,2})\(([0-9]{1,2})\)\s*¬ес вещей: ([0-9]{1,3})\s*\/ не более ([0-9]{1,3})\s*”бегаете при ([0-9]{1,4}) здоровья\s*$/, "Cha", "Cha0", "ItemsWeight", "ItemsWeightMax", "FleeHP"];;
addon.re_CHAR_INFO_LINE7  = [/^”дача    : ([0-9]{1,2})\(([0-9]{1,2})\)\s*¬ещей: ([0-9]{1,3})\s*\/ не более ([0-9]{1,3})\s*—тиль боя: (.+)\s*$/, "Lck", "Lck0", "ItemsCount", "ItemsCountMax", "FightStyle"];

addon.re_CHAR_INFO_LINE8  = [/^ѕрактик:\s*([0-9]{1,3})\s*«доровья: ([0-9\-]{1,4})\s*из\s*([0-9]{1,4})\s*—трок в листе: ([0-9]{1,3})/, "PracCount", "HP", "HP_MAX", "LinesCount"];
addon.re_CHAR_INFO_LINE9  = [/^ќпыт :\s*([0-9]{1,12})\s*ћагии : ([0-9\-]{1,4})\s*из\s*([0-9]{1,4})\s*MKills:\s*([0-9]{1,9})\s/, "EXP", "MA", "MA_MAX", "MobKills"];
addon.re_CHAR_INFO_LINE10 = [/^ƒенег :\s*([0-9]{1,12})\s*ƒвижения: ([0-9\-]{1,4})\s*из\s*([0-9]{1,4})\s*MDeaths:\s*([0-9]{1,4})\s/, "Money", "MV", "MV_MAX", "MobDeaths"];
addon.re_CHAR_INFO_LINE11 = [/^QP    :\s*([0-9]{1,6})\s+/, "QP"];
addon.re_CHAR_INFO_LINE12 = [/^”сталость \(([:\*]+)\) (.+)$/, "MentalState"];
addon.re_CHAR_INFO_LINE13 = [/^языки: (.+)$/, "Languages"];

addon.re_CHAR_INFO_LINE14 = [/^Ѕожество: ([^ ]+)\s+‘авор: (.+)$/, "Deity", "Favor"];

addon.re_INVENTORY_START = /^¬ы несете с собой:\s*$/;
addon.re_INVENTORY_LINE = /^\s*(\S.*?)(?: \(([0-9]+)\))?$/;

addon.re_EQUIPMENT_START = /^Ќа вас надето:\s*$/;
addon.re_EQUIPMENT_LINE = /^<\s*(\S.*\S)\s*>\s*\((.)\)\s*(\S.*\S)\s*$/;

addon.re_ITEM_PROPERTY = /(?:\(\*¬олшебное\*\)|\(—ветится\)|\(√удит\)|\(Ќевидимо\)|\( расная јура\)|\(Ѕелая јура\)|\(ѕрозрачное\)|\(ќтравлено\)|\(–унное\))/g;

addon.Init = 
    function() {
        //JMCPlus.Storage.EnsureExistance(this.Data, "Items", {});
        //JMCPlus.Storage.EnsureExistance(this.Data, "ShortToLongNames", {});
        
        this.info_lines = [this.re_CHAR_INFO_HEADER1, this.re_CHAR_INFO_HEADER2,
                           this.re_CHAR_INFO_LINE1, this.re_CHAR_INFO_LINE2, this.re_CHAR_INFO_LINE3,
                           this.re_CHAR_INFO_LINE4, this.re_CHAR_INFO_LINE5, this.re_CHAR_INFO_LINE61,
                           this.re_CHAR_INFO_LINE62, this.re_CHAR_INFO_LINE7, this.re_CHAR_INFO_LINE8, 
                           this.re_CHAR_INFO_LINE9, this.re_CHAR_INFO_LINE10, this.re_CHAR_INFO_LINE11, 
                           this.re_CHAR_INFO_LINE12, this.re_CHAR_INFO_LINE13, this.re_CHAR_INFO_LINE14];
        
        this.CharParameters = {};
        this.CharInventory = {};
        this.CharEquipment = {};
    };

addon.SetCharParameter = 
    function(param, value) {
        if(this.CharParameters[param] != value) {
            JMCPlus.FireEvent("CharParameterChanged", [param, this.CharParameters[param], value]);
            this.CharParameters[param] = value;
        }
    };

addon.ScanForCharDescription = 
    function(lines) {
        var match;
        var reading_score;
        var reading_inv;
        var reading_eq;
        
        reading_score = reading_inv = reading_eq = false;
        
        var inventory = {};
        for (var item in this.CharInventory)
            inventory[item] = this.CharInventory[item];
        
        var equipment = {};
        for (var item in this.CharEquipment)
            equipment[item] = this.CharEquipment[item];
        
        for (var i = 0; i < lines.length; i++) {
            var ln = JMCPlus.AnsiColors.RemoveANSI(lines[i]);
            if (this.re_CHAR_INFO_START.test(ln)) {
                if (i > 0 && (match = this.re_CHAR_INFO_NAME.exec(JMCPlus.AnsiColors.RemoveANSI(lines[i-1]))) != null) {
                    this.SetCharParameter("Name", match[1]);
                    this.SetCharParameter("Title", match[2]);
                    reading_inv = reading_eq = false;
                    reading_score = true;
					JMCPlus.DebugOutput("Reading character score");
                }
            } else if (this.re_INVENTORY_START.test(ln)) {
                reading_score = reading_eq = false;
                reading_inv = true;
                inventory = {};
				JMCPlus.DebugOutput("Reading inventory list");
            } else if (this.re_EQUIPMENT_START.test(ln)) {
                reading_inv = reading_score = false;
                reading_eq = true;
                equipment = {};
				JMCPlus.DebugOutput("Reading equipment list");
            } else if (reading_score) {
                for (var j = 0; j < this.info_lines.length; j++) {
                    if ((match = this.info_lines[j][0].exec(ln)) != null) {
                        for (var k = 1; k < this.info_lines[j].length; k++) {
                            var value;
                            try {
                                value = parseInt(match[k]);
                                if (isNaN(value))
                                    value = match[k]
                            } catch(e) {
                                value = match[k];
                            }
                            this.SetCharParameter(this.info_lines[j][k], value);
                        }
                        break;
                    }
                }
            } else if (reading_inv) {
                if ((match = this.re_INVENTORY_LINE.exec(ln)) != null) {
                    var item = match[1].replace(this.re_ITEM_PROPERTY, "");
                    if (match[2] == null || isNaN(parseInt(match[2])))
                        inventory[item] = 1;
                    else
                        inventory[item] = parseInt(match[2]);
                }
            } else if (reading_eq) {
                if ((match = this.re_EQUIPMENT_LINE.exec(ln)) != null) {
                    var item = match[3].replace(this.re_ITEM_PROPERTY, "");
                    if (item == "---")
                        item = "";
                    if (match[1] in equipment) {
                        if (typeof equipment[match[1]] === 'string')
                            equipment[match[1]] = [equipment[match[1]]];
                        equipment[match[1]].push(item);
                    } else {
                        equipment[match[1]] = item;
                    }
                }
            }
        }
        
        for (var item in inventory)
            if (inventory[item] != this.CharInventory[item])
                JMCPlus.FireEvent("CharInventoryChanged", [item, this.CharInventory[item], inventory[item]]);
        for (var item in this.CharInventory)
            if (!(item in inventory))
                JMCPlus.FireEvent("CharInventoryChanged", [item, this.CharInventory[item], inventory[item]]);
        this.CharInventory = inventory;
        
        for (var item in equipment)
            if (equipment[item] != this.CharEquipment[item])
                JMCPlus.FireEvent("CharEquipmentChanged", [item, this.CharEquipment[item], equipment[item]]);
        for (var item in this.CharEquipment)
            if (!(item in equipment))
                JMCPlus.FireEvent("CharEquipmentChanged", [item, this.CharEquipment[item], equipment[item]]);
        this.CharEquipment = equipment;
    };

addon.AvailableItemsList = 
    function(pattern, character) {
        if (!("arda_items" in JMCPlus.Addons))
            return [];
        if (character == null)
            character = this.CharParameters;
        
        var aligns = {
            "исчадие": "нельзя_плохим",
            "неисправимый": "нельзя_плохим",
            "злой": "нельзя_плохим",
            "плохой": "нельзя_нейтр",
            "неизвестный": "нельзя_нейтр",
            "достойный": "нельзя_нейтр",
            "честный": "нельзя_хорош",
            "добрый": "нельзя_хорош",
            "светлейший": "нельзя_хорош"
        };
        
        var classes = {
            "Ћекарь": "нельзя_лекарям",
            "¬олшебник": "нельзя_волшеб",
            "–ыцарь": "нельзя_воинам",
            "ѕрорицатель": "нельзя_волшеб",
            "—ледопыт": "нельзя_воинам",
            "ƒикарь": "нельзя_дикарям",
            "¬ор": "нельзя_ворам",
            "¬оин": "нельзя_воинам",
            "”мертвие": "нельзя_умертв"
        };
        
        var forbidden_props = {};
        
        forbidden_props["личное"] = true;
        forbidden_props["нехранимое"] = true;
        forbidden_props["лояльное"] = true;
        forbidden_props["рунное"] = true;
        forbidden_props[aligns[character.Alignment]] = true;
        forbidden_props[classes[character.Class]] = true;
        
        var items = JMCPlus.Addons["arda_items"].Data.Items;
        var re_placement = new RegExp(pattern, "i");
        var ret = [];
        
        for (var item_name in items) {
            var item = items[item_name];
            var ok = false;
            
            if (item.IsArtefact == true)
                continue
            
            if (!ok && item.Type != null)
                if (re_placement.test(item.Type))
                    ok = true;
            if (!ok && item.Usage != null)
                for (var usage in item.Usage)
                    if (re_placement.test(usage)) {
                        ok = true;
                        break;
                    }
            if (!ok && item.WeaponClass != null)
                if (re_placement.test(item.WeaponClass))
                    ok = true;
            
            if (!ok) 
                continue;
            
            if (item.MinLevel != null && character.Level < item.MinLevel)
                continue;
            
            if (item.Properties != null)
                for (var prop in item.Properties)
                    if (prop in forbidden_props) {
                        ok = false;
                        break;
                    }
            if (!ok)
                continue;

            ret.push(item_name);
        }
        return ret;
    };

addon.Handlers = {};

addon.Handlers.OnConnected = 
    function(event) {
        addon.CharParameters = {};
        addon.CharInventory = {};
        addon.CharEquipment = {};
    };

addon.Handlers.OnPrompt = 
    function(promptdata) {
        addon.ScanForCharDescription(promptdata[0]);
    };

addon.Handlers.OnCharParameterChanged = 
    function(eventdata) {
        var param = eventdata[0];
        var oldvalue = eventdata[1];
        var newvalue = eventdata[2];
        JMCPlus.DebugOutput("Char parameter <" + param + ">: " + oldvalue + " ==> " + newvalue);
    };
addon.Handlers.OnCharInventoryChanged = 
    function(eventdata) {
        var item = eventdata[0];
        var oldvalue = eventdata[1];
        var newvalue = eventdata[2];
        JMCPlus.DebugOutput("Inventory item <" + item + ">: " + oldvalue + " ==> " + newvalue);
    };
addon.Handlers.OnCharEquipmentChanged = 
    function(eventdata) {
        var item = eventdata[0];
        var oldvalue = eventdata[1];
        var newvalue = eventdata[2];
        
        function longest_token(str) {
            var tokens = str.split(' ');
            var ret = tokens[0];
            for (var i = 1; i < tokens.length; i++)
                if (ret.length < tokens[i].length)
                    ret = tokens[i];
            return ret;
        }
        
        if (item == "оружие") {
            JMCPlus.Jmc.SetVar("weapon1", longest_token(newvalue));
        } else if (item == "второе оружие") {
            JMCPlus.Jmc.SetVar("weapon2", longest_token(newvalue));
            JMCPlus.Jmc.SetVar("lefthand", longest_token(newvalue));
        } else if (item == "зажато в руке") {
            JMCPlus.Jmc.SetVar("weapon2", JMCPlus.Jmc.GetVar("weapon1"));
            JMCPlus.Jmc.SetVar("lefthand", longest_token(newvalue));
        }
        JMCPlus.DebugOutput("Equipment <" + item + ">: " + oldvalue + " ==> " + newvalue);
    };

JMCPlus.AddExtCommand("чтонадеть?",
    ["чтонадеть\\? (.+)", "toquip\\? (.+)"],
    function(arguments, executer) {
        if (!("arda_items" in JMCPlus.Addons)) {
            JMCPlus.Jmc.ShowWithColors("&rЌ≈ќЅ’ќƒ»ћ јƒƒќЌ &Rarda_items&r!");
            return;
        }
        var pattern = arguments[0];
        var list = addon.AvailableItemsList(pattern);
        JMCPlus.Addons["arda_items"].DisplayItemsList("&Wћожно надеть на что-то вроде <&G" + pattern + "&W>:", list);
        return true;
    },
    addon,
    "чтонадеть? <место>");

JMCPlus.AddExtCommand("экип?",
    ["экип\\? (все|хп|ма|хр|др|стат|лвл|ас|авто)(?: ([\\+\\:\\-][^\\+\\:\\-]+))?(?: ([\\+\\:\\-][^\\+\\:\\-]+))?(?: ([\\+\\:\\-][^\\+\\:\\-]+))?", "equip\\? (all|hp|ma|hr|dr|stat|lvl|ac|auto)(?: ([\\+\\:\\-][^\\+\\:\\-]+))?(?: ([\\+\\:\\-][^\\+\\:\\-]+))?(?: ([\\+\\:\\-][^\\+\\:\\-]+))?"],
    function(arguments, executer) {
        if (!("arda_items" in JMCPlus.Addons)) {
            JMCPlus.Jmc.ShowWithColors("&rЌ≈ќЅ’ќƒ»ћ јƒƒќЌ &Rarda_items&r!");
            return;
        }
        var arda_items = JMCPlus.Addons["arda_items"];
        
        var max_type = arguments[0];
        
        var cast_value = 0, ban_items = "", char_props = null;
        for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] === 'string') {
                var code = arguments[i].substr(0, 1);
                if (code == "+")
                    cast_value = arguments[i].substr(1);
                else if (code == "-")
                    ban_items = arguments[i].substr(1);
                else if (code == ":")
                    char_props = arguments[i].substr(1);
            }
        }
        
        var cast = 0;
        if (cast_value != null)
            cast = parseInt(cast_value);
        if (isNaN(cast))
            cast = 0;
        
        var re_ignores = [];
        if (ban_items != null) {
            var to_ignore = ban_items.split(',');
            for (var i = 0; i < to_ignore.length; i++)
                if (to_ignore[i].length > 0)
                    re_ignores.push(new RegExp(to_ignore[i], "i"));
        }
        
        var character = {
            "Class": addon.CharParameters.Class,
            "Race": addon.CharParameters.Race,
            "Level": addon.CharParameters.Level,
            "Alignment": addon.CharParameters.Alignment,
            "Str0": addon.CharParameters.Str0,
            "Dex0": addon.CharParameters.Dex0,
            "Int0": addon.CharParameters.Int0,
            "Wis0": addon.CharParameters.Wis0,
            "Con0": addon.CharParameters.Con0,
            "Cha0": addon.CharParameters.Cha0,
            "Lck0": addon.CharParameters.Lck0
        };
        
        if (char_props != null) {
            char_props = char_props.split(",");
            if (char_props.length >= 4) {
                character.Level = parseInt(char_props[0]);
                character.Race = char_props[1];
                character.Class = char_props[2];
                character.Alignment = char_props[3];
            }
        }
        
        var cost_mod = {};
        if (max_type == "авто" || max_type == "auto") {
            if (addon.CharParameters.Level < 50) {
                if (character.Class == "¬олшебник")
                    cost_mod["AC"] = 3.0;
                else
                    cost_mod["Dam"] = 2.0;
                max_type = "lvl";
            } else {
                if (character.Class == "¬олшебник" ||
                    character.Class == "Ћекарь")
                    max_type = "ma";
                else
                    max_type = "dr";
            }
        }
        if (max_type == "все" || max_type == "all") {
        } else if (max_type == "хп" || max_type == "hp") {
            cost_mod["Hp"] = 8.0;
            cost_mod["Con"] = 2.0;
        } else if (max_type == "ма" || max_type == "ma") {
            cost_mod["Ma"] = 8.0;
            cost_mod["Int"] = 2.0;
        } else if (max_type == "др" || max_type == "dr") {
            cost_mod["Dam"] = 3.0;
            cost_mod["Str"] = 2.0;
        } else if (max_type == "хр" || max_type == "hr") {
            cost_mod["Hit"] = 3.0;
            cost_mod["Str"] = 2.0;
        } else if (max_type == "стат" || max_type == "stat") {
            cost_mod["Str"] = 2.0;
            cost_mod["Dex"] = 2.0;
            cost_mod["Int"] = 2.0;
            cost_mod["Wis"] = 2.0;
            cost_mod["Con"] = 2.0;
            cost_mod["Lck"] = 2.0;
        } else if (max_type == "лвл" || max_type == "lvl") {
            cost_mod["Int"] = 2.0;
            cost_mod["Wis"] = 2.0;
            cost_mod["Con"] = 3.0;
        } else if (max_type == "ас" || max_type == "ac") {
            cost_mod["Dex"] = 2.5;
            cost_mod["AC"] = 5.0;
        }
        
        var slots = [
            {"Place": "для освещения", "Usage": "лампа"},
            {"Place": "на шее", "Usage": "на шею"},
            {"Place": "на шее", "Usage": "на шею"},
            {"Place": "на лице", "Usage": "на лицо"},
            {"Place": "на руках", "Usage": "на руки"},
            {"Place": "на ногах", "Usage": "на ноги"},
            {"Place": "на пальце", "Usage": "на палец"},
            {"Place": "на пальце", "Usage": "на палец"},
            {"Place": "на голове", "Usage": "на голову"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на теле", "Usage": "на тело"},
            {"Place": "на плечах", "Usage": "на плечи"},
            {"Place": "за спиной", "Usage": "на спину"},
            {"Place": "на запястье", "Usage": "на запястье"},
            {"Place": "на запястье", "Usage": "на запястье"},
            {"Place": "на глазах", "Usage": "на глаза"},
            {"Place": "на лодыжке", "Usage": "на лодыжку"},
            {"Place": "на лодыжке", "Usage": "на лодыжку"},
            {"Place": "пояс", "Usage": "на пояс"},
            {"Place": "штаны", "Usage": "как штаны"},
            {"Place": "накидка", "Usage": "как накидку"},
            {"Place": "в ушах", "Usage": "к уху"},
            {"Place": "оружие", "Usage": "оружие"}
        ];
        
        var base_stats = {"Str": 12, "Dex": 12, "Int": 12, "Wis": 12, "Con": 12, "Cha": 12, "Lck": 12};
        var max_stats = {"Str": 21, "Dex": 21, "Int": 21, "Wis": 21, "Con": 21, "Cha": 21, "Lck": 21};
        var weapon_bonus = {};
        if (character.Race == "„еловек") {
            base_stats = {"Str": 12, "Dex": 12, "Int": 12, "Wis": 12, "Con": 12, "Cha": 12, "Lck": 12};
            max_stats = {"Str": 21, "Dex": 21, "Int": 21, "Wis": 21, "Con": 21, "Cha": 21, "Lck": 21};
            weapon_bonus["длинные лезвия"] = 1;
        } else if (character.Race == "–охиррим") {
            base_stats = {"Str": 12, "Dex": 13, "Int": 11, "Wis": 11, "Con": 13, "Cha": 12, "Lck": 12};
            max_stats = {"Str": 21, "Dex": 22, "Int": 20, "Wis": 20, "Con": 22, "Cha": 21, "Lck": 21};
            weapon_bonus["длинные лезвия"] = 1;
        } else if (character.Race == "’арадрим") {
            base_stats = {"Str": 13, "Dex": 12, "Int": 12, "Wis": 11, "Con": 12, "Cha": 10, "Lck": 13};
            max_stats = {"Str": 22, "Dex": 21, "Int": 21, "Wis": 20, "Con": 21, "Cha": 19, "Lck": 21};
            weapon_bonus["гибкое"] = 1;
        } else if (character.Race == "Ёльф(выс)") {
            base_stats = {"Str": 10, "Dex": 12, "Int": 14, "Wis": 13, "Con": 11, "Cha": 13, "Lck": 12};
            max_stats = {"Str": 19, "Dex": 21, "Int": 23, "Wis": 22, "Con": 20, "Cha": 22, "Lck": 21};
            weapon_bonus["короткие лезвия"] = 1;
        } else if (character.Race == "Ёльф(сум)") {
            base_stats = {"Str": 11, "Dex": 14, "Int": 12, "Wis": 12, "Con": 11, "Cha": 13, "Lck": 12};
            max_stats = {"Str": 20, "Dex": 23, "Int": 21, "Wis": 21, "Con": 20, "Cha": 22, "Lck": 21};
            weapon_bonus["длинные лезвия"] = 1;
        } else if (character.Race == "Ёльфинит") {
            base_stats = {"Str": 11, "Dex": 13, "Int": 13, "Wis": 13, "Con": 11, "Cha": 13, "Lck": 11};
            max_stats = {"Str": 19, "Dex": 22, "Int": 22, "Wis": 23, "Con": 20, "Cha": 22, "Lck": 20};
            weapon_bonus["длинные лезвия"] = 1;
        } else if (character.Race == "√ном") {
            base_stats = {"Str": 14, "Dex": 10, "Int": 10, "Wis": 13, "Con": 14, "Cha": 11, "Lck": 11};
            max_stats = {"Str": 23, "Dex": 19, "Int": 19, "Wis": 22, "Con": 23, "Cha": 20, "Lck": 21};
            weapon_bonus["топоры"] = 1;
        } else if (character.Race == "ќрк") {
            base_stats = {"Str": 13, "Dex": 13, "Int": 11, "Wis": 10, "Con": 13, "Cha": 8, "Lck": 12};
            max_stats = {"Str": 23, "Dex": 22, "Int": 20, "Wis": 18, "Con": 22, "Cha": 17, "Lck": 21};
            weapon_bonus["разнообразное"] = 1;
        } else if (character.Race == "“ролль") {
            base_stats = {"Str": 16, "Dex": 9, "Int": 10, "Wis": 10, "Con": 15, "Cha": 7, "Lck": 11};
            max_stats = {"Str": 25, "Dex": 18, "Int": 19, "Wis": 19, "Con": 25, "Cha": 16, "Lck": 19};
            weapon_bonus["тупое"] = 1;
        } else if (character.Race == "Ёнт") {
            base_stats = {"Str": 15, "Dex": 9, "Int": 10, "Wis": 14, "Con": 13, "Cha": 8, "Lck": 9};
            max_stats = {"Str": 24, "Dex": 18, "Int": 19, "Wis": 23, "Con": 22, "Cha": 16, "Lck": 18};
            weapon_bonus["тупое"] = 1;
        } else if (character.Race == "’оббит") {
            base_stats = {"Str": 10, "Dex": 14, "Int": 13, "Wis": 12, "Con": 10, "Cha": 12, "Lck": 13};
            max_stats = {"Str": 18, "Dex": 23, "Int": 22, "Wis": 21, "Con": 19, "Cha": 21, "Lck": 23};
            weapon_bonus["короткие лезвия"] = 1;
        }
        
        var weapon_coeff = {};
        var dual_weild = false;
        if (character.Class == "Ћекарь") {
            base_stats.Wis += 2;
            max_stats.Wis += 3;
            weapon_coeff = {"тупое": 0.95, "гибкое": 0.80, "короткие лезвия": 0.50, "длинные лезвия": 0.00, "разнообразное": 0.70, "топоры": 0.50};
        } else if (character.Class == "¬олшебник") {
            base_stats.Int += 2;
            max_stats.Int += 3;
            weapon_coeff = {"тупое": 0.50, "гибкое": 0.60, "короткие лезвия": 0.95, "длинные лезвия": 0.50, "разнообразное": 0.50, "топоры": 0.60};
        } else if (character.Class == "–ыцарь") {
            base_stats.Str += 2;
            max_stats.Str += 3;
            weapon_coeff = {"тупое": 0.95, "гибкое": 0.65, "короткие лезвия": 0.95, "длинные лезвия": 0.95, "разнообразное": 0.60, "топоры": 0.60};
            dual_weild = (character.Level >= 17);
        } else if (character.Class == "ѕрорицатель") {
            base_stats.Wis += 2;
            max_stats.Wis += 3;
            weapon_coeff = {"тупое": 0.75, "гибкое": 0.95, "короткие лезвия": 0.85, "длинные лезвия": 0.45, "разнообразное": 0.90, "топоры": 0.40};
            dual_weild = (character.Level >= 17);
        } else if (character.Class == "—ледопыт") {
            base_stats.Con += 2;
            max_stats.Con += 3;
            weapon_coeff = {"тупое": 0.85, "гибкое": 0.40, "короткие лезвия": 0.40, "длинные лезвия": 0.85, "разнообразное": 0.90, "топоры": 0.95};
            dual_weild = (character.Level >= 10);
        } else if (character.Class == "ƒикарь") {
            base_stats.Int += 2;
            max_stats.Int += 3;
            weapon_coeff = {"тупое": 0.95, "гибкое": 0.30, "короткие лезвия": 0.30, "длинные лезвия": 0.50, "разнообразное": 0.90, "топоры": 0.30};
            dual_weild = (character.Level >= 22);
        } else if (character.Class == "¬ор") {
            base_stats.Lck += 2;
            max_stats.Lck += 3;
            weapon_coeff = {"тупое": 0.40, "гибкое": 0.95, "короткие лезвия": 0.95, "длинные лезвия": 0.80, "разнообразное": 0.85, "топоры": 0.80};
            dual_weild = (character.Level >= 40);
        } else if (character.Class == "¬оин") {
            base_stats.Con += 2;
            max_stats.Con += 3;
            weapon_coeff = {"тупое": 0.95, "гибкое": 0.95, "короткие лезвия": 0.95, "длинные лезвия": 0.95, "разнообразное": 0.95, "топоры": 0.95};
            dual_weild = (character.Level >= 15);
        } else if (character.Class == "”мертвие") {
            base_stats.Dex += 2;
            max_stats.Dex += 3;
            weapon_coeff = {"тупое": 0.50, "гибкое": 0.40, "короткие лезвия": 0.95, "длинные лезвия": 0.85, "разнообразное": 0.95, "топоры": 0.95};
            dual_weild = (character.Level >= 35);
        }
        
        if (char_props != null) {
            function init_stat0(stat_name, input_value) {
                if (input_value == null)
                    return base_stats[stat_name];
                var val = parseInt(input_value);
                if (isNaN(val))
                    return base_stats[stat_name];
                if (val < base_stats[stat_name])
                    return base_stats[stat_name] + val;
                return val;
            }
            character.Str0 = init_stat0("Str", char_props[4]);
            character.Dex0 = init_stat0("Dex", char_props[5]);
            character.Int0 = init_stat0("Int", char_props[6]);
            character.Wis0 = init_stat0("Wis", char_props[7]);
            character.Con0 = init_stat0("Con", char_props[8]);
            character.Cha0 = init_stat0("Cha", char_props[9]);
            character.Lck0 = init_stat0("Lck", char_props[10]);
        }
        
        if (dual_weild) {
            slots.push({"Place": "второе оружие", "Usage": "оружие"});
        } else {
            slots.push({"Place": "зажато в руке", "Usage": "в левую руку"});
            slots.push({"Place": "щит", "Usage": "в качестве щита"});
        }
        
        for (var stat in max_stats)
            if (max_stats[stat] > 25)
                max_stats[stat] = 25;
        
        var useful_boundaries = {
            "Wis": {"Min": 12, "Max": 18},
            "Hit": {"Min": 5, "Max": 25},
            "AC": {"Min": -200, "Max": 0}
        };
        
        var stats = {
            "Hp" : {"re": /здоровье/         , "cost":  2.50, "initial": 0},
            "Ma" : {"re": /магию/            , "cost":  0.50, "initial": 0},
            "Mv" : {"re": /движение/         , "cost":  0.01, "initial": 0},
            "Bl" : {"re": /кровь/            , "cost":  0.00, "initial": 0},
            "Str": {"re": /силу/             , "cost": 20.00, "initial": character.Str0 + cast},
            "Dex": {"re": /проворность/      , "cost": 30.00, "initial": character.Dex0 + cast},
            "Int": {"re": /интеллект/        , "cost": 15.00, "initial": character.Int0 + cast},
            "Wis": {"re": /мудрость/         , "cost": 10.00, "initial": character.Wis0 + cast},
            "Con": {"re": /сложение/         , "cost": 20.00, "initial": character.Con0 + cast},
            "Cha": {"re": /привлекательность/, "cost":  0.01, "initial": character.Cha0 + cast},
            "Lck": {"re": /удачу/             , "cost": 20.00, "initial": character.Lck0 + 0},
            "Dam": {"re": /дамролл/             , "cost": 15.00, "initial": 0},
            "Hit": {"re": /хитролл/             , "cost":  5.00, "initial": 0},
            "AC" : {"re": /(?:армор класс|класс доспехов)/, "cost":  -1.0, "initial": 0}
        };
        //jmc.output(JSON.stringify(stats));
        
        var dur_to_ac = {
            "для освещения": 0.1,
            "на шее": 1.0/6.0,
            "на лице": 1.0/5.0,
            "на руках": 1.0/5.0,
            "на ногах": 1.0/5.0,
            "на пальце": 1.0/10.0,
            "на голове": 1.0/2.0,
            "на теле": 1.0/3.0,
            "на плечах": 1.0/4.0,
            "за спиной": 1.0/4.0,
            "на запястье": 0.1,
            "на глазах": 1.0/10.0,
            "на лодыжке": 1.0/6.0,
            "пояс": 1.0/6.0,
            "штаны": 1.0/2.0,
            "накидка": 1.0/2.0,
            "в ушах": 0.0,
            "оружие": 0.0,
            "в левую руку": 0.0,
            "щит": 2.0,
            "второе оружие": 0.0
        };
        
        var max_weapon_weight = {
            0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
            6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 
            11: 11, 12: 12, 13: 14, 14: 15, 15: 16, 
            16: 17, 17: 18, 18: 19, 19: 21, 20: 23,
            21: 25, 22: 28, 23: 30, 24: 35, 25: 40};
        
        var config = {};
        for (var stat in stats) {
            config[stat] = stats[stat].initial;
            if (stat in cost_mod)
                stats[stat].cost *= cost_mod[stat];
        }
        
        if (character.Class == "”мертвие") {
            var tmp = stats.Ma.cost;
            stats.Ma.cost = stats.Bl.cost * 0.1;
            stats.Bl.cost = tmp * 10.0;
        }
        
        var cost_dmg = stats.Dam.cost;
        if (dual_weild)
            stats.Dam.cost *= 2.0;
        
        var items = arda_items.Data.Items;
        var thickness = 0;
        var weapon_weight = 0;
        
        function rate_item(slot_name, item_name) {
            var item = items[item_name];
            var rate = 0.0;
            if (slot_name == "на теле" && (item.ThicknessInt & thickness) != 0)
                return -1.0;
            if (slot_name == "оружие" || slot_name == "второе оружие") {
                var str = config.Str;
                if (str > max_stats.Str)
                    str = max_stats.Str;
                if (weapon_weight + item.Weight > max_weapon_weight[str])
                    return -1.0;
            }
            if (item.Modifiers != null)
                for (var mod in item.Modifiers)
                    for (var stat in stats)
                        if (stats[stat].re.test(mod)) {
                            var without_item = config[stat];
                            var with_item = config[stat] + item.Modifiers[mod];
                            if (max_stats[stat] != null) {
                                if (without_item > max_stats[stat])
                                    without_item = max_stats[stat];
                                if (with_item > max_stats[stat])
                                    with_item = max_stats[stat];
                            }
                            if (useful_boundaries[stat] != null) {
                                if (without_item > useful_boundaries[stat].Max)
                                    without_item = useful_boundaries[stat].Max;
                                if (with_item > useful_boundaries[stat].Max)
                                    with_item = useful_boundaries[stat].Max;
                                if (without_item < useful_boundaries[stat].Min)
                                    without_item = useful_boundaries[stat].Min;
                                if (with_item < useful_boundaries[stat].Min)
                                    with_item = useful_boundaries[stat].Min;
                            }
                            rate += (with_item - without_item) * stats[stat].cost;
                            break;
                        }
            if (item.AvgDamage != null && item.WeaponClass in weapon_coeff) {
                var dmg = item.AvgDamage;
                if (item.WeaponClass in weapon_bonus)
                    dmg += weapon_bonus[item.WeaponClass];
                rate += dmg * cost_dmg * weapon_coeff[item.WeaponClass];
                if (!("волшебное" in item.Properties))
                    rate += 3.0 * stats.Dam.cost;
            }
            if (item.Durability != null && slot_name in dur_to_ac)
                rate -= dur_to_ac[slot_name] * item.Durability * stats.AC.cost;
            return rate;
        }
        
        function set_item(slot_name, item_name, set) {
            var item = items[item_name];
            var k = (set == true) ? +1.0 : -1.0;
            if (slot_name == "на теле") {
                if (set == true)
                    thickness |= item.ThicknessInt;
                else
                    thickness &= (~item.ThicknessInt);
            }
            if (slot_name == "оружие" || slot_name == "второе оружие") {
                weapon_weight += item.Weight * k;
                if (!("волшебное" in item.Properties))
                    config.Dam += 3.0 * k;
            }
            if (item.Modifiers != null)
                for (var mod in item.Modifiers)
                    for (var stat in stats)
                        if (stats[stat].re.test(mod)) {
                            config[stat] += item.Modifiers[mod] * k;
                            break;
                        }
            if (item.Durability != null && slot_name in dur_to_ac)
                config.AC -= dur_to_ac[slot_name] * item.Durability * k;
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
        
        for (var i = 0; i < slots.length; i++) {
            var list = addon.AvailableItemsList(slots[i].Usage, character);
            slots[i].Candidates = [];
            for (var j = 0; j < list.length; j++) {
                var ignore = false;
                for (var k = 0; k < re_ignores.length; k++)
                    if (re_ignores[k].test(list[j])) {
                        ignore = true;
                        break;
                    }
                if (ignore)
                    continue;
                slots[i].Candidates.push({"Item": list[j], "Rate": rate_item(slots[i].Place, list[j])});
            }
            slots[i].Candidates.sort(function(a,b) { return b.Rate - a.Rate; });
        }
        
        for (var i = 0; i < slots.length; i++)
            for (var j = 0; j < slots[i].Candidates.length; j++) {
                slots[i].Candidates[j].Rate = rate_item(slots[i].Place, slots[i].Candidates[j].Item);
                if (slots[i].Candidates[j].Rate > 0) {
                    if (j > 0) {
                        var tmp = clone_obj(slots[i].Candidates[0]);
                        slots[i].Candidates[0] = clone_obj(slots[i].Candidates[j]);
                        slots[i].Candidates[j] = tmp;
                    }
                    set_item(slots[i].Place, slots[i].Candidates[0].Item, true);
                    break;
                }
            }
        
        var t_start = new Date();
        
        for (var iteration = 0; iteration < 10000; iteration++) {
            if (iteration % 10 == 0) {
                var t_now = new Date();
                if (t_now - t_start > 5 * 1000) {
                    JMCPlus.DebugOutput("Search equipment - timeout");
                    break;
                }
            }
            
            var best_delta_rate = 0, slot_to_change = -1, item_to_change = -1;
            
            for (var i = 0; i < slots.length; i++) {
                if (slots[i].Candidates.length == 0)
                    continue;
                //try to improve choise of i-th equipment
                var old_best_rate = slots[i].Candidates[0].Rate;
                if (old_best_rate > 0)
                    set_item(slots[i].Place, slots[i].Candidates[0].Item, false);
                
                var best_rate = 0, best_index = 0;
                for (var j = 0; j < slots[i].Candidates.length; j++) {
                    slots[i].Candidates[j].Rate = rate_item(slots[i].Place, slots[i].Candidates[j].Item);
                    if (slots[i].Candidates[j].Rate > best_rate) {
                        best_rate = slots[i].Candidates[j].Rate;
                        best_index = j;
                    }
                }
                
                //if (old_best_rate > 0) {
                if (slots[i].Candidates[0].Rate > 0)
                    set_item(slots[i].Place, slots[i].Candidates[0].Item, true);
                    //if (slots[i].Candidates[0].Rate <= 0)
                    //    slots[i].Candidates[0].Rate = 1e-9;
                //}
                
                if (best_index > 0 && best_rate > 0) {
                    best_delta_rate = slots[i].Candidates[best_index].Rate - slots[i].Candidates[0].Rate;
                    slot_to_change = i;
                    item_to_change = best_index;
                }
            }
            
            if (slot_to_change < 0)
                break;
            /*
            jmc.output("Improved slot[" + slot_to_change + "]: " +
                       slots[slot_to_change].Candidates[0].Item + " (" + slots[slot_to_change].Candidates[0].Rate + ")[0] ==> " + 
                       slots[slot_to_change].Candidates[item_to_change].Item + "(" + slots[slot_to_change].Candidates[item_to_change].Rate + ")[" + item_to_change + "]");
            */
            if (slots[slot_to_change].Candidates[0].Rate > 0)
                set_item(slots[slot_to_change].Place, slots[slot_to_change].Candidates[0].Item, false);
            
            var tmp = clone_obj(slots[slot_to_change].Candidates[0]);
            slots[slot_to_change].Candidates[0] = clone_obj(slots[slot_to_change].Candidates[item_to_change]);
            slots[slot_to_change].Candidates[item_to_change] = tmp;
            
            if (slots[slot_to_change].Candidates[0].Rate > 0)
                set_item(slots[slot_to_change].Place, slots[slot_to_change].Candidates[0].Item, true);
        }
        JMCPlus.DebugOutput("Last iteration = " + iteration);
        
        JMCPlus.ShowWithColors("&W–екомендую надеть:");
        for (var i = 0; i < slots.length; i++)
            if (slots[i].Candidates.length > 0 && slots[i].Candidates[0].Rate > 0)
                JMCPlus.ShowWithColors("  &w" + slots[i].Place + " &18>  &g" + 
                                       arda_items.ItemBriefDescription(slots[i].Candidates[0].Item));
        
        var cfg_str = "";
        for (var stat in config) {
            if (cfg_str.length > 0)
                cfg_str += "&W; ";
            cfg_str += "&W" + stat + "&G";
            if (config[stat] > 0)
                cfg_str += "+";
            if (config[stat] > max_stats[stat])
                cfg_str += max_stats[stat];
            else
                cfg_str += config[stat].toFixed(0);
            if (max_stats[stat] != null && config[stat] >= max_stats[stat])
                cfg_str += "&W(max)";
        }
        JMCPlus.ShowWithColors("&W»того:");
        JMCPlus.ShowWithColors(cfg_str);
        return true;
        
    },
    addon,
    "экип? <все|хп|ма|хр|др|стат|авто>[ +<0|1|2|3|4|5>][ -<шмотка{,шмотка}*>][ :<лвл,–аса, ласс,репа,сил,про,инт,муд,сло,при,уда>]");

/*
JMCPlus.AddExtCommand("шмотки+",
    ["шмотки\\+ (.+)\\.db", "items\\+ (.+)\\.db"],
    function(arguments, executer) {
        var lines = FS.ReadFile(arguments[0] + ".db").replace(/\r\n/g, "\n").split("\n");
        addon.ScanForItemsData(lines);
        return true;
    },
    addon,
    "шмотки+ <им€ файла>.db");
*/

JMCPlus.AddEvent("CharParameterChanged");
JMCPlus.AddEvent("CharInventoryChanged");
JMCPlus.AddEvent("CharEquipmentChanged");

JMCPlus.AddAddon(addon);
