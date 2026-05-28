
JMCPlus.Timers = {};

JMCPlus.Timers.MINIMUM_PERIOD_MS = 100;

JMCPlus.Timers.List = {};

JMCPlus.Timers.AddTimer = 
    function(FirstOccurance, StepMs, RepetitionCount, CallBack, Argument) {
        var now = new Date();
        var t0 = new Date();
        
        if (typeof FirstOccurance === 'number') 
            t0.setTime(now.getTime() + FirstOccurance);
        else if(typeof FirstOccurance === 'object')
            t0.setTime(FirstOccurance.getTime());
        
        var step = StepMs;
        if (typeof StepMs !== 'number' || StepMs == 0)
            step = FirstOccurance - (new Date());
        if (step < this.MINIMUM_PERIOD_MS)
            step = this.MINIMUM_PERIOD_MS;
        
        if (t0 - now < 0) {
            var count = Math.floor((now - t0) / step, 0) + 1;
            t0.setTime(t0.getTime() + count * step);
        }
        
        var cnt = 0;
        if (typeof RepetitionCount === 'number')
            cnt = RepetitionCount;
        
        var id = 1;
        while (id in this.List)
            id += 1;
        
        var dt = (t0 - now) / 100;
        
        var timer = {
            "ID": id,
            "T0": t0,
            "Step": step,
            "Count": 0,
            "MaxCount": cnt,
            "CallBack": CallBack,
            "Argument": Argument,
            "dT" : dt
        };
        this.List[timer.ID] = timer;
        JMCPlus.Jmc.SetTimer(timer.ID, timer.dT);
        return timer.ID;
    };

JMCPlus.Timers.DelTimer = 
    function(TimerID) {
        var id = TimerID;
        if (typeof TimerID === 'object' && "ID" in TimerID)
            id = TimerID.ID;
        if (typeof id === 'number') {
            JMCPlus.Jmc.KillTimer(id);
            if (id in this.List)
                delete this.List[id];
        }
    };

JMCPlus.Timers.SetStep = 
    function(TimerID, NewStepMs) {
        if (TimerID in this.List) {
            var step = NewStepMs;
            if (step < this.MINIMUM_PERIOD_MS)
                step = this.MINIMUM_PERIOD_MS;
            this.List[TimerID].Step = step;
        }
    };

JMCPlus.Timers.OnTimer = 
    function(TimerID) {
        if (TimerID in this.List) {
            var restart = true;
            try {
                var ret;
                if (this.List[TimerID].Argument != null)
                    ret = this.List[TimerID].CallBack(
                            this.List[TimerID].Argument,
                            this.List[TimerID].Count);
                else
                    ret = this.List[TimerID].CallBack(
                            this.List[TimerID].Count);
                if (TimerID in this.List) {
                    this.List[TimerID].Count++;
                    if (ret == false) {
                        restart = false;
                    } else if (this.List[TimerID].MaxCount > 0 && this.List[TimerID].Count >= this.List[TimerID].MaxCount) {
                        restart = false;
                    }
                } else {
                    restart = false;
                }
            } catch(e) {
                restart = false;
                JMCPlus.ErrorOutput(e, "Timer handler #" + TimerID);
            }
            if (restart) {
                var dt = this.List[TimerID].Step / 100;
                if (dt != this.List[TimerID].dT) {
                    this.List[TimerID].dT = dt;
                    JMCPlus.Jmc.SetTimer(TimerID, this.List[TimerID].dT);
                }
            } else {
                this.DelTimer(TimerID);
            }
        }
    };

JMCPlus.AddEvent("PPS");
JMCPlus.AddEvent("PPM");
JMCPlus.AddEvent("PPH");

JMCPlus.Timers.AddTimer(0, 1000, 0,
    function(totalseconds) {
        JMCPlus.FireEvent("PPS", totalseconds);
    });

JMCPlus.Timers.AddTimer(0, 60 * 1000, 0,
    function(totalminutes) {
        JMCPlus.FireEvent("PPM", totalminutes);
    });

JMCPlus.Timers.AddTimer(0, 60 * 60 * 1000, 0,
    function(totalhours) {
        JMCPlus.FireEvent("PPH", totalhours);
    });

JMCPlus.Handlers.OnTimer.push(
    function(id) {
        JMCPlus.Timers.OnTimer(id);
    });
