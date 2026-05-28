var addon = {};

addon.ID = "rl_time";

addon.Name = "Time messages";

addon.Init = 
    function() {
        var now = new Date();
        var midnight = new Date(now.getYear(), now.getMonth(), now.getDate());
        JMCPlus.Timers.AddTimer(
            midnight, 1000 * 60 * 60, 0,
            function(count) {
                var now = new Date();
                JMCPlus.Jmc.Beep();
                JMCPlus.Jmc.ShowMe("Прошел час... Нынче уже " + now.toLocaleTimeString());
                if (now.getDate() == 0 && now.getHours() == 0) {
                    JMCPlus.Jmc.ShowMe("**** С НОВЫМ ГОДОМ!!!!! ");
                } else if (now.getHours() == 0) {
                    JMCPlus.Jmc.ShowMe("Уже начались новые сутки. Не пора ли спать?");
                }
            });
        JMCPlus.Timers.AddTimer(
            midnight, 1000 * 60 * 5, 0,
            function(count) {
                var now = new Date();
                JMCPlus.Jmc.ShowMe("Текущее время: " + now.toLocaleTimeString());
            });
    };

JMCPlus.AddAddon(addon);
