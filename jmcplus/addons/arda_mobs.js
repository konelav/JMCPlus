var addon = {};

addon.ID = "arda_mobs";

addon.Name = "Mobs information for Arda-MUD";

addon.re_MOB_DEATH = /^(.+) убит(?:о|а)?!$/;
addon.re_FIGHT_EXP = /^Вы получаете ([0-9]{1,6}) очк(?:о|а|ов) опыта \(([0-9]{1,7}) за весь бой\)\.$/;
addon.re_LOOT_MONEY = /^Вы достали ([0-9]{1,5}) золот(?:ой|ую|ых) монет(?:ы|у)? из трупа (.+)\.$/;
addon.re_LOOT_START = /^На трупе (.+) находитсЯ:$/;
addon.re_LOOT_ITEM = /^\s{5}(.+)$/;
addon.re_ITEM_PROPERTY = /(?:\(\*Волшебное\*\)|\(СветитсЯ\)|\(Гудит\)|\(Невидимо\)|\(КраснаЯ Аура\)|\(БелаЯ Аура\)|\(Прозрачное\)|\(Отравлено\)|\(Рунное\))/g;

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Data, "Mobs", {});
        JMCPlus.Storage.EnsureExistance(this.Data, "KilledQueues", {});
        JMCPlus.Storage.EnsureExistance(this.Data, "MobKills", {});
        JMCPlus.Storage.EnsureExistance(this.Data, "Properties", 
            {
                "слабит": "(.+) ослабил.? вас своими чарами\\."
            });
        JMCPlus.Storage.EnsureExistance(this.Config, "KilledQueueMaxLength", 1000);
        JMCPlus.Storage.EnsureExistance(this.Config, "MAX_MOBKILLS", 50);
        
        this.re_properties = {};
        for (var prop in this.Data.Properties)
            this.re_properties[prop] = new RegExp(this.Data.Properties[prop]);
        
        function list_to_stats(lst) {
            var ret = {};
            for (var i = 0; i < lst.length; i++)
                ret = addon.AddToStatistic(ret, lst[i]);
            return ret;
        }
        
        for (var name in this.Data.Mobs) {
            if (this.Data.Mobs[name].AvgMoney != null) {
                this.Data.Mobs[name].Moneys = list_to_stats(this.Data.Mobs[name].Moneys);
                for (var lvl in this.Data.Mobs[name].FightExps)
                    this.Data.Mobs[name].FightExps[lvl] = list_to_stats(this.Data.Mobs[name].FightExps[lvl]);
                for (var lvl in this.Data.Mobs[name].DeathExps)
                    this.Data.Mobs[name].DeathExps[lvl] = list_to_stats(this.Data.Mobs[name].DeathExps[lvl]);
                delete this.Data.Mobs[name].AvgMoney;
                delete this.Data.Mobs[name].AvgFightExps;
                delete this.Data.Mobs[name].AvgDeathExps;
            }
            var new_loot = {};
            for (var item in this.Data.Mobs[name].Loot)
                new_loot[item.replace(this.re_ITEM_PROPERTY, "")] = true;
            this.Data.Mobs[name].Loot = new_loot;
        }
        
        var remove_names = ["Кто-то", "кто-то", "НЕТ", "нет"];
        for (var i = 0; i < remove_names.length; i++) {
            var name = remove_names[i];
            if (name in this.Data.Mobs)
                delete this.Data.Mobs[name];
            for (var charname in this.Data.KilledQueues)
                for (var j = 0; j < this.Data.KilledQueues[charname].length; j++)
                    if (this.Data.KilledQueues[charname][j].M == name)
                        this.Data.KilledQueues[charname].splice(j, 1);
            for (var charname in this.Data.MobKills)
                for (var j = 0; j < this.Data.MobKills[charname].length; j++)
                    if (this.Data.MobKills[charname][j].MobName == name)
                        this.Data.MobKills[charname].splice(j, 1);
        }
        
        this.CharLevel = null;
        this.CharName = null;
        this.LastEnemy = "";
    };

