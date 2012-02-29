var _ = require('underscore')

,   sysout = (function(m) { console && console.log(m) })
,   Coxbot = {}
;


Coxbot.Lexer = function(text) {
    var tokens = text.split(/\s+/)
    , next = 0
    ;
    this.tokenNum = function() {
        return next;
    }
    this.nextWord = function() {
        if (next >= tokens.length) return null;
        return tokens[next++];
    }
}

Coxbot.Keywords = {
    "PRINT": function(terp) {
        if (terp.stack.length < 1) throw "Not enough items on stack"
        sysout(terp.stack.pop())
    },
    "VAR": function(terp) {
        var varName = terp.lexer.nextWord();
        if (varName === null) throw "Unexpected end of input"
        var makeVar = function(terp) {
            var me = {value:0};
            return function() {terp.stack.push(me)}
        }
        var newWordDef = {};
        newWordDef[varName] = makeVar(terp)
        terp.addWords(newWordDef)
    },
    "STORE": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var reference = terp.stack.pop()
        ,   newVal = terp.stack.pop()
        ;
        reference.value = newVal;
    },
    "FETCH": function(terp) {
        if (terp.stack.length < 1) throw "Not enough items on stack"
        var reference = terp.stack.pop();
        terp.stack.push(reference.value);
    },
}


Coxbot.Math = {
    "+": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(j+i)
    },
    "-": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(j-i)
    },
    "*": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(j*i)
    },
    "/": function(terp) {
        if (terp.stack.length < 2) throw "Not enough items on stack"
        var i = terp.stack.pop()
        , j = terp.stack.pop()
        ;
        terp.stack.push(j/i)
    },
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
        var word
        ,   numVal
        ;
        this.lexer = new Coxbot.Lexer(text);
        while (word = this.lexer.nextWord()) {
            word = word.toUpperCase();
            numVal = parseFloat(word);
            if (dictionary[word]) {
                dictionary[word](this);
            } else if (!isNaN(numVal)) {
                this.stack.push(numVal);
            } else {
                throw "Unknown Word '"+word+"' at token " + this.lexer.tokenNum();
            }
        }
    };
}

Coxbot.bootstrap = function() {
    var terp = new Coxbot.Interpreter();
    dicts = [
        Coxbot.Keywords, 
        Coxbot.Math,
        Coxbot.Strings,
    ]
    for (i in dicts) { terp.addWords(dicts[i]) }
    return terp
}
Coxbot.eval = function(text) {
    sysout("Evaling...")
    var terp = Coxbot.bootstrap()
    terp.run(text)
}

Coxbot.TestMath = function() {
    Coxbot.eval("3 4 1 - + print")
    
    Coxbot.eval([
        "4 2 17 + * print",
        "3 3 - print",
        "2 19 * print",
        "15 3 / print",
        "var hello",
        "45  hello store",
        "hello fetch print"
    ].join('\n'))
}
Coxbot.TestMath()