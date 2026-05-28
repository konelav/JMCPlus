var addon = {};

addon.ID = "arda_books";

addon.Name = "Books information for Arda-MUD";

addon.re_START_READING = /^Вы начали читать (.+)\./;
addon.re_SKILL = /^Вы начали читать про (?:заклинание|умение|оружие) '(.+)'\./;

addon.Init = 
    function() {
        JMCPlus.Storage.EnsureExistance(this.Data, "Books", {});
        
        var dups = {};
        for (var book in this.Data.Books) {
            var name = book.toLowerCase();
            name = name.replace(/ую(\s|$)/, "ая$1");
            name = name.replace(/юю(\s|$)/, "яя$1");
            name = name.replace(/книгу/, "книга");
            if (name != book) {
                if (!(name in this.Data.Books))
                    this.Data.Books[name] = {};
                for (var skill in this.Data.Books[book])
                    this.Data.Books[name][skill] = true;
                dups[book] = true;
            }
            var remove = {};
            for (var skill in this.Data.Books[name]) {
                var skill_name = skill.toLowerCase();
                if (skill_name != skill) {
                    this.Data.Books[name][skill_name] = true;
                    remove[skill] = true;
                }
            }
            for (var skill in remove)
                delete this.Data.Books[name][skill];
        }
        for (var book in dups)
            delete this.Data.Books[book];
    };

addon.AddBook = 
    function(book) {
        if (typeof book !== 'string')
            return;
        if (!(book in this.Data.Books)) {
            JMCPlus.Jmc.Output("Новая книга: " + book);
            this.Data.Books[book] = {};
        }
    };

addon.AddSkill = 
    function(book, skill) {
        if (typeof book !== 'string')
            return;
        if (typeof skill !== 'string')
            return;
        this.AddBook(book);
        if (!(skill in this.Data.Books[book])) {
            this.Data.Books[book][skill] = true;
            JMCPlus.Jmc.Output("Сохраняем инфу по скиллу в книге: '" + skill  + "' в " + book);
        }
    };

addon.Handlers = {};

addon.Handlers.OnPrompt = 
    function(promptdata) {
        var lines = promptdata[0];
        var book = null;
        var i, j;
        for (i = 0; i < lines.length; i++) {
            var raw_text = JMCPlus.AnsiColors.RemoveANSI(lines[i]);
            var match = addon.re_START_READING.exec(raw_text);
            if (match != null) {
                book = match[1];
                book = book.replace(/ую(\s|$)/, "ая$1");
                book = book.replace(/юю(\s|$)/, "яя$1");
                book = book.replace(/книгу/, "книга");
                addon.AddBook(book);
                JMCPlus.Storage.Flush(addon);
                break;
            }
        }
        for (j = i + 1; j < lines.length; j++) {
            var raw_text = JMCPlus.AnsiColors.RemoveANSI(lines[j]);
            var match = addon.re_SKILL.exec(raw_text);
            if (match != null) {
                addon.AddSkill(book, match[1]);
                JMCPlus.Storage.Flush(addon);
            }
        }
    };

JMCPlus.AddExtCommand("книги+",
    ["книги\\+ (.+)\\.bdb", "books\\+ (.+)\\.bdb"],
    function(arguments, executer) {
        var lines = FS.ReadFile(arguments[0] + ".bdb").split("\n");
        var re_book = /<book>(.+)<\/book>/i;
        var re_skill = /<skill>(.+)<\/skill>/i;
        var re_end = /<end>/i;
        var re_book_word = /книга/i;
        var book = null;
        for (var i = 0; i < lines.length; i++) {
            var match;
            if ((match = re_book.exec(lines[i])) != null) {
                book = match[1];
                if (!re_book_word.test(book))
                    book += " книга";
                addon.AddBook(book);
            } else if ((match = re_end.exec(lines[i])) != null) {
                book = null;
            } else if ((book != null) && ((match = re_skill.exec(lines[i])) != null)) {
                addon.AddSkill(book, match[1]);
            }
        }
        JMCPlus.Storage.Flush(addon);
        return true;
    },
    addon,
    "книги+ <имя файла>.bdb");

JMCPlus.AddExtCommand("книга",
    ["книга (.+)", "book (.+)"],
    function(arguments, executer) {
        var re_book = new RegExp(arguments[0].replace(/\-/g, "\\-"), "i");
        
        JMCPlus.ShowWithColors("&wПоиск книг с названием, похожим на '&G" + arguments[0] + "&w'");
        var count = 0;
        for (var book in addon.Data.Books)
            if (re_book.test(book)) {
                JMCPlus.ShowWithColors("&W" + book + "&C:");
                for (var skill in addon.Data.Books[book])
                    JMCPlus.ShowWithColors("&w - &G" + skill);
                count += 1;
            }
        JMCPlus.ShowWithColors("&wВсего результатов: " + count);
        return true;
    },
    addon,
    "книга <название книги>");

JMCPlus.AddExtCommand("книга?",
    ["книга\\? (.+)", "book\\? (.+)"],
    function(arguments, executer) {
        var re_skill = new RegExp(arguments[0].replace(/\-/g, "\\-"), "i");
        
        JMCPlus.ShowWithColors("&wПоиск книг со скиллом '&G" + arguments[0] + "&w'");
        var count = 0;
        for (var book in addon.Data.Books)
            for (var skill in addon.Data.Books[book])
                if (re_skill.test(skill)) {
                    JMCPlus.ShowWithColors("&w'&G" + skill + "&w' в <&W" + book + "&w>");
                    count += 1;
                }
        JMCPlus.ShowWithColors("&wВсего результатов: " + count);
        return true;
    },
    addon,
    "книга? <название скилла>");

JMCPlus.AddAddon(addon);
