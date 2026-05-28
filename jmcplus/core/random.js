
Random = {};

Random.MODULE = ((1 << 30) - 1);

Random.iState1 = 0;
Random.iState2 = 0;
Random.rgiState = [];

Random.Init =
    function(seed) {
        var i;
        
        this.iState1 = 55 - 55;
        this.iState2 = 55 - 24;
        
        while (this.rgiState.length < 55)
            this.rgiState.push(0);
        
        if (seed == null)
            this.rgiState[0] = (new Date()).getTime() & this.MODULE;
        else
            this.rgiState[0] = seed;
        this.rgiState[1] = 1;
        
        for (var i = 2; i < 55; i++)
            this.rgiState[i] = (this.rgiState[i - 1] + this.rgiState[i - 2]) & this.MODULE;
    };

Random.Next24Bit =
    function() {
        var ret;
        
        ret = (this.rgiState[this.iState1] + this.rgiState[this.iState2]) & this.MODULE;
        this.rgiState[this.iState1] = ret;
        
        this.iState1++;
        if (this.iState1 == 55)
            this.iState1 = 0;
        this.iState2++;
        if (this.iState2 == 55)
            this.iState2 = 0;
        
        return ret >> 6;
    };

Random.NextInt =
    function(min, max) {
        var d = max - min + 1;
        return min + (this.Next24Bit() % d);
    };

Random.NextFloat =
    function() {
        return parseFloat(this.Next24Bit()) / parseFloat(1 << 24);
    };

Random.Init();