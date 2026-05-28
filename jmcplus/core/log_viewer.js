JMCPlus.LogViewer = {};

JMCPlus.LogViewer.Name = "Log viewer module with RMA interpretation";

JMCPlus.LogViewer.LogFile = null;
JMCPlus.LogViewer.Timer = null;
JMCPlus.LogViewer.NextLine = "";

JMCPlus.LogViewer.re_RMACMD = new RegExp("\x1bp:(\\d+)m", "gi");
JMCPlus.LogViewer.re_RMACMD_REPLACE = new RegExp(JMCPlus.LogViewer.re_RMACMD.source, "gi");

JMCPlus.LogViewer.IsPlaying = 
    function() {
        return (this.LogFile != null);
    };

JMCPlus.LogViewer.Stop = 
    function() {
        JMCPlus.Timers.DelTimer(this.Timer);
        if (this.LogFile != null) {
            this.LogFile.Close();
            JMCPlus.Jmc.ShowMe("Log viewer stopped");
            this.LogFile = null;
        }
    };

JMCPlus.LogViewer.Play = 
    function(FileName, Acceleration) {
        var min_acc = 0.5, max_acc = 1e9;
        if (this.IsPlaying())
            this.Stop();
        
        if (typeof Acceleration !== 'number')
            this.Acceleration = 1.0;
        else if (Acceleration < min_acc)
            this.Acceleration = min_acc;
        else if (Acceleration > max_acc)
            this.Acceleration = max_acc;
        else
            this.Acceleration = Acceleration;
        
        try {
            var file = FS.FSO.GetFile(FileName);
            this.LogFile = file.OpenAsTextStream(1);
            this.NextLine = "";
            this.Timer = JMCPlus.Timers.AddTimer(new Date(), 1, 0, 
                function(count) {
                    JMCPlus.LogViewer.PlayLine(count);
                });
        } catch(e) {
            JMCPlus.ErrorOutput(e, "LogViewer.Play()");
            this.LogFile = null;
            return;
        }
    };

JMCPlus.LogViewer.PlayLine = 
    function(LineNum) {
        try {
            var dt = 0;
            
            while (dt < JMCPlus.Timers.MINIMUM_PERIOD_MS && !this.LogFile.AtEndOfStream) {
                if (true) {
                    jmc.Event = this.NextLine;
                    JMCPlus.Events.OnIncoming();
                    this.NextLine = jmc.Event;
                }
                JMCPlus.Jmc.ShowMe(this.NextLine);
                
                var line = this.LogFile.ReadLine();
                this.re_RMACMD.lastIndex = 0;
                var match;
                while ((match = this.re_RMACMD.exec(line)) != null) {
                    var val = parseFloat(match[1]);
                    dt += val / this.Acceleration;
                }
                this.NextLine = line.replace(this.re_RMACMD_REPLACE, "");
            }
            if (this.LogFile.AtEndOfStream) {
                this.Stop();
            } else {
                JMCPlus.Timers.SetStep(this.Timer, dt);
            }
        } catch(e) {
            JMCPlus.ErrorOutput(e, "LogViewer.PlayLine()");
            this.Stop();
        }
        return this.IsPlaying();
    };

JMCPlus.AddExtCommand("стоплог", 
    ["стоплог", "stoplog"],
    function(arguments, executer) {
        JMCPlus.LogViewer.Stop();
        return true;
    },
    JMCPlus.LogViewer);

JMCPlus.AddExtCommand("игратьлог", 
    ["игратьлог (.+)(?: ([0-9\\.]+))", "playlog (.+)(?: ([0-9\\.]+))"],
    function(arguments, executer) {
        var fname = arguments[0];
        var acc = 1.0;
        if (arguments.length > 1)
            acc = parseFloat(arguments[1]);
        if (isNaN(acc))
            acc = 1.0;
        JMCPlus.LogViewer.Play(fname, acc);
        return true;
    },
    JMCPlus.LogViewer,
    "игратьлог <файл> <коэффициент ускорения>");
