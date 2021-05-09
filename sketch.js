//Create variables here
var dog, happyDog, database, foodS, foodStock;
var dogImg;
var feedPet, addFood;
var fedTime, lastFed;
var foodObj;
var changeState, readState;
var bedRoom, garden, washRoom;
var gameState = "Hungry";
var currentTime;

function preload()
{
	//load images here
  dogImg = loadImage("images/Dog.png");
  happyDog = loadImage("images/happyDog.png");
  bedRoom = loadImage("images/bedRoom.png");
  garden = loadImage("images/Garden.png");
  washRoom = loadImage("images/washRoom.png");
}

function setup() {
	createCanvas(800, 400);
  dog = createSprite(685,250);
  dog.addImage("Dog", dogImg);
  dog.addImage("Happy", happyDog);
  database = firebase.database();
  foodStock = database.ref("Food");
  foodStock.on("value",readStock);  
  dog.scale = 0.25;
  foodObj = new Food();

  feed = createButton("Feed the Dog");
  feed.position(950,100);
  feed.mousePressed(feedPet);

  addFoods = createButton("Add Food");
  addFoods.position(1050,100);
  addFoods.mousePressed(addFood);

  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  });
}


function draw() {  
  background(46, 139, 87);
  fill('white')
  textSize(25)
  text("Food Remaining :" + " " + foodS, 100, 40)
  
  fedTime = database.ref("FeedTime");
  currentTime = hour();
  fedTime.on("value", function(data){
    lastFed = data.val();
  })

  fill(255,255,254);
  textSize(15);
  if(lastFed>=12){
    text("Last Feed : " + lastFed%12 + " PM", 625,30);
  } else if(lastFed==0){
    text("Last Feed : 12 AM", 625,30);
  } else{
    text("Last Feed : " + lastFed + " AM", 625 ,30);
  }

  if(gameState!="Hungry"){
    feed.hide();
    addFoods.hide();
    dog.visible = false;
  } else {
    feed.show();
    addFoods.show();
    dog.visible = true;
  }

  if(currentTime == lastFed+1){
    foodObj.garden()
    update("garden")
  } else if(currentTime == lastFed+2){
    foodObj.bedRoom()
    update("bedRoom")
  } else if (currentTime > (lastFed+2) && currentTime <= (lastFed+4)){
    foodObj.washRoom()
    update("washRoom")
  } else {
    foodObj.display()
    update("Hungry")
  }

  drawSprites();
  //add styles here
}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS)
}

function addFood(){
  foodS++;
  database.ref('/').update({
    Food : foodS
  })
}

function feedPet(){
  dog.changeImage("Happy", happyDog);
  if (foodObj.getFoodStock()<=0){
    foodObj.updateFoodStock(
      foodObj.getFoodStock()*0
    ) 
  } else {
    foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  }  
  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime:hour()
  })
}

function update(state){
  database.ref('/').update({
    gameState:state
  });
}