addon.AddToStatistic = 
    function(statistics, value) {
        var ret = statistics;
        if (ret == null)
            ret = {};
        if (!("Count" in ret))
            ret = {"Count": 0};
        if (ret.Count == 0) {
            ret.Min = ret.Max = ret.Sum = value;
        } else {
            if (ret.Min > value)
                ret.Min = value;
            if (ret.Max < value)
                ret.Max = value;
            ret.Sum += value;
        }
        ret.Count += 1;
        ret.Avg = ret.Sum / ret.Count;
        return ret;
    };

addon.AddMob = 
    function(name, description) {
        if (typeof name !== 'string')
            return;
        if (name == "Кто-то") {
            if (this.LastEnemy == null ||
                this.LastEnemy == "" ||
                this.LastEnemy == "НЕТ" ||
                this.LastEnemy == "Кто-то") {
                return;
            }
            name = this.LastEnemy;
        }
        
        if (!(name in this.Data.Mobs))
            this.Data.Mobs[name] = 
                {
                    "FightExps": {},
                    "DeathExps": {},
                    "Moneys": {},
                    "Loot": {},
                    "Properties": {},
                    "Comments": []
                };
        
        if (this.CharLevel != null) {
            if ("FightExp" in description) {
                if (!(this.CharLevel in this.Data.Mobs[name].FightExps))
                    this.Data.Mobs[name].FightExps[this.CharLevel] = {};
                this.Data.Mobs[name].FightExps[this.CharLevel] = 
                    this.AddToStatistic(this.Data.Mobs[name].FightExps[this.CharLevel], description.FightExp);
            }
            if ("DeathExp" in description) {
                if (!(this.CharLevel in this.Data.Mobs[name].DeathExps))
                    this.Data.Mobs[name].DeathExps[this.CharLevel] = {};
                this.Data.Mobs[name].DeathExps[this.CharLevel] = 
                    this.AddToStatistic(this.Data.Mobs[name].DeathExps[this.CharLevel], description.DeathExp);
            }
        }
        if ("Money" in description) {
            this.Data.Mobs[name].Moneys = 
                this.AddToStatistic(this.Data.Mobs[name].Moneys, description.Money);
        }
        if ("Loot" in description) {
            for (var item in description.Loot)
                this.Data.Mobs[name].Loot[item.replace(this.re_ITEM_PROPERTY, "")] = true;
        }
        if ("Properties" in description) {
            for (var prop in description.Properties)
                this.Data.Mobs[name].Properties[prop] = true;
        }
        if ("Comments" in description) {
            this.Data.Mobs[name].Comments = this.Data.Mobs[name].Comments.concat(description.Comments);
        }
        
        if (this.CharName != null && "FightExp" in description) {
            function add_to_mobkills(kills, maxlen, mobname, count, silent) {
                var added = false;
                for (var i = 0; i < kills.length; i++)
                    if (kills[i].MobName == mobname) {
                        kills[i].Count += count;
                        added = true;
                        break;
                    }
                if (!added)
                    kills.push({"MobName": mobname, "Count": count});
                while (kills.length > 0 && kills.length > maxlen) {
                    if (!silent) {
                        //JMCPlus.DebugOutput("kills: " + JSON.stringify(kills));
                        JMCPlus.DebugOutput("descr: " + addon.MobBriefDescription(kills[0].MobName));
                        try {
                            JMCPlus.ShowWithColors("&WРазмаксился: " + addon.MobBriefDescription(kills[0].MobName));
                        } catch(e) {
                            JMCPlus.ErrorOutput(e, "add_to_mobkills");
                        }
                    }
                    kills.shift();
                }
                return kills;
            }
            
            var list = [];
            var mobkills = [];
            var mobkills_length = (this.CharLevel * 50 / this.Config.MAX_MOBKILLS) + 3;
			
			if (mobkills_length > this.Config.MAX_MOBKILLS)
				mobkills_length = this.Config.MAX_MOBKILLS;
            
			if (this.CharName in this.Data.KilledQueues)
                list = this.Data.KilledQueues[this.CharName];
            if (this.CharName in this.Data.MobKills) {
                mobkills = this.Data.MobKills[this.CharName];
            } else {
                for (var i = 0; i < list.length; i++)
                    mobkills = add_to_mobkills(mobkills, mobkills_length, list[i].M, list[i].N, true);
            }
			
            if (list.length > 0 && list[list.length - 1].M == name)
                list[list.length - 1].N += 1;
            else
                list.push({"M": name, "N": 1});
            while (list.length > this.Config.KilledQueueMaxLength)
                list.shift();
            this.Data.KilledQueues[this.CharName] = list;
            if (description.FightExp > 0) { // be aware of exp for skills/spells learning!
                //actual criteria: level_diff <= 10
                mobkills = add_to_mobkills(mobkills, mobkills_length, name, 1, false);
                this.Data.MobKills[this.CharName] = mobkills;
            }
        }
        
        JMCPlus.Storage.Flush(this);
    };

