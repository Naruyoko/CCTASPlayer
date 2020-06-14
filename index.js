var TAS={};
TAS.speed=1;
TAS.running=false;
TAS.n=function (n){
  if (typeof n=="number") return n;
  if (typeof n=="string") return +n.replace(/,/g,"");
}
TAS.parseTable=function (inputTable){
  var lines=inputTable.split(/\n(?=\d)/);
  var table=[];
  var headings=lines[0].split(/\t/);
  for (var i=0;i<lines.length-1;i++){
    var line=lines[i+1];
    var cells=line.split(/\t/);
    table[i]={};
    for (var j=0;j<headings.length;j++){
      var cell=cells[j];
      if (cell.indexOf("\n")!=-1) cell=cell.replace(/^"/,"").replace(/"$/,"");
      table[i][headings[j]]=cell;
    }
  }
  return table;
}
TAS.setup=function (inputTable){
  TAS.table=typeof inputTable=="string"?TAS.parseTable(inputTable):inputTable;
  if ((Game.Loop+"").indexOf("function anonymous")==-1) Game.Loop=Function("return "+(Game.Loop+"").replace("setTimeout","//")+"()");
  if ((Game.Logic+"").indexOf("function anonymous")==-1){
   var temp=Game.Logic+"";
   temp=temp.replace(/(?<=Math\.random\(\)<1)\/500000(?=\) Game\.Win\(\'Just p)/,""); //Force Just plain lucky
   Game.Logic=Function("return "+temp+"()");
  }
  if ((Game.updateShimmers+"").indexOf("function anonymous")==-1){
   var temp=Game.updateShimmers+"";
   temp=temp.replace(/(?<=Game\.hasBuff\(\'Cookie storm\'\) \&\& Math\.random\(\)<)0\.5/,"1"); //Force spawn cookie storm drop
   Game.updateShimmers=Function("return "+temp+"()");
  }
  if ((Game.shimmerTypes["golden"].popFunc+"").indexOf("function anonymous")==-1){
   var temp=Game.shimmerTypes["golden"].popFunc+"";
   temp=temp.replace("var moni=Math.max(mult*(Game.cookiesPs*60*Math.floor(Math.random()*7+1)),Math.floor(Math.random()*7+1));","var moni=Math.max(mult*(Game.cookiesPs*60*7),7);"); //Force best cookie storm drops
   Game.shimmerTypes["golden"].popFunc=Function("me","return "+temp+"(me)");
  }
  temp="if (Game.Achievements[what].won==0)";
  if ((Game.Win+"").indexOf("function anonymous")==-1) Game.Win=Function("what","return "+(Game.Win+"").replace(temp,temp+"console.log(\"%c\"+what+\" - \"+(TAS.time-Game.startDate)+\"(\"+(Game.time-Game.startDate)+\")\",\"color:yellow\");"+temp)+"(what)");
  Game.playCookieClickSound=function(){};
  TAS.now=TAS.now||Date.now;
  TAS.time=TAS.now();
  Date.now=function (){return TAS.time;};
  TAS.finalTime=TAS.n(TAS.table[TAS.table.length-1]["time (ms)"]);
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
  l("bakeryNameInput").value="Orteil";
  l("promptOption0").click();
  Game.bakeryNamePrompt();
  l("bakeryNameInput").value="TAS";
  l("promptOption0").click();
  if (Game.Achievements["Here you go"]) Game.Achievements["Here you go"].click();
  if (Game.Achievements["Tiny cookie"]) Game.ClickTinyCookie();
  if (Game.Achievements["Tabloid addiction"]){
    while (!Game.HasAchiev("Tabloid addiction"))
      Game.tickerL.click();
  }
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
  while (TAS.n(TAS.table[lineN]["time (ms)"])<TAS.time-Game.startDate) lineN++;
  var line=TAS.table[lineN];
  var totalClicks=0;
  for (var i=0;i<=lineN;i++) totalClicks+=TAS.n(TAS.table[i]["clicks more"]);
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
  if (TAS.n(line["time (ms)"])==TAS.time-Game.startDate){
    TAS.loop(lineN,true);
  }else if (line["lag?"]=="n"){
    if ((TAS.time-Game.startDate-TAS.n(TAS.table[lineN-1]["time (ms)"]))%33==0&&TAS.n(line["time (ms)"])-TAS.time+Game.startDate>=33) TAS.loop(lineN);
  }else if (TAS.time-Game.time+Game.accumulatedDelay+1000/30>=5000){
    var bulkLength=TAS.n(line["time (ms)"])-TAS.n(TAS.table[lineN-1]["time (ms)"]);
    var leastMaxLoopLength=bulkLength/Math.ceil(bulkLength/5000);
    if (TAS.time-Game.time+Game.accumulatedDelay>=leastMaxLoopLength) TAS.loop(lineN);
  }
  if (TAS.time-Game.startDate==TAS.finalTime){
    var logText="";
    var logArgs=[];
    for (var i=0;i<TAS.warnings.length;i++){
      var item=TAS.warnings[i];
      if (logText) logText+="\n";
      logText+="%c"+item.time+" ";
      if (item.type=="info"){
        logText+="Info: ";
        logArgs.push("color:lightgray");
      }else if (item.type=="warning"){
        logText+="Warning: ";
        logArgs.push("color:orange");
      }else if (item.type=="error"){
        logText+="Error: ";
        logArgs.push("color:red");
      }else{
        logArgs.push("color:lightgray");
      }
      logText+=item.message;
    }
    console.log(logText||"No errors!",...logArgs);
  }
}
TAS.loop=function (lineN,isFinal){
  var line=TAS.table[lineN];
  var logText="Cookies "+Game.cookies+
    "\nTime "+(TAS.time-Game.startDate)+
    "\nClicks "+Game.cookieClicks;
  var logArgs=[];
  var buildings={
    "Cursor":"c",
    "Grandma":"g",
    "Farm":"f",
    "Mine":"m",
    "Factory":"F",
    "Bank":"b",
    "Temple":"t"
  };
  for (var i of Object.getOwnPropertyNames(buildings)){
    if (!line[buildings[i]]) break;
    var object=Game.Objects[i];
    var amount=TAS.n(line[buildings[i]])-object.amount;
    if (amount>0) object.buy(amount);
    else if (amount<0) object.sell(-amount);
    if (isFinal&&TAS.n(line[buildings[i]])!=object.amount) TAS.warn("error","Failed to get wanted amount of "+i+".");
  }
  var upgrades=line["u"]?line["u"].split("\n").filter(Boolean):[];
  if (upgrades.length){
    logText+="\nUpgrades %c"+upgrades+"%c";
    logArgs.push("color:yellowgreen");
    logArgs.push("color:lightgray");
    for (var i of upgrades){
      if (Game.Upgrades[i]){
        Game.Upgrades[i].buy();
        if (isFinal&&!Game.Upgrades[i].bought) TAS.warn("error","Failed to buy "+i+".");
      }else if (isFinal){
        TAS.warn("error","Unable to find "+i+".");
      }
    }
  }
  if (!Game.HasAchiev("Cookie-dunker")) Game.LeftBackground.canvas.height=100;
  if (TAS.n(line["time (ms)"])>0){
    if (TAS.time-Game.time<33) TAS.warn("error","Loop was run too early.");
    Game.Loop();
  }
  if (Game.HasAchiev("Cookie-dunker")) Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
  if (isFinal&&line["GC buff"]){
    if (line["GC buff"]!="cookie storm drop"){
      logText+="\nSpawned golden cookie - %c"+line["GC buff"]+"%c";
      logArgs.push("color:#06f");
      logArgs.push("color:lightgray");
      if (Game.shimmerTypes["golden"].time<=Game.shimmerTypes["golden"].minTime) TAS.warn("error","Golden cookie was spawned too early.");
      var newShimmer=new Game.shimmer("golden");
      newShimmer.force=line["GC buff"];
    }
  }
  for (var i=0;i<Game.shimmers.length;i++){
    if (Game.shimmers[i].type=="golden"){
      Game.shimmers[i].l.click();
      i--;
    }
  }
  if (isFinal&&Math.abs(Game.cookiesEarned-TAS.n(line["cookies baked"]))>0.001){
    logText+="\nCookies baked %c"+Game.cookiesEarned+"("+line["cookies baked"]+")%c";
    if (Game.cookiesEarned<TAS.n(line["cookies baked"])){
      logArgs.push("color:red");
      TAS.warn("warning","Earned "+(TAS.n(line["cookies baked"])-Game.cookiesEarned)+" less cookies than expected.");
    }else{
      logArgs.push("color:yellowgreen");
      TAS.warn("info","Earned "+(Game.cookiesEarned-TAS.n(line["cookies baked"]))+" more cookies than expected.");
    }
    logArgs.push("color:lightgray");
  }else logText+="\nCookies baked "+Game.cookiesEarned+"("+line["cookies baked"]+")";
  logText+="\nadelayl "+Game.accumulatedDelay+"("+line["adelayl"]+")"+
    "\n-----------";
  if (isFinal) console.log(logText,...logArgs);
  if (isFinal&&Math.abs(line["adelayl"]-Game.accumulatedDelay)>0.1) TAS.warn("warning","Game.accumulatedDelay was different from what is given.");
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
TAS.tutorial=function (){
  console.log(
    "%cCookie Clicker TAS Player"+
    "\n%cHow to use:%c"+
    "\n1.\tCopy the spreadsheet."+
    "\n2.\tPaste it as a string inside TAS.parse(). %cDo not remove newlines. %cRecommended to use ``."+
    "\n3.\tTAS.stop();TAS.start(); to play."+
    "\n%cHotkeys:%c"+
    "\nl\tGame.Loop()"+
    "\nr\tTAS.start()"+
    "\ns\tTAS.stop()"+
    "\n9\tTAS.finalTime=0"+
    "\n0\tTAS.finalTime=default"+
    "\n7\tTAS.finalTime=bulk before"+
    "\n8\tTAS.finalTime=bulk after"+
    "\ni\tTAS.finalTime=now"+
    "\no\tTAS.finalTime--"+
    "\np\tTAS.finalTime++"+
    "\nh\tShow this help"+
    ""
    ,"font-size:24px;color:white;"
    ,"font-size:18px"
    ,""
    ,"color:red"
    ,""
    ,"font-size:18px"
    ,""
  );
}
TAS.keypress=function (e){
  var key=e.key;
  if (key=="l") Game.Loop();
  if (key=="r") TAS.start();
  if (key=="s") TAS.stop();
  if (key=="9") TAS.finalTime=0;
  if (key=="0") TAS.finalTime=TAS.n(TAS.table[TAS.table.length-1]["time (ms)"]);
  if (key=="7"){
    var lineN=0;
    while (TAS.n(TAS.table[lineN]["time (ms)"])<TAS.finalTime) lineN++;
    if (lineN>0) TAS.finalTime=TAS.n(TAS.table[lineN-1]["time (ms)"]);
  }
  if (key=="8"){
    var lineN=0;
    while (TAS.n(TAS.table[lineN]["time (ms)"])<=TAS.finalTime) lineN++;
    if (lineN<TAS.table.length-1) TAS.finalTime=TAS.n(TAS.table[lineN]["time (ms)"]);
  }
  if (key=="i") TAS.finalTime=TAS.time-Game.startDate;
  if (key=="o") TAS.finalTime--;
  if (key=="p") TAS.finalTime++;
  if (key=="h") TAS.tutorial();
}
window.addEventListener("keypress",TAS.keypress);
TAS.tutorial();