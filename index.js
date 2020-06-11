var TAS={};
TAS.speed=1;
TAS.running=false;
TAS.parseTable=function (inputTable){
  var lines=inputTable.split(/\n(?=\d)/);
  var table=[];
  var headings=lines[0].split(/\t/);
  for (var i=0;i<lines.length-1;i++){
    var line=lines[i+1];
    var cells=line.split(/\t/);
    table[i]={};
    for (var j=0;j<headings.length;j++)
      table[i][headings[j]]=cells[j];
  }
  return table;
}
TAS.setup=function (inputTable){
  TAS.table=typeof inputTable=="string"?TAS.parseTable(inputTable):inputTable;
  Game.Loop=Function("return "+(Game.Loop+"").replace("setTimeout","//")+"()");
  Game.playCookieClickSound=function(){};
  TAS.now=TAS.now||Date.now;
  TAS.time=TAS.now();
  Date.now=function (){return TAS.time;};
  TAS.finalTime=TAS.table[TAS.table.length-1]["time (ms)"];
  var versionNumber=l("versionNumber");
  versionNumber.innerHTML+="<div id=\"TASinfo\"></div>";
  setInterval(TAS.update,0);
}
TAS.start=function (){
  if (!TAS.table) return;
  Game.ShowMenu("options");
  Game.HardReset();
  l("promptOption0").click();
  l("promptOption0").click();
  TAS.time=TAS.now()-1;
  Game.time=TAS.now();
  Game.accumulatedDelay=0;
  Game.lastClick=-Infinity;
  Game.startDate=Game.time;
  Game.fullDate=Game.time;
  TAS.running=true;
  Game.ShowMenu("stats");
  Game.bakeryNamePrompt();
  l("bakeryNameInput").value="TAS";
  l("promptOption0").click();
}
TAS.stop=function (){
  if (!TAS.running){
    Game.HardReset(2);
    TAS.time=TAS.now();
    Game.time=TAS.time;
    Game.startDate=Game.time;
    Game.fullDate=Game.time;
    Game.Loop();
    Game.accumulatedDelay=0;
    Game.lastClick=-Infinity;
    Game.time=TAS.time;
    Game.startDate=Game.time;
    Game.fullDate=Game.time;
  }
  TAS.running=false;
  TAS.updateInfo();
}
TAS.update=function (){
  if (!TAS.running) return;
  var trueDate=TAS.now();
  var targetTime=Math.min(Math.floor((trueDate-Game.startDate)*TAS.speed),TAS.finalTime);
  while (TAS.time-Game.startDate<targetTime){
    TAS.time++;
    TAS.frame();
  }
  TAS.updateInfo();
}
TAS.frame=function (){
  var lineN=0;
  while (+TAS.table[lineN]["time (ms)"]<TAS.time-Game.startDate) lineN++;
  var line=TAS.table[lineN];
  var totalClicks=0;
  for (var i=0;i<=lineN;i++) totalClicks+=+TAS.table[i]["clicks more"];
  if (TAS.time-Game.lastClick>=1000/250&&Game.cookieClicks<totalClicks){
    var x=Game.cookieOriginX;
    var y=Game.cookieOriginY;
    TAS.mouseX=x;
    TAS.mouseY=y;
    Game.mouseX=TAS.mouseX;
    Game.mouseY=TAS.mouseY;
    Game.ClickCookie();
  }
  /*if (40536<=TAS.time-Game.startDate&&TAS.time-Game.startDate<=40688){
    console.log("Cookies "+Game.cookies);
    console.log("Time "+(TAS.time-Game.startDate));
    console.log("Clicks "+Game.cookieClicks);
  }*/
  if (line["time (ms)"]==TAS.time-Game.startDate){
    console.log("Cookies "+Game.cookies);
    console.log("Time "+(TAS.time-Game.startDate));
    console.log("Clicks "+Game.cookieClicks);
    var buildings={
      "Cursor":"c",
      "Grandma":"g",
      "Farm":"f",
      "Mine":"m"
    };
    for (var i of Object.getOwnPropertyNames(buildings)){
      var object=Game.Objects[i];
      var amount=line[buildings[i]]-object.amount;
      if (amount) object.buy(amount);
    }
    var upgrades=line["u"].split("\n").filter(Boolean);
    console.log(upgrades);
    for (var i of upgrades){
      Game.Upgrades[i].buy();
    }
    if (+line["time (ms)"]>0) Game.Loop();
    console.log("Cookies baked "+Game.cookiesEarned+"("+line["cookies baked"]+")");
    console.log("adelayl "+Game.accumulatedDelay);
    console.log("-----------");
  }else if (Math.ceil(TAS.time-Game.time+Game.accumulatedDelay)>=5000){
    if (+line["time (ms)"]>0) Game.Loop();
  }
}
TAS.updateInfo=function (){
  var frameTime=TAS.time-Game.time;
  var totalDelay=frameTime+Game.accumulatedDelay;
  var delayForm=frameTime+"+"+Game.accumulatedDelay.toFixed(1);
  l("TASinfo").innerHTML=""+
    "Time : "+(TAS.time-Game.startDate)+"ms<br>"+
    "In game time : "+(Game.time-Game.startDate)+"ms<br>"+
    "Frame time : "+(totalDelay>1000/30+1?"<span style=\"color:red\">"+delayForm+"</span>":delayForm)+"ms<br>"+
    "Cookies : "+Game.cookies.toFixed(4)+"<br>"+
    "Cookies total : "+Game.cookiesEarned.toFixed(4)+"<br>"+
    "Cookies pending : "+(Game.cookiesPs/30*Math.max(Math.ceil(totalDelay*30/1000),1)).toFixed(4);
}
TAS.keypress=function (e){
  var key=e.key;
  if (key=="l") Game.Loop();
  if (key=="r") TAS.start();
  if (key=="s") TAS.stop();
}
window.addEventListener("keypress",TAS.keypress);