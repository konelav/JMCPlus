var addon = {};

addon.ID = "arda_fight";

addon.Name = "Fighting helper for Arda-MUD";
/* SMAUG source code:

fight.c:new_dam_message
    if ( ! dam )
	dampc = 0;
    else
	dampc = ( (dam * 1000) / victim->max_hit) +
              ( 50 - ((victim->hit * 50) / victim->max_hit) );
    /////////////////.........///////////////
    if(dam == 0)
    	d_index = 0;
    else if(dampc < 0)
    	d_index = 1;
    else if(dampc <= 100)
   	d_index = 1 + dampc/10;
    else if(dampc <= 200)
   	d_index = 11 + (dampc - 100)/20;
    else if(dampc <= 900)
   	d_index = 16 + (dampc - 200)/100;
    else
   	d_index = 23;
    vs = s_message_table[w_index][d_index];

const.c:s_message_table
    char * s_generic_messages[24] =
    {
        "miss", "brush", "scratch", "graze", "nick", "jolt", "wound",
        "injure", "hit", "jar", "thrash", "maul", "decimate", "_traumatize_",
        "_devastate_", "_maim_", "_demolish_", "MUTILATE", "MASSACRE",
        "PULVERIZE", "DESTROY", "* OBLITERATE *", "*** ANNIHILATE ***",
        "**** SMITE ****"
    };
 */
 
addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Data, "RelativeHitpoints", 
        {
            "”ћ»–ј≈“": 10,
            "почти мертв.?": 20,
            "истекает кровью": 30,
            "корчится от боли": 40,
            "опасно ранен.?": 50,
            "сильно ранен.?": 60,
            "имеет несколько глубоких ран": 70,
            "слегка поранен.?": 80,
            "серьезно поцарапан.?": 90,
            "имеет несколько царапин": 100,
            "абсолютно здоров": 100.000001
        });
        JMCPlus.Storage.EnsureExistance(this.Data, "Damages", 
        {
            "(?:miss|не попадает в)": 1e-6, /* d_index = 0 */
            "(?:brush|цепляете)": 1.0, /* d_index = 1 */
            "(?:scratch|царапаете)": 2.0, /* d_index = 2 */
            "(?:graze|ца)": 3.0, /* d_index = 3 */
            "(?:nick|)": 4.0, /* d_index = 4 */
            "(?:jolt|)": 5.0, /* d_index = 5 */
            "(?:wound|)": 6.0, /* d_index = 6 */
            "(?:injure|)": 7.0, /* d_index = 7 */
            "(?:hit|)": 8.0, /* d_index = 8 */
            "(?:jar|)": 9.0, /* d_index = 9 */
            "(?:thrash|)": 10.0, /* d_index = 10 */
            "(?:maul|)": 12.0, /* d_index = 11 */
            "(?:decimate|)": 14.0, /* d_index = 12 */
            "(?:_traumatize_|)": 16.0, /* d_index = 13 */
            "(?:_devastate_|)": 18.0, /* d_index = 14 */
            "(?:_maim_|)": 20.0, /* d_index = 15 */
            "(?:_demolish_|)": 30.0, /* d_index = 16 */
            "(?:MUTILATE|)": 40.0, /* d_index = 17 */
            "(?:MASSACRE|)": 50.0, /* d_index = 18 */
            "(?:PULVERIZE|)": 60.0, /* d_index = 19 */
            "(?:DESTROY|)": 70.0, /* d_index = 20 */
            "(?:\\* OBLITERATE \\*|)": 80.0, /* d_index = 21 */
            "(?:\\*\\*\\* ANNIHILATE \\*\\*\\*|)": 90.0, /* d_index = 22 */
            "(?:\\*\\*\\*\\* SMITE \\*\\*\\*\\*|)": 100.0 /* d_index = 22 */
        });
    };

addon.Handlers = {};

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var data = promptdata[1];
        enemy = data.ENEMY;
    };

addon.Handlers.OnIncoming = 
    function(incoming) {
        
    };

//JMCPlus.AddAddon(addon);