addon.ScanForMobsData = 
    function(lines) {
        var name = null;
        var description = {};
        var match;
        var look_inventory = false;
        
        for (var i = 0; i < lines.length; i++) {
            var ln = JMCPlus.AnsiColors.RemoveANSI(lines[i]);
            if ((match = this.re_MOB_DEATH.exec(ln)) != null) {
                if (name != null)
                    this.AddMob(name, description);
                name = match[1];
                description = {};
                look_inventory = false;
            } else if (name != null) {
                if ((match = this.re_FIGHT_EXP.exec(ln)) != null) {
                    description.DeathExp = parseInt(match[1]);
                    description.FightExp = parseInt(match[2]);
                    look_inventory = false;
                } else if ((match = this.re_LOOT_MONEY.exec(ln)) != null) {
                    description.Money = parseInt(match[1]);
                    look_inventory = false;
                } else if ((match = this.re_LOOT_START.exec(ln)) != null) {
                    description.Loot = {};
                    look_inventory = true;
                } else if (look_inventory && (match = this.re_LOOT_ITEM.exec(ln)) != null) {
                    description.Loot[match[1]] = true;
                } else {
                    look_inventory = false;
                }
            } else {
                for (var prop in this.re_properties)
                    if ((match = this.re_properties[prop].exec(ln)) != null)
                        if (match.length > 0) {
                            description = {};
                            description.Properties = {};
                            description.Properties[prop] = true;
                            this.AddMob(match[1], description);
                        }
            }
        }
        if (name != null) {
            this.AddMob(name, description);
        }
    };

addon.MobBriefDescription =
    function(name) {
        var i;
        var ret = "&P" + name + "&w";
        if (!(name in addon.Data.Mobs))
            return ret;// + "&r: нет информации о таком мобе";
        var desc = addon.Data.Mobs[name];
        ret += ": ";
        
        if ("Count" in desc.Moneys) {
            if (desc.Moneys.Min == desc.Moneys.Max)
                ret += "&Y" + desc.Moneys.Max + "$";
            else
                ret += "&Y" + desc.Moneys.Min + ".." + desc.Moneys.Max + "(" + desc.Moneys.Avg.toFixed(0) + ")$";
            ret += " ";
        }
        
        var loot = "";
        for (var item in desc.Loot) {
            if (loot.length > 0)
                loot += ", ";
            loot += item;
        }
        if (loot.length > 0)
            ret += "&W[&g" + loot + "&W] ";
        
        var props = "";
        for (var prop in desc.Properties) {
            if (props.length > 0)
                props += ", ";
            props += prop;
        }
        if (props.length > 0)
            ret += "&W[&r" + props + "&W] ";
        
        var best_exp = 0.0, best_lvl = 50;
        var min_lvl = 50, max_lvl = 1;
        for (var lvl in desc.FightExps) {
            if (desc.FightExps[lvl].Avg > 0 && lvl < 50) {
                if (min_lvl > lvl)
                    min_lvl = lvl;
                if (max_lvl > lvl)
                    max_lvl = lvl;
            }
            if ((desc.FightExps[lvl].Avg > best_exp && lvl < 50) || 
                (desc.FightExps[lvl].Avg > 0 && best_lvl >= 50)) {
                best_lvl = lvl;
                best_exp = desc.FightExps[lvl].Avg;
            }
        }
        if (best_exp > 0.0) {
            if (best_lvl < 50)
                lvl_info = "&YL" + best_lvl;
            else
                lvl_info = "&YL" + "?";
            if (min_lvl < max_lvl)
                lvl_info += "(" + min_lvl + ".." + max_lvl + ")";
            lvl_info += " &R" + desc.FightExps[best_lvl].Avg.toFixed(0);
            if (desc.FightExps[best_lvl].Min != desc.FightExps[best_lvl].Max)
                lvl_info += " (" + desc.FightExps[best_lvl].Min + ".." + desc.FightExps[best_lvl].Max + ")";
            ret += " &Wexp: " + lvl_info;
        }
        
        return ret;
    };

