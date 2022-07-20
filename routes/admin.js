const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/",eAdmin,(req, res)=>{
    res.render("admin/index")
})

router.get("/posts",(req, res)=>{
    res.send("Página de posts")
})

router.get("/categorias",eAdmin,(req, res)=>{
        Categoria.find().lean().then((categorias)=>{
        res.render("admin/categorias",{categorias: categorias})
    }).catch((err)=>{
        req.flash("erro_msg","Erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get("/categorias/add",eAdmin,(req, res)=>{
    res.render("admin/addcategorias")
})

router.post("/categorias/nova",eAdmin,(req,res)=>{
    var erros =[]

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto:"Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias",{erros: erros})
    }
    else{
        const novaCategoria = {
            nome:req.body.nome,
            slug:req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias")
            console.log("Usuario cadastrado com sucesso")
        }).catch((err)=>{
            req.flash("error_msg", "Categoria não criada")
            res.redirect("/admin")
            console.log(err)
        })
    
    }
})

router.post("/categorias/edit",eAdmin,(req,res)=>{
    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg","Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","Não foi possivel fazer as alterações")
            res.redirect("/admin/categorias")
            console.log(err)
        })
    }).catch((err)=>{
        res.send(err)
    })
})

router.post("/categorias/deletar",(req,res)=>{
    Categoria.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg","Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","Erro ao deletar a categoria")
        console.log(err)
        res.redirect("/admin/categorias")
    })

})


router.get("/categorias/edit/:id",(req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{

        res.render('admin/editcategorias', {categoria:categoria})

    }).catch((err)=>{
        req.flash("error_msg","Essa categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens",(req,res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro")
        res.redirect("/admin")
    })
})

router.get("/postagens/add",(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err)=>{
        console.log(err)
    })
})

router.post("/postagens/nova",(req,res)=>{
    var erro =[]
    
    if(req.body.categoria == 0)
        erro.push({text:"Categoria inválida, registre uma categoria"})

    if(erro.length > 0){
        res.render("admin/addpostagens")
    }
    else{
        const novaPostagem = {
            titulo:req.body.titulo,
            slug:req.body.slug,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Não foi possivel inserir dados")
            res.redirect("/admin/postagens")
        })

    }
})

router.get("/postagens/edit/:id",(req,res)=>{
    Postagem.findOne({_id:req.params.id}).lean().then((postagens)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias, postagens:postagens})
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Erro ao buscar a categoria")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro ao carregar a página")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagens/edit",(req,res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(()=>{
            req.flash("success_msg","Categoria atualizada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Erro ao editar categoria")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro ao editar a postagem")
        res.redirect("/admin/postagens")
    })
})
router.post("/postagens/deletar",(req,res)=>{
    Postagem.remove({_id:req.body.id}).then(()=>{
        req.flash("success_msg","Postagem removida com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro ao deletar categoria")
        res.redirect("/admin/postagens")
    })
})


module.exports= router