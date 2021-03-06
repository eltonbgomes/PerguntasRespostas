const express = require("express");
const router = express.Router();
const Article = require("./Article");
const Category = require("../categories/Category");
const slugify = require("slugify");
const adminAuth = require("../middleware/adminAuth");

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    })
});

router.post("/admin/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    if(title != undefined && body != undefined){
        Article.create({
            title: title,
            body: body,
            slug: slugify(title),
            categoryId: category
        }).then(() => {
            res.redirect("/admin/articles");
        })
    }else{
        res.redirect("admin/articles/new");
    }
});

router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles});
    });
});

router.post("/admin/articles/delete", adminAuth, (req, res) => {
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

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/articles");
    }
    Article.findByPk(id).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {article: article, categories:categories});
            })
        }else{
            res.redirect("/admin/articles");
        }
    }).catch(error => {
        res.redirect("/admin/articles");
    });
});

router.post("/admin/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    if(id != undefined){
        Article.update({title: title, slug: slugify(title), body: body, categoryId: category},{
            where:{
                id: id
            }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(error => {
            res.send("Dado n??o atualizado");
        })
    }else{
        res.redirect("/admin/articles");
    }
});

router.get("/articles/page/:page", (req, res) => {
    var elements = 4;
    var page = req.params.page;
    var offset = 0;

    if(isNaN(page) || page == 1){
        offset = 0;
    }else{
        offset = elements * (parseInt(page) - 1);
    }
    
    Article.findAndCountAll({
        limit: elements,
        offset: offset,
        order:[
            ['id', 'DESC']
        ]
    }).then(articles => {

        var next;
        if(offset + elements >= articles.count){
            next = false;
        }else{
            next = true;
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }
        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result: result, categories: categories});
        });
    });
});

module.exports = router;