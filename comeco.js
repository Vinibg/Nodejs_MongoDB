const mongoose = require("mongoose")

//Configurações do mongoose
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/NovoBanco",{
    useMongoClient:true
}).then(()=>{
    console.log("Conexao feita com sucesso")
}).catch((err)=>{
    console.log(err)
})

//Model no mongoose

const UsuarioSchema = mongoose.Schema({
    nome:{
        type:String,
        require: true
    },
    sobrenome:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    idade:{
        type:Number,
        require:true
    },
    pais:{
        type:String
    }
})

mongoose.model("usuarios", UsuarioSchema)

var Vinicius= mongoose.model("usuarios")

new Vinicius({
    nome:"Vinicius",
    sobrenome:"Salvador",
    email:"email@mail.com",
    idade:25,
    pais:"Brasil"
}).save().then(()=>{
    console.log("Salvo com sucesso")
}).catch((err)=>{
    console.log(err)
})