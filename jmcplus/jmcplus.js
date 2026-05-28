JMCPlus = {};

JMCPlus.Engine = ScriptEngine() + " " +
                 "v" + ScriptEngineMajorVersion() + 
                 "." + ScriptEngineMinorVersion() + 
                 "." + ScriptEngineBuildVersion() ;
JMCPlus.Root = ".\\jmcplus\\"

/*
    Copy all COM JmcObj methods to JMCPlus
    TODO: replace hard-coded list with some reflection trick
*/
JMC_METHODS_LIST = 
    ["GetVar", "SetVar", "SetStatus", "SetHotkey", "Disconnect", "Connect", "DropEvent",
     "RegisterHandler", "Eval", "KillTimer", "SetTimer", "Output", "Parse", "Beep", 
     "Send", "ShowMe", "Quit", "Run", "Play", "wOutput"];

JMCPlus.Jmc = {};
for (var i = 0; i < JMC_METHODS_LIST.length; i++) {
    var method = JMC_METHODS_LIST[i];
    JMCPlus.Jmc[method] = (function(mname) {
        return function(arg1, arg2, arg3) {
            try {
                if(arg1 == null && arg2 == null && arg3 == null) {
                    return jmc[mname]();
                } else if(arg2 == null && arg3 == null) {
                    return jmc[mname](arg1);
                } else if(arg3 == null) {
                    return jmc[mname](arg1, arg2);
                } else {
                    return jmc[mname](arg1, arg2, arg3);
                } 
            } catch(e) {
                JMCPlus.ErrorOutput(e, "jmc." + mname + "()");
            }
            return  null;
        };
    })(method);
}

/*
    Add getters for some properties
    (we want to wrap access to jmc.Event and jmc.CommandChar)
*/
JMCPlus.GetProfile = 
    function() {
        return jmc.Profile;
    };

JMCPlus.IsConnected = 
    function() {
        return jmc.IsConnected;
    };

/*
    Add methods for all JMC commands
    TODO: read command list from internals of JMC (at least via #help command)
*/
JMC_COMMANDS_LIST = 
    ["variable", "action", "alias", "read", "if", "group", "loop", 
     "tolower", "toupper", "antisubstitute", "drop", "nodrop", "cr", 
     "echo", "highlight", "ignore", "info", "killall", "kickall", 
     "log", "map", "mark", "math", "message", "output", "path", 
     "pathdir", "presub", "return", "scriptlet", "savepath", "showme", 
     "speedwalk", "textin", "substitute", "gag", "tick", "tickon", 
     "tickoff", "tickset", "ticksize", "togglesubs", "unaction", 
     "unalias", "unantisubstitute", "unpath", "unvar", "write", "zap", 
     "hotkey", "unhotkey", "connect", "bell", "char", "status", 
     "tabadd", "tabdel", "multiaction", "multisubstitute", "multihighlight", 
     "verbatim", "nope", "quit", "hidewindow", "restorewindow", "tray", 
     "reloadscripts", "use", "unuse", "systemexec", "ps", "tslist", 
     "terminate", "tskill", "play", "woutput", "wdock", "wshow", "wpos", 
     "wlog", "wname", "logadd", "logpass", "flash", "next", "daa", "whisper", 
     "hide", "race", "spit", "stick", "lick", "feed", "colon", "wait", "wt", 
     "break", "abort", "pinch", "resume", "tmlist", "llist", "unsubstitute", 
     "comment", "race", "sos", "grab", "help", "clean", "prefix", "winamp", 
     "wamp", "autoreconnect", "run", "clear", "wclear"];

JMCPlus.Cmd = {};
for (var i = 0; i < JMC_COMMANDS_LIST.length; i++) {
    var command = JMC_COMMANDS_LIST[i];
    var method = command.substr(0, 1).toUpperCase() + command.substr(1);
    JMCPlus.Cmd[method] = (function(cmdname) {
        return function() {
            var args = "";
            for(var i = 0; i < arguments.length; i++)
                args += " {" + arguments[i] + "}";
            try {
                jmc.Parse(jmc.CommandChar + cmdname + args);
            } catch(e) {
                JMCPlus.ErrorOutput(e, "jmc.Parse(" + cmdname + args + ")");
            }
        };
    })(command);
}

/*
    Add usable interface for COM JmcObj events
    TODO: replace hard-coded list with some reflection trick
*/
JMC_EVENTS_LIST = 
    ["Connected", "ConnectLost", "Incoming", "Input",
     "Timer", "PreTimer", "Load", "Unload"];