addon.DisplayMobsList = 
    function(text, list) {
        JMCPlus.ShowWithColors("&Y" + text);
        if (list.length == 0)
            JMCPlus.ShowWithColors("&RNONE");
        for (var i = 0; i < list.length && i < 50; i++)
            JMCPlus.ShowWithColors("  &W" + (i + 1) + ". &w" + addon.MobBriefDescription(list[i]));
        if (list.length > 50)
            JMCPlus.ShowWithColors("&Y... another &G" + (list.length - 50) + " &Ymobs");
    };

addon.Handlers = {};

addon.Handlers.OnConnected = 
    function(event) {
        addon.CharLevel = null;
        addon.CharName = null;
        addon.LastEnemy = "";
    };

addon.Handlers.OnPrompt = 
    function(promptdata) {
        addon.ScanForMobsData(promptdata[0]);
        if (promptdata[1].ENEMY != null && 
            promptdata[1].ENEMY != "" &&
            promptdata[1].ENEMY != "НЕТ") {
            var tokens = promptdata[1].ENEMY.split(':');
            if (tokens.length == 2 && tokens[0] != "Кто-то")
                addon.LastEnemy = tokens[0];
        }
    };

addon.Handlers.OnCharParameterChanged = 
    function(eventdata) {
        var param = eventdata[0];
        var oldvalue = eventdata[1];
        var newvalue = eventdata[2];
        if (param == "Level")
            addon.CharLevel = newvalue;
        else if (param == "Name")
            addon.CharName = newvalue;
    };

JMCPlus.AddExtCommand("лут?",
    ["лут\\? (.+)", "loot\\? (.+)"],
    function(arguments, executer) {
        var re_loot = new RegExp(arguments[0].replace(/\-/g, "\\-"), "i");
        
        var list = [];
        for (var name in addon.Data.Mobs)
            for (var loot in addon.Data.Mobs[name].Loot)
                if (re_loot.test(loot)) {
                    list.push(name);
                    break;
                }
        
        JMCPlus.Jmc.ShowMe("");
        addon.DisplayMobsList("&WМобы, с которых можно слутить что-то вроде '&C" + arguments[0] + "&W':", list);
        return true;
    },
    addon,
    "лут? <шаблон для поиска лута>");

JMCPlus.AddExtCommand("моб",
    ["моб (.+)", "mob (.+)"],
    function(arguments, executer) {
        var re_mob = new RegExp(arguments[0].replace("-", "\\-"), "i");
        
        var list = [];
        for (var mob in addon.Data.Mobs)
            if (re_mob.test(mob))
                list.push(mob);
        
        JMCPlus.Jmc.ShowMe("");
        addon.DisplayMobsList("&WМобы по запросу <&C" + re_mob.source + "&W>: ", list);
        return true;
    },
    addon,
    "моб <название моба>");

