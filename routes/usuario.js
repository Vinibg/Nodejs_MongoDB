const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


router.get("/registro",(req,res)=>{
    res.render("usuarios/registro")
})

router.post("/registro",(req,res)=>{
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({text:"Nome inválido"})
    }
    if(!req.body.email || req.body.email == undefined || req.body.email == null){
        erros.push({text:"E-mail inválido"})
    }
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null){
        erros.push({text:"Senha inválida"})
    }

    if(req.body.senha.length < 4){
        erros.push({text:"Senha muito curta"})
    }
    
    if(req.body.senha != req.body.senha2){
        erros.push({text:"Senha incorreta, tente novamente"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({emai:req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg", "Este e-mail já está cadastrado")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario= new Usuario({
                    nome:req.body.nome,
                    email:req.body.email,
                    senha:req.body.senha
                })
                
                bcrypt.genSalt(10, (erro,salt)=>{
                    bcrypt.hash(novoUsuario.senha,salt,(erro,hash)=>{
                        if(erro){
                            console.log(erro)
                            req.flash("error_msg", "Erro ao salvar usuario")
                            res.redirect("/")
                        }
                        
                        novoUsuario.senha = hash
                        
                        novoUsuario.save().then(()=>{
                            req.flash("success_msg","Usuário cadastrado com sucesso")
                            res.redirect("/")
                        }).catch((err)=>{
                            console.log(err)
                            req.flash("error_msg","Erro ao cadastrar usuário")
                            res.redirect("/usuarios/registro")
                        })
                    
                    })
                })
            }
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Erro interno")
            res.redirect("/")
        })
    }

})

router.get("/login",(req,res)=>{
    res.render("usuarios/login")
})

router.post("/login",(req,res,next)=>{
    passport.authenticate("local",{
        successRedirect:"/",
        failureRedirect:"/usuarios/login",
        failureFlash:true
    })(req,res,next)
})

router.get("/logout",(req,res)=>{
    req.logout()
    req.flash("success_msg","Sessão encerrada")
    res.redirect("/")
})

module.exports = router