JMCPlus.Events = {};
JMCPlus.Handlers = {};
JMCPlus.AddEvent = 
    function(event, activex) {
        var handler = "On" + event;
        if (!(handler in JMCPlus.Handlers))
            JMCPlus.Handlers[handler] = [];
        if (!(handler in JMCPlus.Events))
            JMCPlus.Events[handler] = (function(handlername) {
                return function() {
                    var param = (activex == true) ? jmc.Event : JMCPlus.Event;
                    for (var i = 0; i < JMCPlus.Handlers[handlername].length; i++) {
                        try {
                            var retval = JMCPlus.Handlers[handlername][i](param);
                            if (retval != null)
                                param = retval;
                        } catch(e) {
                            JMCPlus.ErrorOutput(e, "Handler " + handlername + "[" + i + "]()");
                            JMCPlus.Handlers[handlername].splice(i, 1);
                            i--;
                        }
                    }
                    for (var addonid in JMCPlus.Addons) {
                        if (JMCPlus.Addons[addonid].Handlers == null)
                            continue;
                        if (typeof JMCPlus.Addons[addonid].Handlers[handlername] !== 'function')
                            continue;
                        try {
                            var retval = JMCPlus.Addons[addonid].Handlers[handlername](param);
                            if (retval != null)
                                param = retval;
                        } catch(e) {
                            JMCPlus.ErrorOutput(e, "Handler " + addonid + "." + handlername + "()");
                            delete JMCPlus.Addons[addonid].Handlers[handlername];
                        }
                    }
                    if (activex == true)
                        jmc.Event = param;
                    else
                        JMCPlus.Event = param;
                };
            })(handler);
        if (activex == true)
            jmc.RegisterHandler(event, "JMCPlus.Events." + handler + "()");
    };
for (var i = 0; i < JMC_EVENTS_LIST.length; i++)
    JMCPlus.AddEvent(JMC_EVENTS_LIST[i], true);

JMCPlus.FireEvent = 
    function(event, param) {
        var handler = "On" + event;
        if (handler in JMCPlus.Events) {
            JMCPlus.Event = param;
            JMCPlus.Events[handler]();
            return JMCPlus.Event;
        }
    };

JMCPlus.ExtendedCommands = {};
JMCPlus.AddExtCommand = 
    function(cmd_name, cmd_patterns, callback, executer, call_descr) {
        //var cmd_re = "\\" + jmc.CommandChar + "\\" + jmc.CommandChar;
        var cmd_re = "\\!";
        var res = [];
        if (typeof cmd_patterns === 'string') {
            res.push(new RegExp("^" + cmd_re + cmd_patterns + "$", "i"));
        } else {
            for (var i = 0; i < cmd_patterns.length; i++) 
                res.push(new RegExp("^" + cmd_re + cmd_patterns[i] + "$", "i"));
        }
        JMCPlus.ExtendedCommands[cmd_name] = 
            {"REs": res,
             "Callback": callback,
             "Executer": executer,
             "ExecuterName": ("Name" in executer) ? executer.Name : "unknown",
             "Description": (call_descr == null || call_descr.length == 0) ? cmd_name : call_descr
            };
    };

JMCPlus.Handlers.OnInput.push(
    function(line) {
        for (var cmd in JMCPlus.ExtendedCommands) {
            for (var i = 0; i < JMCPlus.ExtendedCommands[cmd].REs.length; i++) {
                var match = JMCPlus.ExtendedCommands[cmd].REs[i].exec(line);
                if (match != null) {
                    try {
                        match.shift();
                        if (JMCPlus.ExtendedCommands[cmd].Callback(match, JMCPlus.ExtendedCommands[cmd].Executer) == true) {
                            JMCPlus.Jmc.DropEvent();
                            return;
                        }
                    } catch(e) {
                        JMCPlus.ErrorOutput(e, "JMCPlus.Hanlders.OnInput.ExtendedCommand[" + cmd + "]");
                    }
                    break;
                }
            }
        }
    });

JMCPlus.AddExtCommand("справка",
    ["справка(?: (.+))?", "help(?: (.+))?", "\\?(?: (.+))?"], 
    function(arguments, executer) {
        var command = arguments[0];
        if (command == null || command.length == 0) {
            var help = ["Available extended commands:"];
            var cnt = 0;
            for (var cmd in JMCPlus.ExtendedCommands) {
                cnt += 1;
                help.push(cnt + ". " + cmd);
            }
            for (var i = 0; i < help.length; i++)
                JMCPlus.Jmc.ShowMe(help[i]);
        } else if (command in JMCPlus.ExtendedCommands) {
            JMCPlus.Jmc.ShowMe("Command : " + command);
            JMCPlus.Jmc.ShowMe("Syntax  : " + JMCPlus.ExtendedCommands[command].Description);
            JMCPlus.Jmc.ShowMe("Executer: " + JMCPlus.ExtendedCommands[command].ExecuterName);
        } else {
            JMCPlus.Jmc.ShowMe("Unknown command: " + command);
        }
        return true;
    },
    JMCPlus,
    "справка[ <команда>]");
    

/*
    Basic output
*/
MIN_WINDOW_NUMBER = 1
MAX_WINDOW_NUMBER = 9
JMCPLUS_WINDOW_NUMBER = 1;

JMCPlus.WriteLine = 
    function(Line, Color) {
        JMCPlus.Jmc.wOutput(JMCPLUS_WINDOW_NUMBER, "[" + (new Date()).toLocaleTimeString() + "] [JMC+] " + Line, Color);
    };
