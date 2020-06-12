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
  if ((Game.Loop+"").indexOf("function anonymous")==-1) Game.Loop=Function("return "+(Game.Loop+"").replace("setTimeout","//")+"()");
  var temp="if (Game.Achievements[what].won==0)";
  if ((Game.Win+"").indexOf("function anonymous")==-1) Game.Win=Function("what","return "+(Game.Win+"").replace(temp,temp+"console.log(\"%c\"+what+\" - \"+(TAS.time-Game.startDate)+\"(\"+(Game.time-Game.startDate)+\")\",\"color:yellow\");"+temp)+"(what)");
  Game.playCookieClickSound=function(){};
  TAS.now=TAS.now||Date.now;
  TAS.time=TAS.now();
  Date.now=function (){return TAS.time;};
  TAS.finalTime=TAS.table[TAS.table.length-1]["time (ms)"];
  if (!TAS.infol&&!l("TASinfo")){
    var versionNumber=l("versionNumber");
    TAS.infol=document.createElement("div");
    TAS.infol.id="TASinfo";
    versionNumber.appendChild(TAS.infol);
  }
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
  if (Game.Achievements["Here you go"]) Game.Achievements["Here you go"].click();
  TAS.warnings=[];
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
TAS.warn=function (type,message){
  TAS.warnings.push({type:type,time:TAS.time-Game.startDate,message:message});
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
    var logText="Cookies "+Game.cookies+
      "\nTime "+(TAS.time-Game.startDate)+
      "\nClicks "+Game.cookieClicks;
    var logArgs=[];
    var buildings={
      "Cursor":"c",
      "Grandma":"g",
      "Farm":"f",
      "Mine":"m",
      "Factory":"F"
    };
    for (var i of Object.getOwnPropertyNames(buildings)){
      if (!line[buildings[i]]) break;
      var object=Game.Objects[i];
      var amount=line[buildings[i]]-object.amount;
      if (amount>0) object.buy(amount);
      else if (amount<0) object.sell(-amount);
      if (line[buildings[i]]!=object.amount) TAS.warn("error","Failed to get wanted amount of "+i+".");
    }
    var upgrades=line["u"]?line["u"].split("\n").filter(Boolean):[];
    if (upgrades.length){
      logText+="\nUpgrades %c"+upgrades+"%c";
      logArgs.push("color:yellowgreen");
      logArgs.push("color:lightgray");
      for (var i of upgrades){
        Game.Upgrades[i].buy();
        if (!Game.Upgrades[i].bought) TAS.warn("error","Failed to buy "+i+".");
      }
    }
    if (line["GC buff"]){
      logText+="\nSpawned golden cookie - %c"+line["GC buff"]+"%c";
      logArgs.push("color:#06f");
      logArgs.push("color:lightgray");
      if (Game.shimmerTypes["golden"].time<=Game.shimmerTypes["golden"].minTime) TAS.warn("error","Golden cookie was spawned too early.");
      var newShimmer=new Game.shimmer("golden");
      newShimmer.force=line["GC buff"];
      newShimmer.l.click();
    }
    if (+line["time (ms)"]>0) Game.Loop();
    if (Math.abs(Game.cookiesEarned-line["cookies baked"])>0.001){
      logText+="\nCookies baked %c"+Game.cookiesEarned+"("+line["cookies baked"]+")%c";
      if (Game.cookiesEarned<line["cookies baked"]){
        logArgs.push("color:red");
        TAS.warn("warning","Earned "+(line["cookies baked"]-Game.cookiesEarned)+" less cookies than expected.");
      }else{
        logArgs.push("color:yellowgreen");
        TAS.warn("warning","Earned "+(Game.cookiesEarned-line["cookies baked"])+" more cookies than expected.");
      }
      logArgs.push("color:lightgray");
    }else logText+="\nCookies baked "+Game.cookiesEarned+"("+line["cookies baked"]+")";
    logText+="\nadelayl "+Game.accumulatedDelay+
      "\n-----------";
    console.log(logText,...logArgs);
  }else if (Math.ceil(TAS.time-Game.time+Game.accumulatedDelay)>=5000){
    if (+line["time (ms)"]>0) Game.Loop();
  }
  if (TAS.time-Game.startDate==TAS.finalTime){
    var logText="";
    var logArgs=[];
    for (var i=0;i<TAS.warnings.length;i++){
      var item=TAS.warnings[i];
      if (logText) logText+="\n";
      logText+="%c"+logText.time+" ";
      if (item.type=="info"){
        logText+="Info: ";
        logArgs.push("color:lightgray");
      }else if (item.type=="warning"){
        logText+="Warning: ";
        logArgs.push("color:orange");
      }else if (item.type=="error"){
        logText+="Error: ";
        logArgs.push("color:red");
      }
      logText+=item.message;
    }
    console.log(logText||"No errors!",...logArgs);
  }
}
TAS.updateInfo=function (){
  var frameTime=TAS.time-Game.time;
  var totalDelay=frameTime+Game.accumulatedDelay;
  var delayForm=frameTime+"+"+Game.accumulatedDelay.toFixed(1);
  TAS.infol.innerHTML=""+
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