const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const server = http.createServer(function(req,res){
			   
			   let parsedURL = url.parse(req.url);
			   let path = parsedURL.pathname;
	  		 var params = querystring.parse(parsedURL.query);
	  res.writeHead(200,"ok");
	  		   //Networking
    let mymethod = req.method.toLowerCase() ;
    if(mymethod=='get'){
 		       if(path=='/books'){
 			       res.write(fs.readFileSync('book.html','utf-8'));
             }
           else if(path=='/books/del'){
             deleteline(params['id'],'bookslist.txt');
             res.write(fs.readFileSync('book.html','utf-8'));
           }
 		       else if(path=='/books/bookslist.txt'){
 			       res.write(fs.readFileSync('bookslist.txt','utf-8'));
           }
           else if(path =='/books/search'){
             mySearch('bookslist.txt',res,params['key']);
           }
 	  	     else {
 			       res.write("the path requested doesn't exit in this server with GET method");
 		       }
 	  }
 	  else if(mymethod=='post'){
         if(path=='/books/add'){
 		         addDataToFile('bookslist.txt','book.html',req,res);
         }
         else {
            res.write("the path requested doesn't exit in this server in POST method");
         }
     }
 	res.end();
});
function mySearch(file,result,clef){
              var maintab = fs.readFileSync(file,'utf-8').split('\n');
              var subtab = new Array();
              var restab = new Array();
              for (let i=0;i<maintab.length;i++){
                      subtab[i]=maintab[i].split(',');
                      var myName = subtab[i][1].toLowerCase();
                      if(!myName.startsWith(clef.toLowerCase())){
                        subtab.splice(i,1);
                      }
                      if (subtab[i]) restab.push('\n'+subtab[i]);
               }
               console.log(restab);
               result.write(restab.toString());
               }

function addDataToFile(file,nextPage,request,result){
        let  body = '';
        request.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
         });
        request.on('end', function () {
         let output  = querystring.parse(body);
         if(output.nom != '' && output.dateAchat != ''&& output.owner != ''&& output.location != ''&& output.lu != ''){ //verifier si les input ne sont null sinn block
         let input = '\n'+getUniqueId('bookslist.txt')+','+output.nom+','+output.dateAchat+','+output.owner+','+output.location+','+output.lu;
       
         fs.appendFile(file,input,function(err){
          if(err) throw err ;
          console.log("A new value is added");
               });
          }
          else console.log('the data entered is null refill the cases');
           });
        result.write(fs.readFileSync(nextPage,'utf-8'));
}
function getUniqueId(file){
  let maintab = fs.readFileSync(file,'utf-8').split("\n"),
      lignes = maintab.length,resId = 0,
      cols = new Array(),idTab = new Array();
 //--remplissage des tableaux avec les données 
  for(let i=1;i<lignes;i++){
    cols[i]=maintab[i].split(',');//3 colonnes (id,bookname,date)
    idTab[i-1]=cols[i][0];//remplissage de idTab par les id des livres
  }
  let maxID = Math.max(...idTab);
  if(lignes===1){ resId = 1; }
  else{ resId = maxID + 1; }

  return resId ;
}
function getIndex(shownID,file){
   let maintab = fs.readFileSync(file,'utf-8').split("\n");
   let lignes = maintab.length ; 
   let cols = new Array();
   for(let i=0;i<lignes;i++){
    cols[i]=maintab[i].split(',');
    if(cols[i][0]==shownID) return  i;
   }
}
function deleteline(shownID,file){
  let indexLine = getIndex(shownID,file);
  let maintab = fs.readFileSync(file,'utf-8').split("\n");
  maintab.splice(indexLine,1);
  let data = maintab.join("\n");

  fs.writeFile(file,data,function(err){
          if(err) throw err ;
          console.log("i just deleted id "+shownID+" index "+ indexLine+'/n');
               });
              
}
server.on('close',function(){console.log('we are closing');});
server.listen(1234,function(){console.log('Race starteuu... ');});