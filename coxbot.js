var _ = require('underscore')

,   sysout = (console && console.log || function() {})
,   Coxbot = {}
;


Coxbot.Lexer = function(text) {
    var tokens = text.split(/\s+/)
    , next = 0
    ;
    this.nextWord = function() {
        if (next >= tokens.length) return null;
        return tokens[next++];
    }
}

Coxbot.IO = {
    "PRINT": function(terp) {
        if (terp.stack.length < 1) throw "Not enough items on stack"
        sysout(terp.stack.pop())
    }
}

Coxbot.Math = {
    "+": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(i+j)
    },
    "-": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(i-j)
    }
}

Coxbot.Interpreter = function() {
    var dictionary = {}
    ;
    this.stack = [];
    this.addWords = function(newDict) {
        for (word in newDict) {
            dictionary[word.toUpperCase()] = newDict[word];
        }
    };
    this.run = function(text) {
        var lexer = new Coxbot.Lexer(text)
        ,   word
        ,   numVal
        ;
        while (word = lexer.nextWord()) {
            word = word.toUpperCase();
            numVal = parseFloat(word);
            if (dictionary[word]) {
                dictionary[word](this);
            } else if (!isNaN(numVal)) {
                this.stack.push(numVal);
            } else {
                throw "Unknown Word '"+word+"'";
            }
        }
    }
}

Coxbot.bootstrap = function() {
    var terp = new Coxbot.Interpreter();
    dicts = [
        Coxbot.IO, 
        Coxbot.Math,
    ]
    for (i in dicts) { terp.addWords(dicts[i]) }
    return terp
}
Coxbot.eval = function(text) {
    var terp = Coxbot.bootstrap()
    terp.run(text)
}

Coxbot.TestMath = function() {
    Coxbot.eval("3 4 1 - + print")
}