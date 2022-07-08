const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const {v4:uuidv4} = require('uuid');

const router = require('./router');
const { connect } = require('./router');

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}))

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

app.set('view engine','ejs');

app.use('/route', router);

//Home route
app.get('/', (req, res) => {
    res.render('base', {title: "Recipe login System"});
})

app.listen('3000', () => {
    console.log('Server started on port 3000!');
})
