
JMCPlus.AnsiColors = {};

JMCPlus.AnsiColors.CSI = "\x1b[";
JMCPlus.AnsiColors.COLOR_CMD = "m";
JMCPlus.AnsiColors.MANY_SPACES = "                                                                                ";

JMCPlus.AnsiColors.TextColorMark = "&";
JMCPlus.AnsiColors.TextColors = {
    "x": ["0", "30"],
    "r": ["0", "31"],
    "g": ["0", "32"],
    "O": ["0", "33"],
    "b": ["0", "34"],
    "p": ["0", "35"],
    "c": ["0", "36"],
    "w": ["0", "37"],
    "z": ["1", "30"],
    "R": ["1", "31"],
    "G": ["1", "32"],
    "Y": ["1", "33"],
    "B": ["1", "34"],
    "P": ["1", "35"],
    "C": ["1", "36"],
    "W": ["1", "37"]
    };
JMCPlus.AnsiColors.TextColorDefault = "37";

JMCPlus.AnsiColors.TextCodes = (
    function(dict) {
        var ret = {};
        for (var key in dict)
            ret[dict[key]] = key;
        return ret;
    })(JMCPlus.AnsiColors.TextColors);

JMCPlus.AnsiColors.BgColorMark = "^";
JMCPlus.AnsiColors.BgColors = {
    "x": "40",
    "r": "41",
    "g": "42",
    "O": "43",
    "b": "44",
    "p": "45",
    "c": "46",
    "w": "47"
    };
JMCPlus.AnsiColors.BgColorDefault = "40";
JMCPlus.AnsiColors.BgCodes = (
    function(dict) {
        var ret = {};
        for (var key in dict)
            ret[dict[key]] = key;
        return ret;
    })(JMCPlus.AnsiColors.BgColors);

JMCPlus.AnsiColors.re_ESCSEQ = new RegExp(
    JMCPlus.AnsiColors.CSI.replace("[", "\\[") + 
    "([0-9]{1,2}(?:[,;][0-9]{1,2})*)" + 
    JMCPlus.AnsiColors.COLOR_CMD, "gi");
JMCPlus.AnsiColors.re_ESCSEQ_REPLACE = new RegExp(JMCPlus.AnsiColors.re_ESCSEQ.source, "gi");

JMCPlus.AnsiColors.re_COLORCMD = new RegExp(
    (function() {
        function GenerateRECmd(code, values) {
            var charset = "";
            for (var k in values)
                charset += k;
            return "\\" + code + "[\\" + code + charset + "]{1}";
        }
        return "(" + 
               "(?:" + GenerateRECmd(JMCPlus.AnsiColors.TextColorMark, JMCPlus.AnsiColors.TextColors) + ")" +
               "|" +
               "(?:\\" + JMCPlus.AnsiColors.TextColorMark + "[0-9]{1,3})" + //indent command
               "|" +
               "(?:" + GenerateRECmd(JMCPlus.AnsiColors.BgColorMark, JMCPlus.AnsiColors.BgColors) + ")" +
               ")";
    })(), "g");
JMCPlus.AnsiColors.re_COLORCMD_REPLACE = new RegExp(JMCPlus.AnsiColors.re_COLORCMD.source, "gi");

JMCPlus.AnsiColors.RemoveANSI = 
    function(line) {
        return line.replace(this.re_ESCSEQ_REPLACE, "");
    };

