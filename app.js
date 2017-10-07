

var express=require('express');
var    bodyParser = require('body-parser');
var mongoose=require('mongoose');
var jsonParser=bodyParser.json();

var port=process.env.PORT_HTTP || 2999;
var MONGO_URL=process.env.MONGO_URL || "127.0.0.1";
var PORT_MONGO=process.env.MONGO_PORT || 27017 ;
var USERNAME_MONGO=process.env.MONGODB_USER || "username" ;
var PASSWORD_MONGO=process.env.MONGODB_PASSWORD || "password" ;

//making the connections\
/*'mongodb://'+USERNAME_MONGO+':'+PASSWORD_MONGO+'@'+MONGO_URL*/
//
mongoose.connect("mongodb://bintouch007:123456@ds129004.mlab.com:29004/bitdb@mongodb/sampledb",function (error) {
    if(error){console.log("error and shit");}
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
  participants:[],
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
			secondary_account:{	user_name:data.username,job:data.job}


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
                          contacts.push({phone_number:data[i].phone_number,name:data[i].name});
                          foundIndex.push(data[i].phone_number);
                          console.log("A number is found!!");
                          break;
                        }
                        j++;
                 }
                 i++;
               }

    		       console.log(contacts);
    		       res.json(contacts);

    		}else{
    			console.log("No registered Numbers");

    		}
    	});


});

/////////////////////////////////////////////////////////////////////////////////////////////////////


////saving chatRooms//////////////////////////////////////////////////////////////////////////////////


app.post("/saveRoom",jsonParser,function(req,res,next){
    var data=req.body;
    var i=0;

    while(i<data.rooms.length){
      Room.find({"room_name":data.rooms[i]},function(err,room){
        if(err) throw err;

        else if(room.length==0){
          var r=Room({
              room_name:data.room_name,
         participants:[data.contact[0],data.contact[1]],
         chats:[]
          });

          console.log("room "+data.room_name+" saved!!");
         }

      });
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(port);