JMCPlus.DebugOutput = 
    function(Text) {
        this.WriteLine("[Debug] " + Text, "brown");
    };

JMCPlus.ErrorOutput = 
    function(ErrObj, FuncName) {
        var msg;
        if (FuncName == null)
            msg = "[Error]";
        else
            msg = "[Error in " + FuncName + "]";
        if ("number" in ErrObj)
            msg = msg + " (" + ErrObj.number + ")";
        msg = msg + ": " + ErrObj.description;
        this.WriteLine(msg, "red");
    };

/*
    Window handling
*/
JMCPlus.Windows = {};

JMCPlus.AllocateWindow = 
    function(Name, Number, Docked, LogFile) {
        var n = Number;
        if (n == null) {
            for (var i = MIN_WINDOW_NUMBER; i <= MAX_WINDOW_NUMBER; i++)
                if (JMCPlus.Windows[i] == null) {
                    n = i;
                    break;
                }
        }
        if (n == null) {
            JMCPlus.ErrorOutput(new Error("Can't allocate output window"), "JMCPlus.AllocateWindow()");
        } else {
            JMCPlus.Windows[n] = Name;
            JMCPlus.Cmd.Wname(n, Name);
            if (Docked != null)
                JMCPlus.Cmd.Wdock(n, Docked);
            if (LogFile != null) {
                var path;
                if (typeof FS === 'object') {
                    path = JMCPlus.Root + "logs\\" + JMCPlus.GetProfile();
                    FS.CreatePath(path);
                } else {
                    path = JMCPlus.Root + "logs";
                }
                JMCPlus.Cmd.Wlog(n, path + "\\" + LogFile + ".log", "append");
            }
        }
        return n;
    };

JMCPlus.AllocateWindow("JMC+", JMCPLUS_WINDOW_NUMBER, "disable", "jmcplus");

/*
    StatusBars handling
*/
MIN_STATUSBAR_NUMBER = 1
MAX_STATUSBAR_NUMBER = 5

JMCPlus.StatusBars = {};

JMCPlus.AllocateStatusBar = 
    function(Number) {
        var n = Number;
        if (n == null) {
            for (var i = MIN_STATUSBAR_NUMBER; i <= MAX_STATUSBAR_NUMBER; i++)
                if (JMCPlus.StatusBars[i] == null) {
                    n = i;
                    break;
                }
        }
        if (n == null) {
            JMCPlus.ErrorOutput(new Error("Can't allocate status bar"), "JMCPlus.AllocateStatusBar()");
        } else {
            JMCPlus.StatusBars[n] = n;
        }
        return n;
    };


JMCPlus.WriteLine("Engine: " + JMCPlus.Engine);

JMCPlus.WriteLine("Initializing minimal input-output subsystem...");

var fso = new ActiveXObject("Scripting.FileSystemObject");
var fs_file = fso.OpenTextFile(JMCPlus.Root + "minimal_fs.js", 1); //Mode = read-only
eval(fs_file.ReadAll());
fs_file.Close();
delete fso;

JMCPlus.LoadScript = function(ScriptPath) {
    try {
        JMCPlus.DebugOutput("Loading script: " + ScriptPath);
        eval(FS.ReadFile(ScriptPath));
    } catch(e) {
        JMCPlus.ErrorOutput(e, "JMCPlus.LoadScript(" + ScriptPath + ")");
    }
};

JMCPlus.DebugOutput("Includes...");
var includes = FS.ListFiles(JMCPlus.Root + "include", /.+\.js$/i, true);
for (var i = 0; i < includes.length; i++)
    JMCPlus.LoadScript(includes[i]);

JMCPlus.DebugOutput("Core...");
var core_files = FS.ListFiles(JMCPlus.Root + "core", /.+\.js$/i, true);
for (var i = 0; i < core_files.length; i++)
    JMCPlus.LoadScript(core_files[i]);

/*
    Basic addons routines
*/
JMCPlus.AddAddon = 
    function(addon) {
        if (typeof addon.ID !== 'string') {
            JMCPlus.ErrorOutput(new Error("Trying to add addon without <ID> field"), "AddAddon()");
        } else {
            this.Addons[addon.ID] = addon;
            addon.Config = JMCPlus.Storage.GetCategory(addon, "config");
            addon.Data = JMCPlus.Storage.GetCategory(addon, "data");
            if ("Init" in addon)
                addon.Init();
        }
    };

JMCPlus.RemoveAddon = 
    function(addon) {
        if (typeof addon.ID !== 'string') {
            JMCPlus.ErrorOutput(new Error("Trying to remove addon without <ID> field"), "RemoveAddon()");
        } else if (addon.ID in this.Addons) {
            delete this.Addons[addon.ID];
        }
    };

JMCPlus.Addons = {};
JMCPlus.Addons[JMCPlus.AddonManager.ID] = JMCPlus.AddonManager;

JMCPlus.WriteLine("Started [profile <" + JMCPlus.GetProfile() + ">].");
