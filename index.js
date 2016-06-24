var express = require("express"),  
    app = express(),
    bodyParser  = require("body-parser");

var ownNormalizer = require('./lib/ownnormalizer')({
    modulesPath: "/build/modules",
    dateLang: "es"
});

var data = {
    id: "FDKFJSKFJDSKFSDJKSDFK",
    title: "Titulos <p> <script>alert('algo');</script>",
    description: "Descripcion del titulo de prueba",
    date: "06/26/2016" // MM-DD-YYYY || MM DD YYYY || MM-DD-YYYY || long
};

app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  

var router = express.Router();

router.get('/', function(req, res) {  
   
   ownNormalizer.validate(data, "test", "onNewTestCreeated", function (objFinal) {
    console.log(objFinal);
});
   
   res.send("Enviado");
});

app.use(router);

app.listen(3000, function() {  
  console.log("Node server running on http://localhost:3000");
});
