//====Preparing data neded for routes====
var express = require('express');
var sql = require('mysql');
var router = express.Router();



//Connecing to DB
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'recipe_master'
});

conn.connect(function(e) {
   if(e){
    return console.error("error: " + e.message);
   } 
});


//====Routes====
//Login route
router.post('/login', (req, res) => {
    var username = req.body.uname;
    var userPswd = req.body.psw;

    var sql = `SELECT COUNT(*) AS userCount FROM userbase WHERE username = "${username}" and userPswd = "${userPswd}";`;
    conn.query(sql, (err, result) => {
        if(err){
            throw err; 
        } else if(result[0].userCount > 0){
            sql = `Select * from userbase WHERE username = "${username}" and userPswd = "${userPswd}"`;
            conn.query(sql, (err, result) =>{
                if(err){
                    throw err;
                } else{
                    const user = result[0];
                    req.session.userID = user.userID;
                    req.session.username = user.username;
                    req.session.userPriv = user.userPrivilages;
                    res.redirect('/route/dashboard');
                }
            })
        }
    })
})

//Route for logout
router.get('/logout', (req, res) =>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error");
        } else {
            res.render('base', {title: "Recipe Login System", logout: "Logout succesfully~"})
        }
    });
})

//Route for dashboard
router.get('/dashboard', (req, res) =>{
    if(req.session.username){
        res.render('dashboard', {title: "Article Dashboard", user: req.session.username, userPriv: req.session.userPriv})
    }
    else{
        console.log(req.session)
        res.send('Unathorized user!');
    }
})

//Route for endpointsDOC
router.get("/end", (req, res) => {
    if(req.session.username){
        var sql = 'SELECT COUNT(*) as howMany FROM recipes;';
        conn.query(sql, (err, result) => {
            if(err){
                throw err;
            }
            else{
                console.log(result[0].howMany);
                res.render('endpointsDOC', {howMany: result[0].howMany});
            }
        })
        
    } else {
        console.log(req.session)
        res.send('Unathorized user!');
    }
})

//Route to getAll API
router.get('/getAll', (req, res) =>{
    const sql = "Select * from recipes;";
    conn.query(sql, (err, result) =>{
        if(err){
            throw err;
        }
        else{
            var list = {
                recipesList: []
            }
            result.forEach(element => {
                list.recipesList.push(element);
            });
            res.json(list);
        }
    })
})

//Route to getSingleRecipe API
router.get('/getSingle/:id', (req, res) => {
    //If we want request object by id being dependant on the position in the list execute code below
    //I think it's a better solution if we add option to remove recipe from database, making holes in our recipe ID registry
    //ex. There will be no errors if we remove recipe with id = 3 and try to get recipe with our api with id = 3
    var sql = `Select * from recipes;`;
    conn.query(sql, (err, result) => {
        if(err){
            throw err;
        }
        else{
            
            var list = {
                recipesList: []
            }
            result.forEach(element => {
                list.recipesList.push(element);
            });

            res.json(list.recipesList[req.params.id]);

            
            
        }
    });

    //If we don't want to add removal option later the code below will be sightly faster

    //var sql = `Select * from recipes where recipe_id = ${req.params.id};`;
    // conn.query(sql, (err, result) => {
    //     if(err){
    //         throw err;
    //     }
    //     else{
    //         res.json(response);
    //     }
    // });
})

//Route to see all recipes
router.get('/all', (req, res) =>{
    if(req.session.username){
        //If user put input into searchfield
        const sql = "Select * from recipes";
        conn.query(sql, (err, result) =>{
            if(err){
                throw err;
            } else {
                obj = {print: result}
                console.log(result);
                res.render('seeRecipes', obj);
            }
        })
    }
    else{
        console.log(req.session)
        res.send('Unathorized user!');
    }
})

//Route to search through recipes by name
router.post('/allSearch', (req, res) => {
    var sql = `select COUNT(*) as howMany from recipes where recipe_name like "%${req.body.searchField}%";`;
    conn.query(sql, (err, result) => {
        console.log(result[0].howMany);
        console.log(req.body.searchField);
        if(err){
            throw err;
        } else if(result[0].howMany > 0){
            console.clear();
            console.log(req.body.searchField);
            sql = `Select * from recipes where recipe_name like '%${req.body.searchField}%';`;
            conn.query(sql,(error, scndResult) =>{
                if(error){
                    throw error;
                } else {
                    obj = {print: scndResult}
                    console.log(scndResult);
                    res.render('seeRecipes', obj);
                }
            })
            //res.render('seeRecipes', obj);
        }
    })
})

//Route to add recipe
router.get('/add', (req, res) =>{
    if(req.session.username){
        if(req.body.searchField){
            res.render('addRecipe');
        }
        else{
            res.render('addRecipe');
        }
        
    }
    else{
        console.log(req.session)
        res.send('Unathorized user!');
    }
})

//Route after Adding new Recipe
router.post('/addYourRecipe', (req, res) => {
    var dishName = req.body.recipeName;
    var recipeDescription = req.body.recipeDescription;
    var recipeIngridients = req.body.recipeIngridients;
    var recipeInstruction = req.body.recipeInstruction;
    var recipePictureUrlName = req.body.recipePictureUrl;

    var sql = `INSERT INTO recipes(userID, recipe_ingridients, recipe_instruction, recipe_description, recipe_name, recipe_photo) 
        VALUES (${req.session.userID}, '${recipeIngridients}', '${recipeInstruction}', '${recipeDescription}', '${dishName}', '${recipePictureUrlName}');`;

    conn.query(sql, (err, result) =>{
        if(err){
            throw err;
        }
        else{
            if(req.session.username){
                console.log(result);
                res.render('dashboard', {title: "Article Dashboard", user: req.session.username, userPriv: req.session.userPriv, message:"Recipe added~"})
            }
            else{
                console.log(req.session)
                res.send('Unathorized user!');
            }
        }

    })
})

//Route to edit recipe
router.get('/edit', (req, res) =>{
    if(req.session.username){
        var sql = `Select * from recipes where userID = '${req.session.userID}'`;
        conn.query(sql, (err, result) =>{
            if(err){
                throw err;
            } else{
                obj = {print: result}
                console.log(obj);
                res.render('editRecipes', obj);
            }
        })
    }
    else{
        console.log(req.session)
        res.send('Unathorized user!');
    }
})

//Route after editing recipe
router.post('/updateRecipe/:id',(req, res) =>{
    if(req.session.username){
        var recipeID = req.params.id;
        var newIngridients = req.body.recipeIngridients;
        var newInstruction = req.body.recipeInstruction;
        var newDescription = req.body.recipeDescription;;
        var newName = req.body.recipeName;
        var newPhotoUrl = req.body.recipePictureUrl;

        let sql = 
            `Update recipes SET recipe_ingridients='${newIngridients}',recipe_instruction='${newInstruction}',
                recipe_description='${newDescription}',recipe_name='${newName}',recipe_photo='${newPhotoUrl}' 
            WHERE recipe_id = ${recipeID} `;

        conn.query(sql, (err, result) => {
            if(err){
                throw err;
            } else {
                res.render('dashboard', {title: "Article Dashboard", user: req.session.username, userPriv: req.session.userPriv, message:"Recipe changed~"})
            }
        });
    } else {
        console.log(req.session);
        res.send('Unathorized user!');
    }
  })


module.exports = conn;
module.exports = router;