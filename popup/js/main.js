var choo = require('choo')
var home = require('./../views/home')

// initialize choo
var app = choo();

// app.use()
    
app.route('/', home);
app.mount('body');