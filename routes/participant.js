var express = require('express');
var router = express.Router();
const xlsx = require('xlsx');
const multer  = require('multer')
const upload = multer({ dest: 'public/excel/' })
const jwt = require('jsonwebtoken');

const verifyToken = require('../middleware/verifyToken');



function readFile(fileName){
    const filePath = "public/excel/"+fileName;
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    let posts = [];
    let post = {};
    
    for (let cell in worksheet) {
        const cellAsString = cell.toString();
    
        if (cellAsString[1] !== 'r' && cellAsString[1] !== 'm' && cellAsString[1] > 1) {
            if (cellAsString[0] === 'A') {
                post.nom = worksheet[cell].v;
            }
            if (cellAsString[0] === 'B') {
                post.prenom = worksheet[cell].v;
            }
            if (cellAsString[0] === 'C') {
                post.email = worksheet[cell].v;
            }
            if (cellAsString[0] === 'D') {
                post.adresse = worksheet[cell].v;
                posts.push(post);
                post = {};
            }
        }
    }
    return posts;
}
router.post("/add", verifyToken, upload.single('file'), (req, res)=>{
    
    jwt.verify(req.token, process.env.TOKEN_SECRET, (err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'admin'){  
                if(req.body.formationName && req.file){
                    data = readFile(req.file.filename);
                    data.forEach(element => {
                        let participant = {
                            formationName: req.body.formationName,
                            nom: element.nom,
                            prenom: element.prenom,
                            email: element.email,
                            adresse: element.adresse,
                            role: "user"
                        }

                        dbo.collection('participants').insertOne(participant, (err, result)=> {
                            if (err) 
                                res.send(err);
                            else{
                            }
                            
                        })
                    });
                    res.status(200).send({MESSAGE: "ADD_SUCCES"});
                } else{
                    res.send({ERROR: "BODY_ERREUR"})
                }
            } else{
                res.send({ERROR: "NO_ACCESS"})
            }
        }
    })
})


router.get("/findByFormation/:formationName", (req, res)=>{
    dbo.collection('participants').find({'formationName': req.params.formationName}).toArray((err, result)=> {
        if (err) 
            res.send(err);
        else{
            res.status(200).send(result);
        }
        
    })
})

router.get("/findFormations", (req, res)=>{
    dbo.collection('participants').distinct("formationName", (err, result)=> {
        if (err) 
            res.send(err);
        else{
            res.status(200).send(result);
        }
        
    })
})

router.delete("/delete", (req, res)=>{
    dbo.collection("participants").deleteOne({"nom": req.body.nom, "prenom": req.body.prenom, "formationName": req.body.formationName}, (err, result)=> {
        if (err) 
            throw err;
        else{
            res.status(200).send("DELETE_SUCCES");
        }
    })
})





module.exports = router;