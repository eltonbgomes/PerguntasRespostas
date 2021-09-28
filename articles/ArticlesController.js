const express = require("express");
const router = express.Router();
const Article = require("./Article");
const slugify = require("slugify");

router.get("/admin/articles/new", (req, res) => {
    res.render("admin/articles/new");
});

router.post("/admin/articles/save", (req, res) => {
    var title = req.body.title;
    var text = req.body.text;
    if(title != undefined && text != undefined){
        Article.create({
            title: title,
            body: text,
            slug: slugify(title)
        }).then(() => {
            res.redirect("/admin/articles");
        })
    }else{
        res.redirect("admin/articles/new");
    }
});

router.get("/admin/articles", (req, res) => {
    Article.findAll().then(articles => {
        res.render("admin/articles/index", {articles: articles});
    });
});

router.post("/admin/articles/delete", (req, res) => {
    var id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            })
        }else{
            res.redirect("/admin/articles");
        }
    }else{
        res.redirect("/admin/articles");
    }
});

router.get("/admin/articles/edit/:id", (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/articles");
    }
    Article.findByPk(id).then(article => {
        if(article != undefined){
            res.render("admin/articles/edit", {article: article});
        }else{
            res.redirect("/admin/articles");
        }
    }).catch(error => {
        res.redirect("/admin/articles");
    });
});

router.post("/admin/articles/update", (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var text = req.body.text;

    if(id != undefined){
        Article.update({title: title, slug: slugify(title), body: text},{
            where:{
                id: id
            }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(error => {
            res.send("Dado não atualizado");
        })
    }else{
        res.redirect("/admin/articles");
    }
});

module.exports = router;