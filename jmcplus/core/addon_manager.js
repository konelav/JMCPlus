/*
    addon_manager.js
    2016-01-14
*/

JMCPlus.AddonManager = {};

JMCPlus.AddonManager.ID = "addon_manager";

JMCPlus.AddonManager.Name = "JMC+ addons manager";

JMCPlus.AddonManager.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Config, "AddonsDir", "addons");
        JMCPlus.Storage.EnsureExistance(this.Data, "AddonsList", {});
        
        var dir = JMCPlus.Root + this.Config.AddonsDir;
        JMCPlus.DebugOutput("Loading addons from " + dir);
        
        var addon_files = FS.ListFiles(dir, /.+\.js$/i, true);
        for (var i = 0; i < addon_files.length; i++) {
            var fname = addon_files[i].substr(addon_files[i].lastIndexOf("\\") + 1); //remove directory
            if (!(fname in this.Data.AddonsList))
                this.Data.AddonsList[fname] = {
                    "Suspended": false,
                    "AddonsIDs": []
                };
            if (!this.Data.AddonsList[fname].Suspended) {
                var old_addons = {};
                for (var addon in JMCPlus.Addons)
                    old_addons[addon] = true;
                JMCPlus.LoadScript(addon_files[i]);
                this.Data.AddonsList[fname].AddonsIDs = [];
                for (var addon in JMCPlus.Addons)
                    if (!(addon in old_addons)) {
                        JMCPlus.Addons[addon].Source = fname;
                        this.Data.AddonsList[fname].AddonsIDs.push(addon);
                    }
                JMCPlus.Storage.Flush(JMCPlus.Addons[addon]);
            }
        }
        JMCPlus.Storage.Flush(this);
    };

JMCPlus.AddonManager.Handlers = {};

JMCPlus.AddonManager.Handlers.OnLoad = 
    function() {
        JMCPlus.Storage.Load();
        JMCPlus.Addons = {};
        JMCPlus.AddAddon(JMCPlus.AddonManager);
        JMCPlus.Storage.Save();
    };

/*
    Addons management
*/

JMCPlus.AddonManager.SetDir = 
    function(newdir) {
        this.Config.AddonsDir = newdir;
        JMCPlus.Storage.Flush(this);
        JMCPlus.ShowMe("New addons directory: " + newdir);
    };

JMCPlus.AddonManager.ListAvailable = 
    function() {
        var dir = JMCPlus.Root + this.Config.AddonsDir;
        var addon_files = FS.ListFiles(dir, /.+\.js$/i, true);
        JMCPlus.Jmc.ShowMe("List of available JMC+ add-on scripts (" + dir + "):");
        for (var i = 0; i < addon_files.length; i++) {
            var fname = addon_files[i].substr(addon_files[i].lastIndexOf("\\") + 1);
            if (!(fname in this.Data.AddonsList))
                this.Data.AddonsList[fname] = {
                    "Suspended": false,
                    "AddonsIDs": []
                };
            var info = this.Data.AddonsList[fname];
            JMCPlus.Jmc.ShowMe((i + 1) + ". " + fname + 
                               JSON.stringify(info.AddonsIDs) + 
                               (info.Suspended ? " (SUSPENDED) " : ""));
        }
        if (addon_files.length == 0)
            JMCPlus.Jmc.ShowMe("NO SCRIPTS FOUND");
    };

JMCPlus.AddonManager.List = 
    function() {
        JMCPlus.Jmc.ShowMe("List of currently running JMC+ add-on scripts:");
        var i = 0;
        for (var addonid in JMCPlus.Addons) {
            i += 1;
            var src = "";
            if (typeof JMCPlus.Addons[addonid].Source === 'string')
                src = " (" + JMCPlus.Addons[addonid].Source + ")";
            JMCPlus.Jmc.ShowMe(i + ". [" + addonid + "] " + JMCPlus.Addons[addonid].Name + src);
        }
        if (i == 0)
            JMCPlus.Jmc.ShowMe("NO ADDONS FOUND");
    };

JMCPlus.AddonManager.Suspend = 
    function(addon, suspend) {
        var id = null;
        if( typeof addon === 'string') {
            id = addon;
        } else if( typeof addon === 'number') {
            var i = 0;
            for (var addonid in JMCPlus.Addons) {
                i += 1;
                if (i == addon) {
                    id = addonid;
                    break;
                }
            }
        } else {
            var i = 0;
            for (var addonid in JMCPlus.Addons) {
                i += 1;
                if (JMCPlus.Addons[addonid] == addon) {
                    id = addonid;
                    break;
                }
            }
        }
        if( id == null ) {
            JMCPlus.Jmc.ShowMe("Can't find add-on: " + JSON.stringify(addon));
        } else {
            var set = suspend;
            if (set == null)
                set = true;
            var target_fname = "";
            for (var fname in this.Data.AddonsList) {
                for (var i = 0; i < this.Data.AddonsList[fname].AddonsIDs.length; i++)
                    if (this.Data.AddonsList[fname].AddonsIDs[i] == id) {
                        target_fname = fname;
                        break;
                    }
                if (target_fname.length > 0)
                    break;
            }
            if (target_fname.length == 0)  {
                JMCPlus.Jmc.ShowMe("Can't find script with addon <" + id + ">");
            } else {
                this.Data.AddonsList[target_fname].Suspended = set;
                JMCPlus.Storage.Flush(this);
                JMCPlus.Jmc.ShowMe((set ? "Suspended" : "Unsuspended") + " addons: " + 
                                   JSON.stringify(this.Data.AddonsList[target_fname].AddonsIDs));
            }
        }
    };

JMCPlus.AddExtCommand("אההמםû",
    ["אההמםû", "addons"],
    function(arguments, executer) {
        JMCPlus.AddonManager.List();
        return true;
    },
    JMCPlus.AddonManager);
