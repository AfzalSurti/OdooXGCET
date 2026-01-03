import {prisma} from "./lib/prisma.js"
import express from "express";

const app = express();

app.get("/",async (req,res)=>{
  await prisma.test.create({
      data : {
        name : "Ronak Singh"
      }
    })

    res.send("OK");
})

app.listen(3000);
