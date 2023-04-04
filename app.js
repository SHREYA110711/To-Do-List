const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose=require("mongoose");
const _=require("lodash");

app.set("view engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});
const itemsSchema={
    name:String
}
 const Item=mongoose.model("Item",itemsSchema);

 const item1=new Item({
    name:"Welcome to your To-Do List"
 });
 const item2=new Item({
    name:"hit + button to add new items"
 });
 const item3=new Item({
    name:"<--check it for removing the item-->"
 });
 const defaultItems=[item1,item2,item3];

 const listSchema={
  name:String,
  items:[itemsSchema]
 }
 const List=mongoose.model("List",listSchema);
 
      async function getItems(){

        const Items = await Item.find({});
        return Items;
      
      }

app.get("/",(req,res)=>{

   getItems().then(function(FoundItems){
    if(FoundItems.length===0){
        Item.insertMany(defaultItems)
        .then(function () {
            console.log("Successfully saved defult items to DB");
          })
          .catch(function (err) {
            console.log(err);
          });
          res.redirect("/");
    }
    else{
   
        res.render("list", {listTitle:"Today", newItem:FoundItems});
    }
    
      });
})
app.post("/", function(req, res){
  const listName=req.body.list;
    const item = new Item({
        name:req.body.newItem
    })  
    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
  else{
    List.findOne({name:listName})
    .then(function(x){
      x.items.push(item);
      x.save();
      res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    })
  }
  });
  
app.post("/delete",function(req,res){
    const checkItem=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
      Item.findByIdAndRemove(checkItem)
      .then(function(){
        console.log("Successfully deleted!!!");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
    }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItem}}})
      .then(function(found){
        res.redirect("/"+listName);
      })
      .catch(function(err){
       console.log(err);
      })
    }
    
})

  

app.get("/:customParams",function(req,res){
  const customListName=_.capitalize(req.params.customParams);
   List.findOne({name:customListName})
   .then(function(found){
    if(!found){
      const list=new List({
        name: customListName,
        items: defaultItems
       });
       list.save();
       res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle:found.name, newItem:found.items});
    }
   })
   .catch(function(err){
    console.log(err);
   })
   
})

app.listen("3000",()=>{
    console.log("server is running");
})