JMCPlus.AddExtCommand("моб?",
    ["моб\\? ([0-9]{1,2})\\-([0-9]{1,2})", "mob\\? ([0-9]{1,2})\\-([0-9]{1,2})"],
    function(arguments, executer) {
        var min_lvl = parseInt(arguments[0]);
        var max_lvl = parseInt(arguments[1]);
        
        var list = [];
        
        for (var mob in addon.Data.Mobs) {
            var exps = addon.Data.Mobs[mob].FightExps;
            for (var lvl in exps)
                if (min_lvl <= lvl && lvl <= max_lvl)
                    list.push([exps[lvl].Avg, mob]);
        }
        list.sort(function(a, b) { return b[0] - a[0]; });
        
        for (var i = 0; i < list.length; i++)
            list[i] = list[i][1];
        
        JMCPlus.Jmc.ShowMe("");
        addon.DisplayMobsList("Найденные мобы: ", list);
        return true;
    },
    addon,
    "моб? <мин. уровень>-<макс. уровень>");

JMCPlus.AddExtCommand("убитые",
    ["убитые ([0-9]+)", "killed ([0-9]+)"],
    function(arguments, executer) {
        var n_unique = parseInt(arguments[0]);
        
        if (typeof addon.CharName !== 'string') {
            JMCPlus.ShowWithColors("&RНеизвестный персонаж");
        } else if (!(addon.CharName in addon.Data.KilledQueues)) {
            JMCPlus.ShowWithColors("&RНет информации по персонажу: &W" + addon.CharName);
        } else if (!isNaN(n_unique)) {
            var queue = addon.Data.KilledQueues[addon.CharName];
            var list = [];
            var added = {};
            for (var i = queue.length - 1; i >= 0 && list.length < n_unique; i--)
                if (!(queue[i].M in added)) {
                    list.push({"Name": queue[i].M, "Count": queue[i].N});
                    added[queue[i].M] = list.length - 1;
                } else {
                    list[added[queue[i].M]].Count += queue[i].N;
                }
            
            for (var i = 0; i < list.length; i++)
                list[i] = list[i].Name;
            
            JMCPlus.Jmc.ShowMe("");
            addon.DisplayMobsList("&WПоследние убитые мобы (не более <&C" + n_unique + "&W> уникальных) от поздних к ранним: ", list);
        }
        
        return true;
    },
    addon,
    "убитые <кол-во последних уникальных названий>");

JMCPlus.AddExtCommand("замакс",
    ["замакс", "expmaxed"],
    function(arguments, executer) {
        if (typeof addon.CharName !== 'string') {
            JMCPlus.ShowWithColors("&RНеизвестный персонаж");
        } else if (!(addon.CharName in addon.Data.MobKills)) {
            JMCPlus.ShowWithColors("&RНет информации по персонажу: &W" + addon.CharName);
        } else {
            var mobkills = addon.Data.MobKills[addon.CharName];
            var list = [];
            for (var i = 0; i < mobkills.length; i++)
                list.push({"Name": mobkills[i].MobName, "Count": mobkills[i].Count});
            
            for (var i = 0; i < list.length; i++) {
                var color = "w";
                if (list[i].Count <= 5)
                    color = "G";
                else if (list[i].Count <= 10)
                    color = "g";
                else if (list[i].Count <= 15)
                    color = "Y";
                else if (list[i].Count <= 20)
                    color = "O";
                else
                    color = "R";
                list[i] = list[i].Name + " (&" + color + "x" + list[i].Count + "&P)";
            }
            
            JMCPlus.Jmc.ShowMe("");
            addon.DisplayMobsList("&WМобы с штрафом на экспу для персонажа <&C" + addon.CharName +" &YL" + addon.CharLevel + "&W>: ", list);
        }
        
        return true;
    },
    addon,
    "замакс");

