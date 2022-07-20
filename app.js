const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const path = require("path")
const admin = require("./routes/admin")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)

//Configs

//Session
app.use(session({
    secret:"chave-secreta",
    resave:true,
    saveUninitialized:true 
}))

app.use(passport.initialize())
app.use(passport.session())


app.use(flash())

//Middleware
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg= req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//BodyParser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Handlesbars
app.engine("handlebars",handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

//Public
app.use(express.static(path.join(__dirname,"public")))

//Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/blogapp").then(()=>{
    console.log("Conexão feita com sucesso")
}).catch((err)=>{
    console.log(err)
})

//Rotas
app.get("/",(req, res)=>{
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("index",{postagens:postagens})
    }).catch((err)=>{
        console.log(err)
        res.redirect("/404")
    })
})

app.get("/postagem/:slug",(req,res)=>{
    Postagem.findOne({slug:req.params.slug}).lean().then((postagem)=>{
        if(postagem){
            res.render("postagem/index",{postagem:postagem})
        }else{
            req.flash("error_msg","Essa mensagem não existe")
            res.redirect("/")

        }
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro na busca")
        res.redirect("/")
    })
})

app.get("/404",(req,res)=>{
    res.send("Não encontrado")
})

app.get("/categorias",(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        
        res.render("categoria/index", {categorias: categorias})

    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Erro ao achar as categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req,res)=>{
    Categoria.findOne({slug:req.params.slug}).lean().then((categoria)=>{
        if(categoria){
            Postagem.find({categoria:categoria._id}).lean().then((postagens)=>{
                res.render("categoria/postagens", {postagens:postagens, categoria:categoria})

            }).catch((err)=>{
                console.log(err)
                req.flash("error_smg","Erro ao achar as postagens")
                res.redirect("/")
            })

        }else{
            req.flash("error_msg", "Categoria não existe")
            res.redirect("/")
        }

    }).catch((err)=>{
        console.log(err)
        req.flash("error_smg","Erro ao achar as categorias")
        res.redirect("/")
    })
})

app.use("/admin",admin)
app.use("/usuarios", usuarios)

const PORT = process.env.PORT || 8081

app.listen(PORT, ()=>{
    console.log("Rodando...")
})