JMCPlus.AnsiColors.ConvertToANSI = 
    function(line) {
        var ret = "";
        
        var mode = "0";
        var text_color = ""; //this.TextColorDefault;
        var bg_color = ""; //this.BgColorDefault;
        
        var index = 0;
        var text_length = 0;
        this.re_COLORCMD.lastIndex = 0;
        var match;
        while ((match = this.re_COLORCMD.exec(line)) != null) {
            if (match.index > index) {
                ret += line.substr(index, match.index - index);
                text_length += match.index - index;
            }
            index = match.lastIndex;
            var code = match[1];
            
            var mark = code.substr(0, 1);
            var color = code.substr(1);
            if (color == mark) {
                ret += mark;
                text_length += 1;
                continue;
            }
            
            var new_mode = mode;
            var new_text_color = text_color;
            var new_bg_color = bg_color;
            if (mark == this.TextColorMark) {
                if (color in this.TextColors) {
                    new_mode = this.TextColors[color][0];
                    new_text_color = this.TextColors[color][1];
                } else {
                    try {
                        var indent = parseInt(color);
                        if (text_length < indent) {
                            ret += this.MANY_SPACES.substr(0, indent - text_length);
                            text_length = indent;
                        }
                    } catch(e) {
                        ret += match[1];
                        text_length += match[1].length;
                    }
                    continue;
                }
            } else if (mark == this.BgColorMark) {
                new_bg_color = this.BgColors[color];
            }
            
            var seq = "";
            if (new_mode != mode) {
                seq += new_mode;
                if (new_mode == "0") {
                    text_color = this.TextColorDefault;
                    new_bg_color = bg_color;
                    bg_color = this.BgColorDefault;
                }
                mode = new_mode;
            }
            if (new_text_color != text_color) {
                if (seq.length > 0)
                    seq += ";";
                seq += new_text_color;
                text_color = new_text_color;
            }
            if (new_bg_color != bg_color) {
                if (seq.length > 0)
                    seq += ";";
                seq += new_bg_color;
                bg_color = new_bg_color;
            }
            if (seq.length > 0) {
                seq = this.CSI + seq + this.COLOR_CMD;
                ret += seq;
            }
        }
        ret += line.substr(index);
        return ret;
    };

JMCPlus.ShowWithColors = 
    function(text) {
        JMCPlus.Jmc.ShowMe(JMCPlus.AnsiColors.ConvertToANSI(text));
    };

JMCPlus.AnsiColors.RemoveSMAUG = 
    function(line) {
        return line.replace(this.re_COLORCMD_REPLACE, "");
    };

JMCPlus.AnsiColors.ConvertToSMAUG = 
    function(line) {
        var ret = "";
        
        var text_color = ["0", this.TextColorDefault];
        var bg_color = this.BgColorDefault;
        var prev_text = ""; //this.TextCodes[text_color];
        var prev_bg = ""; //this.BgCodes[bg_color];
        
        var index = 0;
        this.re_ESCSEQ.lastIndex = 0;
        var match;
        while ((match = this.re_ESCSEQ.exec(line)) != null) {
            if (match.index > index) {
                ret += line.substr(index, match.index - index)
                       .replace(this.TextColorMark, this.TextColorMark + this.TextColorMark)
                       .replace(this.BgColorMark, this.BgColorMark + this.BgColorMark);
            }
            index = match.lastIndex;
            var commands = match[1].split(";");
            
            for (var i = 0; i < commands.length; i++) {
                try {
                    var cmd_str = commands[i];
                    if (cmd_str.length == 0)
                        cmd_str = "0";
                    var cmd = parseInt(cmd_str);
                    if (cmd == 0) {
                        text_color = ["0", this.TextColorDefault];
                        bg_color = this.BgColorDefault;
                    } else if (cmd == 1) {
                        text_color[0] = "1";
                        //text_color = ["1", this.TextColorDefault];
                        //bg_color = this.BgColorDefault;
                    } else if (cmd >= 30 && cmd < 40) {
                        text_color[1] = cmd.toString();
                    }
                     else if (cmd >= 40 && cmd < 50) {
                        bg_color = cmd.toString();
                    }
                } catch(e) {
                }
            }
            
            if (text_color in this.TextCodes) {
                var text = this.TextCodes[text_color];
                if (text != prev_text) {
                    ret += this.TextColorMark + text;
                    prev_text = text;
                }
            }
            if (bg_color in this.BgCodes) {
                var bg = this.BgCodes[bg_color];
                if (bg != prev_bg) {
                    ret += this.BgColorMark + bg;
                    prev_bg = bg;
                }
            }
            
        }
        ret += line.substr(index)
               .replace(this.TextColorMark, this.TextColorMark + this.TextColorMark)
               .replace(this.BgColorMark, this.BgColorMark + this.BgColorMark);
        return ret;
    };
