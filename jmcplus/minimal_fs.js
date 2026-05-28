/*
    minimal_fs.js
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
