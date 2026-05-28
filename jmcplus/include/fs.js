/*
    fs.js
    2016-01-13
*/

if (typeof FS !== 'object') {
    FS = {};
}

if (typeof FS.FSO !== 'object') {
    FS.FSO = new ActiveXObject("Scripting.FileSystemObject")
}

FS.ReadFile = 
    function(Path) {
        if (Path == null) 
            throw new Error("FS.ReadFile: Path is null");
        var file = this.FSO.OpenTextFile(Path, 1); //Mode = read-only
        var data = file.ReadAll();
        file.Close();
        return data;
    };
    
FS.WriteFile = 
    function(Path, Data) {
        var file;
        if (Path == null) 
            throw new Error("FS.WriteFile: Path is null");
        if (this.FSO.FileExists(Path))
            this.FSO.DeleteFile(Path);
        file = this.FSO.CreateTextFile(Path, true);
        if (Data != null)
            file.Write(Data)
        file.Close();
    };

FS.AddLineToFile = 
    function(Path, Line) {
        if (Path == null) 
            throw new Error("FS.AddLine: Path is null");
        try {
            this.FSO.CreateTextFile(Path, false);
        } catch(e) {
        }
        var file = this.FSO.OpenTextFile(Path, 8); //Mode = append
        if (Line == null)
            file.WriteBlankLines(1);
        else
            file.WriteLine(Line)
        file.Close();
    };

FS.ListFiles = 
    function(DirPath, Mask, Recoursive) {
        if (DirPath == null)
            throw new Error("FS.ListFiles: Path is null");
        var folder = this.FSO.GetFolder(DirPath);
        var it_files = new Enumerator(folder.Files);
        var filelist = [];
        for (; !it_files.atEnd(); it_files.moveNext())
            if (Mask == null || Mask.test(it_files.item()))
                filelist.push("" + it_files.item());
        if (Recoursive) {
            var it_subdirs = new Enumerator(folder.SubFolders);
            for (; !it_subdirs.atEnd(); it_subdirs.moveNext())
                filelist = filelist.concat(this.ListFiles("" + it_subdirs.item(), Mask, Recoursive));
        }
        return filelist;
    };

FS.CreatePath = 
    function(Path) {
        if (Path == null)
            throw new Error("FS.CreatePath: Path is null");
        var index = 0, i;
        while ((i = Path.indexOf("\\", index)) >= 0) {
            var subdir = Path.substr(0, i);
            if (!this.FSO.FolderExists(subdir))
                this.FSO.CreateFolder(subdir);
            index = i + 1;
        }
        if (index < Path.length) {
            if (!this.FSO.FolderExists(Path))
                this.FSO.CreateFolder(Path);
        }
    };
