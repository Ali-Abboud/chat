

var port=process.env.PORT_HTTP || 2999;
var MONGO_URL=process.env.MONGO_URL || "127.0.0.1";
var PORT_MONGO=process.env.MONGO_PORT || 27017 ;
var USERNAME_MONGO=process.env.MONGODB_USER || "username" ;
var PASSWORD_MONGO=process.env.MONGODB_PASSWORD || "password" ;

//making the connections\
/*'mongodb://'+USERNAME_MONGO+':'+PASSWORD_MONGO+'@'+MONGO_URL*/
//

var express=require('express');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
const fileUpload = require('express-fileupload');
var jsonParser=bodyParser.json();

mongoose.connect("mongodb://bintouch007:123456@ds129004.mlab.com:29004/bitdb@mongodb/bitdb",function (error) {
    if(error){console.log("error connecting mongodb!!!.");}
    else{

        console.log("connected!! ");

    }

});
//creating the shema for documents

var Schema=mongoose.Schema;
var clienctSchema=new Schema({
	phone_number:String,
	full_name:String,
	user_name:String,
	token:String,
	secondary_account:{},
	password:String
});
var phoneChatSchema=new Schema({
     rooms:[]

});

// var message={
//   from:,
//   to:,
//   state:,
//   date:,
//   content:
// };

var roomSchema=new Schema({
  room_name:String,
//  participants:[],
  chats:[]

});

var Client=mongoose.model('client',clienctSchema);
var Room=mongoose.model('room',roomSchema);
////////////////////////////////////////



 //using the exported function to create the server
 var app=express();
// Port to be listened to
 var port=process.env.PORT || 2999;


//just for test
app.get('/api',function(req,res){

 	res.json([{firstname:'john',lastname:'doe'}]);
 });


//checking if the number exist



app.post('/checkNumber',jsonParser,function (req,res,next) {
	var data=req.body;
	Client.find({"phone_number":data.phone_number},function(err,result){
		if(err) {throw err;}
		else if(result.length===0){
	          console.log(data.phone_number +" doesn't exist!!.");

		}

		else {
			res.json("The phone Number "+ data.phone_number + " already registered please head Login");
		}

	});
});

//registering a given number
app.post('/register',jsonParser,function (req,res,next) {

	var data=req.body;

	//filling the data model with data
	 var user=Client({
	     phone_number:data.phone_number,
		 full_name:data.full_name,
			token:"",
			secondary_account:{	user_name:data.username,job:data.job,company:data.company,email:data.email}


	 });

	Client.find({"phone_number":data.phone_number},function(err,clients){
		if(err) throw err;
		else{
			if(clients.length===0)
				{
				 //saving the new client
				user.save(function(err){

					if(err) throw err;
					else{

            var ChatDoc=mongoose.model(data.phone_number+"",phoneChatSchema);
            var newNumb=ChatDoc({
              chats:[]
            });
            newNumb.save();
						res.json({msg:true});

				}

				});

				}
			else{

				res.json({msg:false});
			}


		}

	});

		});


app.post('/addMsg',jsonParser,function (req,res,next) {
	var data=req.body;

	Client.find({"phone_number":data.phone_number},function(err,clients){
		if(clients.length>0){
			res.json({msg:"Logged In!!."});
			console.log("Logged In!!.");
		}else{
			res.json({msg:"Phone Number Not Found Please Register!!."});
			console.log(data.phone_number +"Phone Number Not Found Please Register!!.");
		}
	});


});


////handling login requests///////////////////////////////////////////////
app.post('/login',jsonParser,function (req,res,next) {
	var data=req.body;

	Client.find({"phone_number":data.phone_number},function(err,clients){
		if(clients.length>0){
			res.json({msg:true});
			console.log("Logged In!!.");
		}else{
			res.json({msg:false});
			console.log("Phone Number Not Found Please Register!!.");
		}
	});


});

////////////////////////////////////////////////////////////////////////

