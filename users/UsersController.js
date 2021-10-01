const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const { application } = require("express");


router.get("/admin/users/new", (req, res) => {
    res.render("admin/users/new");
});

router.post("/admin/users/save", (req, res) => {
    var name = req.body.name;
    var password = req.body.password;

    User.findOne({
        where: {
            name: name
        }
    }).then(user => {
        if (user == undefined) {
            var salt = bcrypt.genSaltSync(Math.floor(Math.random() * 10 + 1));
            var hash = bcrypt.hashSync(password, salt);
        
            if(name != undefined && password != undefined){
                User.create({
                    name: name,
                    password: hash
                }).then(() => {
                    res.redirect("/admin/users");
                })
            }else{
                res.redirect("admin/users/new");
            }            
        }else{
            res.redirect("admin/users/new"); //usuario existente
        }
    })
});

router.get("/admin/users", (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", {users: users});
    });
});

router.post("/admin/users/delete", (req, res) => {
    var id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            User.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/users");
            })
        }else{
            res.redirect("/admin/users");
        }
    }else{
        res.redirect("/admin/users");
    }
});

router.get("/admin/users/edit/:id", (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/users");
    }
    User.findByPk(id).then(user => {
        if(user != undefined){
            res.render("admin/users/edit", {user: user});
        }else{
            res.redirect("/admin/users");
        }
    }).catch(error => {
        res.redirect("/admin/users");
    });
});

router.post("/admin/users/update", (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var password = req.body.password;

    var salt = bcrypt.genSaltSync(Math.floor(Math.random() * 10 + 1));
    var hash = bcrypt.hashSync(password, salt);

    if(id != undefined){
        User.update({name: name, password: hash},{
            where:{
                id: id
            }
        }).then(() => {
            res.redirect("/admin/users");
        }).catch(error => {
            res.send("Dado não atualizado");
        })
    }else{
        res.redirect("/admin/users");
    }
});

router.get("/login", (req, res) => {
    res.render("admin/users/login");
});

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
});

router.post("/authenticate", (req, res) => {
    var name = req.body.name;
    var password = req.body.password;

    User.findOne({where:{name: name}}).then(user => {
        if(user != undefined){
            var correct = bcrypt.compareSync(password, user.password);
            if(correct){
                req.session.user = {
                    id: user.id,
                    name: user.name
                }
                res.redirect("/admin/categories");
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login");
        }
    })
});

module.exports = router;