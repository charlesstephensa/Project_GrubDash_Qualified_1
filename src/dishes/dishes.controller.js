const e = require("express");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list (req,res,next){
res.json({data: dishes});
}

function create (req, res, next){
const data = req.body;

const newDish = {
    id: nextId(),
    name: data.data.name,
    description: data.data.description,
    price: data.data.price,
    image_url: data.data.image_url
};
  
dishes.push(newDish);
res.status(201).json({data: newDish});
}

//Checks all requirements for the 
function validBody(req,res,next){
    const body = req.body;
    if (body.data.name){
        if(body.data.description){
            if(body.data.price){
                if(body.data.price >= 0 && typeof body.data.price === 'number'){
                    if(body.data.image_url){
                        next();
                    } else {
                      next({status:400,message:"Dish must include a image_url"});  
                    }
                    
                } else {
                    next({status:400,message:"Dish must have a price that is an integer greater than 0"});
                }
                
            } else {
                 next({status:400,message:"Dish must include a price"});
            }
           
        } else {
            next({status:400,message:"Dish must include a description"});
        }
        
    } else {
        next({status:400,message:"Dish must include a name"});
    }
    
} 

function read (req,res,next){
res.json({data: res.locals.dish});
}

function isValid(req,res,next){
    const {dishId} = req.params;
    const foundDish = dishes.find((dish)=>dish.id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    } else {
        return next({
            status:404, message: `Dish does not exists: ${dishId}`
        });
    }
}

function update(req,res,next){
    const body = req.body;
    if(body.data.id ===   res.locals.dish.id){
    res.locals.dish = body.data
    res.json({data: res.locals.dish})
    } else {
        if(!body.data.id){
            res.locals.dish = {id: res.locals.dish.id, description : body.data.description, image_url: body.data.image_url, name: body.data.name, price: body.data.price}
            res.json({data: res.locals.dish});
        }
        
        return next({status: 400, message: `Dish id does not match route id. Dish: ${body.data.id}, Route: ${res.locals.dish.id}`})
    }
}

//Export functions

module.exports = {
list,
create: [validBody, create],
read: [isValid, read],
update:[isValid, validBody, update],
}