////////checking for registered contacts////////////////////////////////
app.post('/checkingContacts',jsonParser,function (req,res,next) {
	var data=req.body;
    var i=0;
    var j=0;

    var contacts=[];///for storing matched contacts
    var foundIndex=[];///for storing the index of matched so no doublicated numbers exists
    	Client.find({},function(err,clients){
    		if(clients.length>0){
    		       while(i<data.length){

                 if(data[i].phone_number.length<=8){
                   data[i].phone_number="+961"+data[i].phone_number;
                 }
                  console.log(data[i].phone_number);
                       var found=0;
                       var k=0;
                       while(k<foundIndex.length){
                       	if(foundIndex[k]==data[i].phone_number){
                          found=1;

                          i++;
                          break;
                        }
                        k++
                       }
                       if(found==1){found=0;continue;}
                 j=0;
                 while (j<clients.length) {

                	 if(data[i].phone_number===clients[j].phone_number){
                          contacts.push({phone_number:data[i].phone_number,name:data[i].name,is_registered:true});
                          foundIndex.push(data[i].phone_number);
                          console.log("A number is found!!");
                          break;
                        }
                        j++;
                 }
                 //if number not found then it is registered
                 if(j==clients.length){contacts.push({phone_number:data[i].phone_number,name:data[i].name,is_registered:false});}
                 i++;
               }

    		       console.log(contacts);
    		       res.json(contacts);

    		}  else{
    			console.log("No registered Numbers");

    		}
    	});


});
/////////////////////////////////////////////////////////////////////////////////////////////////////


////saving chatRooms//////////////////////////////////////////////////////////////////////////////////
app.post("/saveRoom",jsonParser,function(req,res,next){
    var data=req.body;
    var i=0;
    console.log("rooms are sent "+data);
    Room.find({},function(err,room){
    	if(err) throw err;
    	else if(room.length==0){//if the database is empty with no rooms
    		for(var i=0;i<data.length;i++){
    			var r=Room({
    				room_name:data[i].room,
    				chats:[]
    			});
    			r.save();
    			console.log("room "+data[i].room+" saved!!");
    		}
    	}

    	else{
    		for(var i=0;i<data.length;i++){
    			var isfound=0;

    			for(var j=0;j<room.length;j++){

    				if(data[i].room==room[j].room_name){
    					isfound=1;
    					console.log(room[j] +" is found! ");
    					break;
    				}

    			}

    			if(isfound==0){//if the the room is not found
        			var r=Room({
        				room_name:data[i].room,
        				chats:[]
        			});
        			r.save();
        			console.log("room "+data[i].room+" saved!!");
    			}
    		}
    	}
    });
    res.json({msg:"response"});
next();
});
//////////////////////////////////////////////////////////////////////////////////////////////////
//saving messages
/////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/saveMessage",jsonParser,function(req,res,next){

	var data=req.body;


	var chats=[];

	var isFound=false;//if the message already exist
	console.log(data);

	Room.find({room_name:data.room},function(err,rooms){
		if( rooms!=null && rooms[0]!=null && rooms[0].chats.length>0)
			for(var i=0;i<rooms[0].chats.length;i++){
				chats.push(rooms[0].chats[i]);
				if(data.from==rooms[0].chats[i].from && data.id==rooms[0].chats[i].id)
					isFound=true;
			}

		if(!isFound)
		chats.push(data);

		Room.update({room_name:data.room},{$set:{chats:chats}},function(err,rooms){
			if(err) throw err;
			else
				console.log("message saved!!");

		});
	});


	next();
});
///////////////////////////////////////////////////////////////////////////////////////////////
//update message state
//////////////////////////////////////////////////////////////////////////////////////////////
app.post("/updateMessageState",jsonParser,function(req,res,next){

	var data=req.body;

	var chats=[];



	Room.find({room_name:data.room},function(err,rooms){
		if(err) throw err;
		console.log("updating message id "+data.id);
		if(rooms!=null && rooms[0]!=null && rooms[0].chats!=null && rooms[0].chats.length>0){
			for(var i=0;i<rooms[0].chats.length;i++){
				if(rooms[0].chats[i].id==data.id){
					rooms[0].chats[i].state=data.state;
					console.log(rooms[0].chats[i] +" "+data.state);
					Room.update({room_name:data.room},{$set:{chats:rooms[0].chats}},function(err,rooms){
						if(err) throw err;
						res.json([{msg:"successful"}]);

					});
					break;
				}

			}
		}

	});


});
///////////////////////////////////////////////////////////////////////////////////////////////
//request the unacknowledged messages and update Them
//////////////////////////////////////////////////////////////////////////////////////////////
app.post("/getUnAcknowlegedMessages",jsonParser,function(req,res,next){
	var data=req.body;
	var messages=[];
	var user=data[0];
	var account=data[1];
	var chats=[];

	Room.find({},function(err,room){
		if(err) throw err;
          if(room!=null || room.length==0){
        	  for(var i=0;i<data[2].rooms.length;i++){
        		  for(var j=0;j<room.length;j++){

        			 if(data[2].rooms[i]==room[j].room_name && room[j].chats!=null){
        				 for(var k=0;k<room[j].chats.length;k++){
        					 if(room[j].chats[k].from==user && room[j].chats[k].state==0 && room[j].chats[k].state==account){
        						messages.push(room[j].chats[k].id);
        						room[j].chats[k].state=1;

                				 Room.update({room_name:data[2].rooms[i]},{$set:{chats:room[j].chats}},function(err,rooms){
                					 if(err) throw err;
                				 });
        					 }


        				 }



        			 }
        			 chats=[];
        		  }
        	  }
        	   	console.log(messages);
        	   	res.json([{msg:messages}]);
              	next();
          }
          else{
        	  next();
          }

	});


});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////
//request the unsent messages  and update Them
//////////////////////////////////////////////////////////////////////////////////////////////
app.post("/getUnSentMessages",jsonParser,function(req,res,next){
	var data=req.body;
	var messages=[];
	var user=data[0];
	var account=data[1];
	console.log(data[2]);
	var chats=[];

	Room.find({},function(err,room){
		if(err) throw err;
        if(room!=null || room.length==0){
      	  for(var i=0;i<data[2].rooms.length;i++){
      		  for(var j=0;j<room.length;j++){

      			 if(data[2].rooms[i]==room[j].room_name && room[j].chats!=null){
      				 for(var k=0;k<room[j].chats.length;k++){
      					 if(room[j].chats[k].from!=user && room[j].chats[k].state==1 && room[j].chats[k].account==account){
      						messages.push(room[j].chats[k]);
      						room[j].chats[k].state=2;
      					    
      						 console.log(data[2].rooms[i]);
              				 Room.update({room_name:data[2].rooms[i]},{$set:{chats:room[j].chats}},function(err,rooms){
              					 if(err) throw err;
              				
              				 });
      					 }

      				 }



      			 }
      			 chats=[];
      		  }
      	  }
      	  res.json([{msg:messages}]);
            	next();
        }
        else{
      	  next();
        }

	});


});
//////////////////////////////////////////////////////////////////////

