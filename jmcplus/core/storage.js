/*
    storage.js
    2016-01-14
*/

JMCPlus.Storage = {};

JMCPlus.Storage.Name = "General storage of configuration and data";

JMCPlus.Storage.Data = {};

JMCPlus.Storage.DataRoot = JMCPlus.Root + "data\\";

JMCPlus.Storage.MakeDataPath = 
    function() {
        return this.DataRoot + JMCPlus.GetProfile() + "\\";
    };

JMCPlus.Storage.Load = 
    function() {
        this.Data = {};
        try {
            var path = this.MakeDataPath();
            FS.CreatePath(path);
            var list = FS.ListFiles(path, /.+\.json$/i, false);
            for (var i = 0; i < list.length; i++) {
                var fname = list[i].substr(list[i].lastIndexOf("\\") + 1); //remove directory
                fname = fname.substr(0, fname.length - 5); //remove extension ".json"
                //this.Data[fname] = JSON.parse(FS.ReadFile(list[i]));
                this.Data[fname] = JSON.parse(FS.ReadFile(list[i]),
                    function (key, value) { //convert ISO-formatted strings to Date objects
                        var a;
                        if (typeof value === 'string') {
                            a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                            if (a) {
                                return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
                            }
                        }
                        return value;
                    });
            }
            JMCPlus.DebugOutput("JMCPlus.Storage.Load(): done");
        } catch(e) {
            JMCPlus.ErrorOutput(e, "JMCPlus.Storage.Load()");
        }
    };

JMCPlus.Storage.Save = 
    function() {
        try {
            var path = this.MakeDataPath();
            FS.CreatePath(path);
            for (var key in this.Data)
                FS.WriteFile(path + key + ".json", JSON.stringify(this.Data[key], null, "  "));
            JMCPlus.DebugOutput("JMCPlus.Storage.Save(): done");
        } catch(e) {
            JMCPlus.ErrorOutput(e, "JMCPlus.Storage.Save()");
        }
    };

JMCPlus.Storage.GetCategory = 
    function(addon, category) {
        var cat;
        if (typeof addon.ID !== 'string')
            throw new Error("Storage: trying to get category of addon with unknown ID");
        cat = category.toUpperCase();
        if (!(addon.ID in this.Data))
            this.Data[addon.ID] = {};
        if (!(cat in this.Data[addon.ID]))
            this.Data[addon.ID][cat] = {};
        return this.Data[addon.ID][cat];
    };

JMCPlus.Storage.SetCategory = 
    function(addon, category, data) {
        if (typeof addon.ID !== 'string')
            throw new Error("Storage: trying to set category of addon with unknown ID");
        if (!(addon.ID in this.Data))
            this.Data[addon.ID] = {};
        this.Data[addon.ID][category.toUpperCase()] = data;
    };

JMCPlus.Storage.Flush = 
    function(addon) {
        if (typeof addon.ID !== 'string')
            throw new Error("Storage: trying to flush addon with unknown ID");
        if (!(addon.ID in this.Data))
            this.Data[addon.ID] = {};
        for (var field in addon) {
            var key = field.toUpperCase();
            if (key in this.Data[addon.ID])
                this.Data[addon.ID][key] = addon[field];
        }
    };

JMCPlus.Storage.EnsureExistance = 
    function(dataset, field, default_value) {
        if (!(field in dataset))
            dataset[field] = default_value;
        return dataset;
    };

JMCPlus.AddExtCommand("сохранить",
    ["сохранить", "save"],
    function(arguments, executer) {
        JMCPlus.Storage.Save();
        return true;
    },
    JMCPlus.Storage);

JMCPlus.AddExtCommand("загрузить",
    ["загрузить", "load"],
    function() {
        JMCPlus.Storage.Load();
        return true;
    },
    JMCPlus.Storage);

JMCPlus.Handlers.OnUnload.push(
    function() {
        JMCPlus.Storage.Save();
    });