JMCPlus.AddExtCommand("кач?",
    ["кач\\?( [0-9]+)?( размакс)?", "lvl\\?( [0-9]+)?( размакс)?"],
    function(arguments, executer) {
        var max_cnt;
        var demax;
        if (isNaN(max_cnt = parseInt(arguments[0])) &&
            isNaN(max_cnt = parseInt(arguments[1])) )
            max_cnt = 10;
        demax = (arguments[0] == ' размакс' || arguments[1] == ' размакс');
        if (typeof addon.CharName !== 'string') {
            JMCPlus.ShowWithColors("&RНеизвестный персонаж");
        } else if (!(addon.CharName in addon.Data.MobKills)) {
            JMCPlus.ShowWithColors("&RНет информации по персонажу: &W" + addon.CharName);
        } else {
            var mobkills = addon.Data.MobKills[addon.CharName];
            var kills = {};
            var exps = {};
            
            for (var i = 0; i < mobkills.length; i++)
                kills[mobkills[i].MobName] = mobkills[i].Count;
            
            for (var mob in addon.Data.Mobs) {
                var desc = addon.Data.Mobs[mob];
                if ("FightExps" in desc)
                    for (var lvl = addon.CharLevel; lvl > 1 && lvl > addon.CharLevel - 10; lvl--)
                        if (lvl in desc.FightExps) {
                            var modexp = desc.FightExps[lvl].Max / 10.0 * (10.0 - (addon.CharLevel - lvl));
                            if (!(mob in exps))
                                exps[mob] = modexp;
                            else if (exps[mob] < modexp)
                                exps[mob] = modexp;
                        }
            }
            
            var list = [];
            
            for (var mob in exps) {
                var exp = exps[mob];
                var cnt = 0;
                if (mob in kills) {
                    cnt = kills[mob];
                    if (cnt >= 20)
                        exp = 0;
                    else {
                        exp = (exp * (20 - cnt)) / 20;
                        if (cnt > 15)
                            exp /= 3;
                        else if (cnt > 10)
                            exp /= 2;
                    }
                }
                exps[mob] = exp;
                
                if (exp > 0 && (!demax || cnt == 0))
                    list.push({"Name": mob, "Exp": exp, "Count": cnt});
            }
            list.sort(function(a, b) { return b.Exp - a.Exp; });
            
            if (list.length > max_cnt)
                list = list.slice(0, max_cnt);
            
            for (var i = 0; i < list.length; i++)
                list[i] = list[i].Name + " (&G<= " + list[i].Exp.toFixed(0) + "&P" + (list[i].Count == 0 ? "" : ", &Wx" + list[i].Count + "&P") + ")";
            
            JMCPlus.Jmc.ShowMe("");
            addon.DisplayMobsList("&WМобы для кача <&C" + addon.CharName +" &YL" + addon.CharLevel + "&W>: ", list);
        }
        
        return true;
    },
    addon,
    "кач?[ <макс кол-во>][ размакс]");
JMCPlus.AddExtCommand("убитые-",
    ["убитые- (.+)", "killed- (.+)"],
    function(arguments, executer) {
        if (typeof addon.CharName !== 'string') {
            JMCPlus.ShowWithColors("&RНеизвестный персонаж");
        } else if (!(addon.CharName in addon.Data.MobKills)) {
            JMCPlus.ShowWithColors("&RНет информации по персонажу: &W" + addon.CharName);
        } else {
            var re = new RegExp(arguments[0], "i");
            var mobkills = addon.Data.MobKills[addon.CharName];
            var found = false;
            for (var i = 0; i < mobkills.length; i++)
                if (re.exec(mobkills[i].MobName)) {
                    JMCPlus.ShowWithColors("&WУдалён моб: " + addon.MobBriefDescription(mobkills[i].MobName));
                    addon.Data.MobKills[addon.CharName].splice(i, 1);
                    found = true;
                    break;
                }
            if (!found)
                JMCPlus.ShowWithColors("&WМоб не найден: &R" + arguments[0]);
                
        }
        
        return true;
    },
    addon,
    "убитые- <имя моба>");

JMCPlus.AddAddon(addon);