app.post("/searchByCriteria",jsonParser,function(req,res,next){
    var criteria=req.body;
    var result=[];
    var re = new RegExp("^"+criteria.pattern, "");

    Client.find({"secondary_account.user_name":{$regex:re}},function(err,clients){

          if(clients.length>0){


              res.json({res:clients});
              next();
          }else {

         Client.find({"secondary_account.job":{$regex:re}},function(err,client1){

        	 if(client1.length>0){
                      res.json({res:client1});
                      next();
        	 }
        	 else{
        		 Client.find({"secondary_account.company":{$regex:re}},function(err,client2){

        			 if(client2.length>0){
                         res.json({res:client2});
                         next();
           	               }


        			 else{
        				 Client.find({"secondary_account.email":{$regex:re}},function(err,client3){

                                 res.json({res:client3});
                                 next();

        				 });


        			 }


        		 });


        	 }


         });


          }
    });


});





//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.use(multipart({ uploadDir: ".\\uploads"}));
app.post('/upload_audio', multipartMiddleware, function(req, resp) {



 if(req.files){
   var data=req.body;
   var path=req.files.uploaded_File.path;
		var data=req.body;
		addAudioMessage({
			id:data.id,
			state:1,
			account:"primary",
			from:data.from,
			type:"audio",
      room:data.room,
      content:path
		},Room);
	 resp.status(200).send("Uploaded!!!");
   console.log("audio uploaded");
 }
});




app.get('/downloads', function (req, res, next) {
    var filePath = "./uploads/"; // Or format the path using the `id` rest param
    var file = __dirname + "/uploads/bQmP1ew9srP0ZjfmSQ9mg-GR.jpg";; // file name  

    res.download(file);
  
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////


function addAudioMessage(message,Room){
    var chats=[];
	var isFound=false;//if the message already exist


Room.find({room_name:message.room},function(err,rooms){
		if( rooms!=null && rooms[0]!=null && rooms[0].chats.length>0)
			for(var i=0;i<rooms[0].chats.length;i++){
				chats.push(rooms[0].chats[i]);
				console.log("pushing "+rooms[0].chats[i].content);
				if(message.from==rooms[0].chats[i].from && message.id==rooms[0].chats[i].id)
					isFound=true;
			}

		if(!isFound){
    message.state=1;
    console.log("before adding the message "+message);
  chats.push(message);
  }


		Room.update({room_name:message.room},{$set:{chats:chats}},function(err,rooms){
			if(err) throw err;
			else
				console.log("message saved!!");
			console.log("after adding the message "+chats[0].id + " for "+rooms);

		});
	});

}











app.listen(port);
