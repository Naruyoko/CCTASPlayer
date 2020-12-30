var TAS={};
TAS.speed=1;
TAS.running=false;
TAS.paused=false;
TAS.particles=1;
TAS.fancy=1;
TAS.n=function (n){
  if (typeof n=="number") return n;
  if (typeof n=="string") return +n.replace(/,/g,"");
}
TAS.parseTable=function (inputTable){
  var lines=inputTable.split(/\r?\n(?=\d)/);
  var table=[];
  var headings=lines[0].split(/\t/);
  if (headings.includes("utilcodebefore")||headings.includes("utilcodeafter")) alert("Notice: This strategy contains JavaScript code. Please make sure that it is valid and is safe.");
  for (var i=0;i<lines.length-1;i++){
    var line=lines[i+1];
    var cells=line.split(/\t/);
    table[i]={};
    for (var j=0;j<headings.length;j++){
      var cell=cells[j];
      if (cell.indexOf("\n")!=-1) cell=cell.replace(/^"/,"").replace(/"$/,"");
      if (!isNaN(TAS.n(cell))) cell=TAS.n(cell);
      table[i][headings[j]]=cell;
    }
  }
  return table;
}
TAS.setup=function (inputTable){
  TAS.table=typeof inputTable=="string"?TAS.parseTable(inputTable):inputTable;
  TAS.settings={};
  if (TAS.table[0]["time (ms)"]==-1&&TAS.table[0]["utilcodebefore"]){
    for (var i of TAS.table[0]["utilcodebefore"].split(",")){
      TAS.settings[i.substring(0,i.indexOf(":"))]=TAS.settings[i.substring(i.indexOf(":")+1)];
    }
  }
  function getBody(f){
    var entire=f.toString(); 
    return entire.slice(entire.indexOf("{")+1,entire.lastIndexOf("}"));
  }
  function unedited(f){
    return !f||f.toString().indexOf("function anonymous")==-1;
  }
  if (unedited(Game.Loop))
    Game.Loop=Function(getBody(Game.Loop)
      .replace("setTimeout","//") //Only loop on command
      );
  if (unedited(Game.Logic))
    Game.Logic=Function(getBody(Game.Logic)
      .replace(/(?<=Math\.random\(\)<1)\/500000(?=\) Game\.Win\(\'Just p)/,"") //Force Just plain lucky
      );
  if (unedited(Game.updateShimmers))
    Game.updateShimmers=Function(getBody(Game.updateShimmers)
      .replace(/(?<=Game\.hasBuff\(\'Cookie storm\'\) \&\& Math\.random\(\)<)0\.5/,"1") //Force spawn cookie storm drop
      );
  if (unedited(Game.shimmerTypes["golden"].popFunc))
    Game.shimmerTypes["golden"].popFunc=Function("me",getBody(Game.shimmerTypes["golden"].popFunc)
      .replace("var moni=Math.max(mult*(Game.cookiesPs*60*Math.floor(Math.random()*7+1)),Math.floor(Math.random()*7+1));","var moni=Math.max(mult*(Game.cookiesPs*60*7),7);") //Force best cookie storm drops
      );
  if (unedited(Game.shimmerTypes["reindeer"].popFunc))
    Game.shimmerTypes["reindeer"].popFunc=Function("me",getBody(Game.shimmerTypes["reindeer"].popFunc)
      .replace("if (Math.random()>failRate)","if (true)") //Force cookie drop
      .replace(/cookie=(?=choose\(\[[' ,A-Za-z]*\]\);)/,"cookie=me.cookie||") //Choosable cookie drop
      );
  if (unedited(Game.Win))
    Game.Win=Function("what",getBody(Game.Win)
      .replace("if (Game.Achievements[what].won==0)","if (Game.Achievements[what].won==0)console.log(\"%c\"+what+\" - \"+(TAS.getCurrentTime())+\"(\"+(Game.time-Game.startDate)+\")\",\"color:yellow\");if (Game.Achievements[what].won==0)")
      );
  if (unedited(Game.SpawnWrinkler))
    Game.SpawnWrinkler=Function("me",getBody(Game.SpawnWrinkler)
      .replace("if (Math.random()<0.0001)","if (true)") //Force shiny wrinkler
      );
  if (unedited(Game.UpdateWrinklers))
    Game.UpdateWrinklers=Function(getBody(Game.UpdateWrinklers)
      .replace("if (Math.random()<chance)","if (TAS.wrinklerRequest?TAS.wrinklerRequest.includes(+i):Math.random()<chance)") //Wrinkler spawn when wanted
      .replace("Game.SpawnWrinkler(me);","Game.SpawnWrinkler(me);TAS.wrinklerRequest.splice(TAS.wrinklerRequest.indexOf(+i),1);") //Remove from request;
      .replace("if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect))","if (Game.wrinklers[i].phase>0 && TAS.wrinklerSelectRequest==+i)") //Select wrinkler
      .replace("if (Game.Click && Game.lastClickedEl==l('backgroundLeftCanvas'))","if (TAS.wrinklerHurtRequest)") //Hurt wrinkler on request
      );
  if (unedited(Game.getNewTicker))
    Game.getNewTicker=Function("manual",getBody(Game.getNewTicker)
      .replace("Math.random()<(Game.HasAchiev('O Fortuna')?0.04:0.02)","TAS.requestFortune") //Fortune on request
      .replace("var me=choose(fortunes)","var me=TAS.requestFortune;TAS.requestFortune=null") //Get requested fortune and remove request
      );
  if (unedited(Game.makeSeed))
    Game.makeSeed=Function("if(TAS.defaultSeed)return TAS.defaultSeed;"+getBody(Game.makeSeed));
  if (unedited(TAS.util._UpgradeSantaSpecified))
    TAS.util._UpgradeSantaSpecified=Function("drop",getBody(Game.UpgradeSanta)
      .replace("var drop=(?=choose(drops))","var drop=typeof drop!=\"undefined\"?drop:") //Force best cookie storm drops
      );
  Game.playCookieClickSound=function(){};
  window.setTimeout=function (callback,ms){
    var args=Array.from(arguments).slice(2);
    var time=TAS.getCurrentTime()+Math.floor(ms);
    var min=0,max=TAS.setTimeoutQueue.length-1;
    var index;
    while (min<max){
      if (TAS.setTimeoutQueue[max].time==time){
        index=max;
        break;
      }
      if (TAS.setTimeoutQueue[min].time==time){
        index=min;
        break;
      }
      var mid=Math.floor((min+max)/2);
      if (min==mid||TAS.setTimeoutQueue[mid].time==time){
        index=mid;
        break;
      }
      if (TAS.setTimeoutQueue[mid].time<time) min=mid;
      if (TAS.setTimeoutQueue[mid].time>time) max=mid;
    }
    while (index<TAS.setTimeoutQueue.length&&TAS.setTimeoutQueue[index].time<=time) index++
    TAS.setTimeoutQueue.splice(index,0,{callback:callback,time:time,args:args});
  }
  TAS.setTimeoutQueue=[];
  TAS.now=TAS.now||Date.now;
  TAS.startTime=TAS.settings["startTime"]?+TAS.settings["startTime"]:TAS.now();
  TAS.time=TAS.startTime;
  TAS.lastTime=TAS.time;
  TAS.offsetTime=0;
  TAS.defaultSeason=TAS.settings["season"]?TAS.settings["season"]:"";
  TAS.defaultSeed=TAS.settings["seed"]?TAS.settings["seed"]:"";
  Date.now=function (){return TAS.time;};
  var oldTotalLength=TAS.totalLength;
  TAS.totalLength=TAS.table[TAS.table.length-1]["time (ms)"];
  TAS.finalTime=Math.min(typeof TAS.finalTime=="number"&&TAS.finalTime<oldTotalLength&&TAS.finalTime>=0?TAS.finalTime:TAS.totalLength,TAS.totalLength);
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
  TAS.time=TAS.startTime;
  Game.CloseNotes();
  Game.ShowMenu("options");
  Game.HardReset();
  l("promptOption0").click();
  l("promptOption0").click();
  TAS.setTimeoutQueue=[];
  TAS.time=TAS.startTime-1;
  TAS.lastTime=TAS.now();
  TAS.offsetTime=TAS.startTime-TAS.lastTime;
  Game.season=TAS.defaultSeason;
  Game.time=TAS.startTime;
  Game.accumulatedDelay=0;
  Game.lastClick=-Infinity;
  Game.startDate=Game.time;
  Game.fullDate=Game.time;
  TAS.lastBulkAccumulatedDelay=0;
  TAS.running=true;
  TAS.paused=false;
  TAS.shimmers=[];
  TAS.wrinklerRequest=[];
  TAS.wrinklerSelectRequest=-1;
  TAS.wrinklerHurtRequest=false;
  TAS.requestFortune=null;
  if (Game.prefs.fancy!=TAS.fancy){
    Game.prefs.fancy=!Game.prefs.fancy;
    Game.ToggleFancy();
    PlaySound('snd/tick.mp3');
  }
  Game.prefs.notifs=1;
  Game.ShowMenu("stats");
  TAS.util.ChangeBakeryName("Orteil");
  TAS.util.ChangeBakeryName("TAS");
  if (Game.Achievements["Here you go"]) Game.Achievements["Here you go"].click();
  if (Game.Achievements["Tiny cookie"]) Game.ClickTinyCookie();
  if (Game.Achievements["Tabloid addiction"]){
    while (!Game.HasAchiev("Tabloid addiction"))
      TAS.util.ClickNews();
  }
  TAS.warnings=[];
}
TAS.togglePause=function (){
  TAS.paused=!TAS.paused;
}
TAS.stop=function (){
  if (!TAS.running){
    Game.HardReset(2);
    TAS.time=TAS.startTime;
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
  TAS.paused=false;
  TAS.updateInfo();
}
TAS.setSpeed=function (speed){
  var gameTime=TAS.getCurrentTime();
  TAS.offsetTime=gameTime-(gameTime-TAS.offsetTime)/TAS.speed*speed;
  if (isNaN(TAS.offsetTime)) TAS.offsetTime=gameTime-(TAS.lastTime-Game.startDate)*speed;
  TAS.speed=speed;
}
TAS.warn=function (type,message){
  TAS.warnings.push({type:type,time:TAS.getCurrentTime(),message:message});
}
TAS.getCurrentTime=function (){
  return TAS.time-Game.startDate;
}
TAS.update=function (){
  if (!TAS.running) return;
  var trueDate=TAS.now();
  if (TAS.paused) TAS.offsetTime-=(trueDate-TAS.lastTime)*TAS.speed;
  TAS.lastTime=trueDate;
  var targetTime=Math.min(Math.floor((trueDate-Game.startDate)*TAS.speed+TAS.offsetTime),TAS.finalTime);
  while (TAS.getCurrentTime()<targetTime&&(TAS.getCurrentTime()%1000!=0||TAS.now()-trueDate<100)){
    TAS.time++;
    TAS.frame();
  }
  TAS.offsetTime-=targetTime-TAS.getCurrentTime();
  TAS.updateInfo();
}
TAS.frame=function (){
  while (TAS.setTimeoutQueue.length&&TAS.setTimeoutQueue[0].time<=TAS.getCurrentTime()){
    var item=TAS.setTimeoutQueue.shift();
    item.callback.apply(item.args);
  }
  var lineN=0;
  while (TAS.table[lineN]["time (ms)"]<TAS.getCurrentTime()) lineN++;
  var line=TAS.table[lineN];
  var totalClicks=0;
  for (var i=0;i<=lineN;i++) totalClicks+=TAS.table[i]["clicks more"];
  if (TAS.time-Game.lastClick>=1000/250&&Game.cookieClicks<totalClicks){
    var x=Game.cookieOriginX;
    var y=Game  .cookieOriginY;
    TAS.mouseX=x; 
    TAS.mouseY=y;
    Game.mouseX=TAS.mouseX;
    Game.mouseY=TAS.mouseY;
    Game.prefs.particles=Game.prefs.numbers=+(TAS.particles&&(totalClicks-Game.cookieClicks<=25||line["lag?"]=="n"));
    Game.ClickCookie();
    Game.prefs.particles=Game.prefs.numbers=1;
  }
  var bulkLength=line["time (ms)"]-(TAS.table[lineN-1]?TAS.table[lineN-1]["time (ms)"]:0)+TAS.lastBulkAccumulatedDelay;
  if (line["time (ms)"]==TAS.getCurrentTime()){
    TAS.loop(lineN,true);
    TAS.lastBulkAccumulatedDelay=Game.accumulatedDelay;
  }else if (line["lag?"]=="n"){
    if ((TAS.getCurrentTime()-(TAS.table[lineN-1]?TAS.table[lineN-1]["time (ms)"]:0))%33==0&&line["time (ms)"]-TAS.time+Game.startDate>=33) TAS.loop(lineN);
  }else if (bulkLength>=5000+1000/30){
    var leastMaxLoopLength=bulkLength/Math.ceil(bulkLength/(5000+1000/30));
    if (TAS.time-Game.time+Game.accumulatedDelay>=leastMaxLoopLength) TAS.loop(lineN);
  }
  if (TAS.getCurrentTime()==TAS.finalTime){
    Game.ShowMenu("stats");
    Game.ShowMenu("stats");
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
    logArgs.unshift(logText||"No errors!");
    console.log.apply(logArgs);
  }
}
TAS.loop=function (lineN,isFinal){
  var line=TAS.table[lineN];
  var logText="Cookies "+Game.cookies+
    "\nTime "+(TAS.getCurrentTime())+
    "\nClicks "+Game.cookieClicks;
  var logArgs=[];
  var buildings={
    "Cursor":"c",
    "Grandma":"g",
    "Farm":"f",
    "Mine":"m",
    "Factory":"F",
    "Bank":"b",
    "Temple":"t",
    "Wizard tower":"wt",
    "Shipment":"s",
    "Alchemy lab":"al",
    "Portal":"p",
    "Time machine":"tm",
    "Antimatter condenser":"ac",
    "Prism":"P",
    "Chancemaker":"C",
    "Fractal engine":"fe",
    "Javascript console":"jc"
  };
  var sells=[];
  var buys=[];
  for (var i of Object.getOwnPropertyNames(buildings)){
    if (line[buildings[i]]===undefined||line[buildings[i]]=="X") continue;
    var object=Game.Objects[i];
    var amount=line[buildings[i]]-object.amount;
    if (amount>0) buys.push([object,amount,line[buildings[i]]]);
    else if (amount<0) sells.push([object,-amount,line[buildings[i]]]);
  }
  for (var i of sells)
    TAS.util.Sell(i[0],i[1]);
  for (var i of buys){
    TAS.util.Buy(i[0],i[1]);
    if (isFinal&&i[2]!=i[0].amount) TAS.warn("error","Failed to get wanted amount of "+i[0].name+".");
  }
  var upgrades=line["u"]?line["u"].split("\n").filter(Boolean):[];
  if (upgrades.length){
    logText+="\nUpgrades %c"+upgrades+"%c";
    logArgs.push("color:yellowgreen");
    logArgs.push("color:lightgray");
    for (var i of upgrades){
      if (Game.Upgrades[i]){
        if (!Game.Upgrades[i].unlocked) TAS.warn("warning",i+" hasn't been unlocked yet.");
        Game.Upgrades[i].buy();
        if (isFinal&&!Game.Upgrades[i].bought) TAS.warn("error","Failed to buy "+i+".");
      }else if (isFinal){
        TAS.warn("error","Unable to find "+i+".");
      }
    }
  }
  if (!Game.HasAchiev("Cookie-dunker")&&Game.milkProgress>0.1) Game.LeftBackground.canvas.height=100;
  if (line["time (ms)"]>0){
    if (TAS.time-Game.time<33) TAS.warn("error","Loop was run too early.");
    if (line["utilcodebefore"]&&TAS.getCurrentTime()==line["time (ms)"]){
      try{
        Function(line["utilcodebefore"])();
      }catch(e){
        TAS.warn("error","Error occurred while executing:\n"+e.stack);
        console.error(e);
      }
    }
    Game.Loop();
    if (line["utilcodeafter"]&&TAS.getCurrentTime()==line["time (ms)"]){
      try{
        Function(line["utilcodeafter"])();
      }catch(e){
        TAS.warn("error","Error occurred while executing:\n"+e.stack);
        console.error(e);
      }
    }
  }
  Game.LeftBackground.canvas.height=Game.LeftBackground.canvas.parentNode.offsetHeight;
  if (isFinal&&line["GC buff"]){
    if (line["GC buff"]!="cookie storm drop"){
      logText+="\nSpawned golden cookie - %c"+line["GC buff"]+"%c";
      logArgs.push("color:#06f");
      logArgs.push("color:lightgray");
      TAS.util.SpawnGoldenCookie(line["GC buff"]);
    }
  }
  TAS.util.PopShimmers();
  if (isFinal){ //log stuff
    if (line["cookies baked"]!==undefined&&Math.abs(Game.cookiesEarned-line["cookies baked"])>0.001){
      logText+="\nCookies baked %c"+Game.cookiesEarned+"("+line["cookies baked"]+")%c";
      if (Game.cookiesEarned<line["cookies baked"]){
        logArgs.push("color:red");
        TAS.warn("warning","Earned "+(line["cookies baked"]-Game.cookiesEarned)+" less cookies than expected.");
      }else{
        logArgs.push("color:yellowgreen");
        TAS.warn("info","Earned "+(Game.cookiesEarned-line["cookies baked"])+" more cookies than expected.");
      }
      logArgs.push("color:lightgray");
    }else logText+="\nCookies baked "+Game.cookiesEarned+(line["cookies baked"]===undefined?"":"("+line["cookies baked"]+")");
    logText+="\nadelayl "+Game.accumulatedDelay+(line["adelayl"]===undefined?"":"("+line["adelayl"]+")")+
      "\n-----------";
    logArgs.unshift(logText);
    console.log.apply(logArgs);
    if (line["adelayl"]!==undefined&&Math.abs(line["adelayl"]-Game.accumulatedDelay)>0.1) TAS.warn("warning","Game.accumulatedDelay was different from what was expected.");
  }
}
TAS.updateInfo=function (){
  var frameTime=TAS.time-Game.time;
  var totalDelay=frameTime+Game.accumulatedDelay;
  var delayForm=frameTime+"+"+Game.accumulatedDelay.toFixed(1);
  TAS.infol.innerHTML=""+
    "Time : "+(TAS.getCurrentTime())+"ms<br>"+
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
    "\ne\tTAS.togglePause()"+
    "\ns\tTAS.stop()"+
    "\n9\tTAS.finalTime=0"+
    "\n0\tTAS.finalTime=default"+
    "\n7\tTAS.finalTime=bulk before"+
    "\n8\tTAS.finalTime=bulk after"+
    "\ni\tTAS.finalTime=now"+
    "\no\tTAS.finalTime--"+
    "\np\tTAS.finalTime++"+
    "\nv\tTAS.offsetTime+=1"+
    "\nb\tTAS.offsetTime+=33"+
    "\nn\tTAS.offsetTime+=1000"+
    "\nm\tTAS.offsetTime+=+prompt()"+
    "\nu\tUpdate stats"+
    "\nh\tShow this help"+
    "\n%cSettings:%c"+
    "\nTAS.particles - Enable/disable click particles"+
    "\nTAS.fancy - Enable/disable fancy graphics"+
    "\nTAS.setSpeed() - Set playback speed"+
    ""
    ,"font-size:24px;color:white;"
    ,"font-size:18px"
    ,""
    ,"color:red"
    ,""
    ,"font-size:18px"
    ,""
    ,"font-size:18px"
    ,""
  );
}
TAS.keypress=function (e){
  if (document.activeElement&&(document.activeElement.nodeName.toLowerCase()=="input"||document.activeElement.nodeName.toLowerCase()=="textarea")) return;
  var key=e.key;
  if (key=="l") Game.Loop();
  if (key=="r") TAS.start();
  if (key=="e") TAS.togglePause();
  if (key=="s") TAS.stop();
  if (key=="9") TAS.finalTime=0;
  if (key=="0") TAS.finalTime=TAS.table[TAS.table.length-1]["time (ms)"];
  if (key=="7"){
    var lineN=0;
    while (TAS.table[lineN]["time (ms)"]<TAS.finalTime) lineN++;
    if (lineN>0) TAS.finalTime=TAS.table[lineN-1]["time (ms)"];
  }
  if (key=="8"){
    var lineN=0;
    while (TAS.table[lineN]["time (ms)"]<=TAS.finalTime) lineN++;
    if (lineN<TAS.table.length-1) TAS.finalTime=TAS.table[lineN]["time (ms)"];
  }
  if (key=="i") TAS.finalTime=TAS.getCurrentTime();
  if (key=="o") TAS.finalTime--;
  if (key=="p") TAS.finalTime++;
  if (key=="v") TAS.offsetTime+=1;
  if (key=="b") TAS.offsetTime+=33;
  if (key=="n") TAS.offsetTime+=1000;
  if (key=="m") TAS.offsetTime+=prompt("Offset time?");
  if (key=="u") Game.UpdateMenu();
  if (key=="h") TAS.tutorial();
}
window.addEventListener("keypress",TAS.keypress);

TAS.util={};
TAS.util.ShowMenu=function (s){
  if (!s||s=="close"){
    Game.ShowMenu();
  }else{
    Game.ShowMenu(s);
  }
}
TAS.util.ChangeBakeryName=function (s){
  Game.bakeryNamePrompt();
  l("bakeryNameInput").value=s;
  l("promptOption0").click();
}
TAS.util.searchSeed=function (criterias){
  for (var i=0;i<Math.pow(26,5);i++){
    var ci=i;
    var seed="";
    for (var j=0;j<5;j++){
      seed+="abcdefghijklmnopqrstuvwxyz"[ci%26];
      ci=Math.floor(ci/26);
    }
    var b=true;
    for (var j=0;b&&j<criterias;j++) b=criterias[j](seed);
    if (b) return seed;
  }
  return "None found";
}
TAS.util.ClickNews=function (){
  Game.tickerL.click();
}
TAS.util.MakeNextNewsFortuneWhenPossible=function (fortune){
  if (typeof fortune=="number"&&fortune<600) fortune=Game.Tiers['fortune'].upgrades[fortune];
  else if (typeof fortune=="string"&&(fortune=="fortuneGC"||fortune=="fortuneCPS")) fortune=fortune;
  else{
    for (var i=0;i<Game.Tiers['fortune'].upgrades.length;i++){
      var upg=Game.Tiers['fortune'].upgrades[i];
      if (typeof fortune=="number"&&upg.id==fortune||typeof fortune=="string"&&upg.name==fortune){
        fortune=upg;
        break;
      }
    }
    if (!Game.Tiers['fortune'].upgrades.includes(fortune)){
      TAS.warn("error","Fortune not found.");
    }
  }
  if (fortune=="fortuneGC"&&Game.fortuneGC){
    TAS.warn("error","Fortune GC can only be spawned once per ascension.");
    return;
  }
  if (fortune=="fortuneCPS"&&Game.fortuneCPS){
    TAS.warn("error","Fortune cookie gain can only be earned once per ascension.");
    return;
  }
  if (Game.Tiers['fortune'].upgrades.includes(fortune)&&Game.HasUnlocked(fortune)){
    TAS.warn("error","Fortune already unlocked.");
    return;
  }
  TAS.requestFortune=fortune;
}
TAS.util.getBuilding=function (building){
  if (typeof building=="number") building=Game.ObjectsById[building];
  if (typeof building=="string") building=Game.Objects[building];
  if (!building||!Game.ObjectsById.includes(building)){
    TAS.warn("error","Building not found.");
    return null;
  }
  return building;
}
TAS.util.Buy=function (building,amount){
  building=TAS.util.getBuilding(building);
  if (!building) return;
  if (amount>0) building.buy(amount);
  if (amount<0) building.sell(-amount);
}
TAS.util.Sell=function (building,amount){
  building=TAS.util.getBuilding(building);
  if (!building) return;
  if (amount>0) building.sell(amount);
  if (amount<0) building.buy(-amount);
}
TAS.util.SpawnGoldenCookie=function (force){
  if (Game.shimmerTypes["golden"].time<=Game.shimmerTypes["golden"].minTime) TAS.warn("error","Golden cookie was spawned too early.");
  var newShimmer=new Game.shimmer("golden");
  newShimmer.force=force;
  newShimmer.spawnLead=1;
  TAS.shimmers.push(newShimmer);
}
TAS.util.SpawnReindeer=function (cookie){
  if (Game.shimmerTypes["reindeer"].time<=Game.shimmerTypes["reindeer"].minTime) TAS.warn("error","Reindeer was spawned too early.");
  if (cookie&&(Game.HasUnlocked(cookie)||Game.Has(cookie))) TAS.warn("warning","Has already unlocked "+cookie+".");
  var newShimmer=new Game.shimmer("reindeer");
  newShimmer.spawnLead=1;
  newShimmer.cookie=cookie;
  TAS.shimmers.push(newShimmer);
}
TAS.util.PopShimmers=function (){
  for (var i=0;i<TAS.shimmers.length;i++){
    TAS.shimmers[i].l.click();
    TAS.shimmers.splice(i,1);
    i--;
  }
  for (var i=0;i<Game.shimmers.length;i++){
    if (Game.shimmers[i].type=="golden"&&Game.shimmers[i].force=="cookie storm drop"){
      Game.shimmers[i].l.click();
      i--;
    }
  }
}
TAS.util.SpawnWrinkler=function (id){
  if (id>=Game.getWrinklersMax()) TAS.warn("error","Unable to spawn wrinkler: id specified ("+id+") was too large.");
  if (Game.wrinklers[id].phase>0) TAS.warn("info","The wrinkler on id "+id+" was already spawned.");
  if (TAS.wrinklerRequest.includes(id)) TAS.warn("info","The wrinkler spawn request on "+id+" was already done.");
  TAS.wrinklerRequest.push(id);
}
TAS.util.SelectWrinkler=function (id){
  if (id>=Game.getWrinklersMax()) TAS.warn("error","Unable to select wrinkler: id specified ("+id+") was too large.");
  if (Game.wrinklers[id].phase==0) TAS.warn("info","The wrinkler on id "+id+" was not spawned.");
  TAS.wrinklerSelectRequest=id;
}
TAS.util.HurtWrinkler=function (){
  TAS.wrinklerHurtRequest=true;
}
TAS.util.LeaveWrinkler=function (){
  TAS.wrinklerHurtRequest=false;
}
TAS.util.Ascend=function (){
  Game.Ascend();
  l("promptOption0").click();
  Game.AscendTimer=Game.AscendDuration;
}
TAS.util.PurchaceHeavenlyUpgrade=function (a){
  if (!Game.OnAscend) TAS.warn("warn","Purchacing heavenly upgrade while not ascending.");
  if (!(a instanceof Array)) a=[a];
  for (i of a){
    var upg;
    if (typeof i=="number"){
      upg=Game.UpgradesById[i];
      if (!upg) TAS.warn("error","Unable to find upgrade with id "+i+".");
    }else if (typeof i=="String"){
      upg=Game.Upgrades[i];
      if (!upg) TAS.warn("error","Unable to find "+i+".");
    }else TAS.warn("error","Upgrade must either be specified by their id or name.");
    for (parentUpg of upg.parents){
      if (!parentUpg.bought){
        TAS.warn("warning",upg.name+" hasn't been unlocked yet.");
        break;
      }
    }
    var upgid=upg.id;
    Game.PurchaseHeavenlyUpgrade(upgid);
    if (!upg.bought) TAS.warn("error","Failed to buy "+upg.name+".");
  }
}
TAS.util.PickAscensionMode=function (mode){
  if (!Game.OnAscend) TAS.warn("warn","Changing game mode while not ascending.");
  Game.PickAscensionMode();
  l("challengeModeSelector"+mode).click();
  l("promptOption0").click();
}
TAS.util.Reincarnate=function (){
  if (!Game.OnAscend) TAS.warn("warn","Reincarnating while not ascending.");
  l("ascendButton").click();
  l("promptOption0").click();
}
TAS.util.ToggleSantaTab=function (on){
  if (on===undefined) on=Game.specialTab!="santa";
  if (!Game.Has("A festive hat")) TAS.warn("warning","Santa hasn't been unlocked yet.");
  Game.specialTab="santa";
  Game.ToggleSpecialMenu(on);
}
TAS.util.UpgradeSanta=function (drop){
  if (Game.specialTab!="santa") TAS.util.ToggleSantaTab(true);
  if (!Game.Has("A festive hat")) TAS.warn("warning","Santa hasn't been unlocked yet.");
  if (!Game.santaDrops.includes(drop)) TAS.warn("error","Unable to find "+drop+".");
  if (drop&&(Game.HasUnlocked(drop)||Game.Has(drop))) TAS.warn("warning","Has already unlocked "+drop+".");
  var moni=Math.pow(Game.santaLevel+1,Game.santaLevel+1);
  if (Game.cookies>moni&&Game.santaLevel<14){ //See Game.UpgradeSanta
    TAS.util._UpgradeSantaSpecified(drop);
  }else if (Game.santaLevel>=14){
    TAS.warn("warning","Santa is already fully upgraded");
  }else{
    TAS.warn("error","Failed to upgrade Santa.");
  }
}
TAS.util.ToggleDragonTab=function (on){
  if (on===undefined) on=Game.specialTab=="dragon";
  if (!Game.Has("A crumbly egg")) TAS.warn("warning","Dragon hasn't been unlocked yet.");
  Game.specialTab="dragon";
  Game.ToggleSpecialMenu(on);
}
TAS.util.UpgradeDragon=function (){
  if (Game.specialTab!="dragon") TAS.util.ToggleDragonTab(true);
  if (!Game.Has("A crumbly egg")) TAS.warn("warning","Dragon hasn't been unlocked yet.");
  if (Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost()){ //See Game.UpgradeDragon
    Game.UpgradeDragon();
  }else if (Game.santaLevel>=14){
    TAS.warn("warning","Santa is already fully upgraded");
  }else{
    TAS.warn("error","Failed to upgrade Santa.");
  }
}
TAS.util.clickLump=function (){
  if (!Game.canLumps()) TAS.warn("warning","Sugar lumps hasn't been unlocked yet."); 
  Game.clickLump();
}
TAS.util.ToggleMute=function (building){
  building=TAS.util.getBuilding(building);
  if (!building) return;
  if (Game.Objects["Grandma"].muted) l("mutedProduct"+building.id).click();
  else l("productMute"+building.id).click();
}
TAS.util.ToggleMinigameMenu=function (building){
  building=TAS.util.getBuilding(building);
  if (!building) return;
  if (!building.minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  l("productMinigameButton"+building.id).click();
}
TAS.util.LevelUp=function (building){
  if (!Game.canLumps()) TAS.warn("warning","Sugar lumps hasn't been unlocked yet.");
  building=TAS.util.getBuilding(building);
  if (!building) return;
  if (Game.lumps<building.level+1) TAS.warn("error","Failed to level up "+building.name+".");
  building.levelUp();
}
TAS.util.refillLump=function (n,func){
  if (!Game.canLumps()) TAS.warn("warning","Sugar lumps hasn't been unlocked yet.");
  if (!Game.canRefillLump()){
    TAS.warn("error","Unable to refill.");
    return;
  }
  if (Game.lumps<n) TAS.warn("error","Failed to refill.");
  Game.refillLump(n,func);
}
TAS.util.RefillGarden=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  //See minigameGarden.js
  TAS.util.refillLump(1,function(){
    M.loopsMult=3;
    M.nextSoil=Date.now();
    //M.nextFreeze=Date.now();
    M.nextStep=Date.now();
    PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
  });
}
TAS.util.Garden={};
TAS.util.Garden.ToggleMenu=function (){
  TAS.util.ToggleMinigameMenu("Farm");
}
TAS.util.Garden.Refill=TAS.util.RefillGarden;
TAS.util.Garden.HarvestAll=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  PlaySound('snd/toneTick.mp3');
  Game.Objects["Farm"].minigame.harvestAll();
}
TAS.util.Garden.HarvestAllMature=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  PlaySound('snd/toneTick.mp3');
  Game.Objects["Farm"].minigame.harvestAll(0,1,1);
}
TAS.util.Garden.ToggleFreeze=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  l("gardenTool-"+Game.Objects["Farm"].minigame.tools.freeze.id).click();
}
TAS.util.Garden.Convert=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  if (M.plantsUnlockedN<M.plantsN) {
    TAS.warn("error","Unable to convert farm.");
    return;
  }
  PlaySound('snd/toneTick.mp3');
  Game.Objects["Farm"].minigame.askConvert();
  l("promptOption0").click();
}
TAS.util.Garden.getPlant=function (plant){
  if (typeof plant=="number") plant=Game.Objects["Farm"].minigame.plantsById[plant];
  if (typeof plant=="string") plant=Game.Objects["Farm"].minigame.plants[plant];
  if (!plant||!Game.Objects["Farm"].minigame.plantsById.includes(plant)){
    TAS.warn("error","Plant not found.");
    return null;
  }
  return plant;
}
TAS.util.Garden.SelectSeed=function (plant){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  plant=TAS.util.Garden.getPlant(plant);
  if (!plant) return false;
  if (!plant.unlocked){
    TAS.warn("error",plant.name+" hasn't been unlocked yet.");
    return false;
  }
  if (Game.Objects["Farm"].minigame.seedSelected!=plant.id) l("gardenSeed-"+plant.id).click();
  return true;
}
TAS.util.Garden.UnselectSeed=function (){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return false;
  }
  if (Game.Objects["Farm"].minigame.seedSelected!=-1) l("gardenSeed-"+Game.Objects["Farm"].minigame.seedSelected).click();
  return true;
}
TAS.util.Garden.clickTile=function (x,y){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return false;
  }
  if (!Game.Objects["Farm"].minigame.isTileUnlocked(x,y)){
    TAS.warn("error","Garden plot at ("+x+","+y+") hasn't been unlocked yet.");
    return false;
  }
  Game.Objects["Farm"].minigame.clickTile(x,y);
}
TAS.util.Garden.PlantAtTile=function (plant,x,y){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return false;
  }
  if (!TAS.util.Garden.SelectSeed(plant)) return false;
  if (Game.Objects["Farm"].minigame.plot[y][x][0]>=1){
    TAS.warn("error","Garden plot at ("+x+","+y+") already has plant.");
    return false;
  }
  TAS.util.Garden.clickTile(x,y);
  return true;
}
TAS.util.Garden.HarvestTile=function (x,y){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return false;
  }
  if (Game.Objects["Farm"].minigame.plot[y][x][0]==0){
    TAS.warn("error","Garden plot at ("+x+","+y+") is not planted.");
    return false;
  }
  TAS.util.Garden.clickTile(x,y);
  return true;
}
TAS.util.Garden.ChangeSoil=function (soil){
  if (!Game.Objects["Farm"].minigameLoaded){
    TAS.warn("error","Garden minigame hasn't been unlocked yet.");
    return;
  }
  if (typeof soil=="number") soil=Game.Objects["Farm"].minigame.soilsById[soil];
  if (typeof soil=="string") soil=Game.Objects["Farm"].minigame.soil[soil];
  if (!soil||!Game.Objects["Farm"].minigame.soilsById.includes(soil)){
    TAS.warn("error","Soil not found.");
    return;
  }
  if (M.soil==soil.id){
    TAS.warn("info",soil.name+" is already selected.");
    return;
  }
  if (M.freeze||M.nextSoil>Date.now()){
    TAS.warn("error","Unable to switch soil.");
    return;
  }
  if (Game.Objects["Farm"].amount<soil.req){
    TAS.warn("error",soil.name+" hasn't been unlocked yet.");
    return;
  }
  l("gardenSoil-"+soil.id).click();
}
TAS.util.RefillPantheon=function (){
  if (!Game.Objects["Wizard tower"].minigameLoaded){
    TAS.warn("error","Pantheon minigame hasn't been unlocked yet.");
    return;
  }
  //See minigamePantheon.js
  if (M.magic>=M.magicM) TAS.warn("warning","Unable to refill Pantheon. Magic is full.");
  TAS.util.refillLump(1,function(){
    M.magic+=100;
    M.magic=Math.min(M.magic,M.magicM);
    PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
  });
}
TAS.util.Pantheon={};
TAS.util.Pantheon.ToggleMenu=function (){
  TAS.util.ToggleMinigameMenu("Temple");
}
TAS.util.Pantheon.Refill=TAS.util.RefillPantheon;
TAS.util.Pantheon.getGod=function (god){
  if (typeof god=="number") god=Game.Objects["Temple"].minigame.godsById[god];
  if (typeof god=="string") god=Game.Objects["Temple"].minigame.gods[god];
  if (!god||!Game.Objects["Temple"].minigame.godsById.includes(god)){
    TAS.warn("error","God not found.");
    return null;
  }
  return god;
}
TAS.util.Pantheon.SlotGod=function (god,slot){
  if (!Game.Objects["Temple"].minigameLoaded){
    TAS.warn("error","Pantheon minigame hasn't been unlocked yet.");
    return false;
  }
  god=TAS.util.Pantheon.getGod(god);
  if (!god) return;
  if (slot==god.slot){
    TAS.warn("info","God is already in the slot.");
    return;
  }
  if (slot!=-1&&Game.Objects["Temple"].minigame.swaps==0){
    TAS.warn("error","No swaps left.");
    return;
  }
  Game.Objects["Temple"].minigame.dragGod(god);
  Game.Objects["Temple"].minigame.hoverSlot(god.slot);
  Game.Objects["Temple"].minigame.hoverSlot(slot);
  Game.Objects["Temple"].minigame.dropGod();
  Game.Objects["Temple"].minigame.hoverSlot(-1);
}
TAS.util.RefillGrimoire=function (){
  if (!Game.Objects["Temple"].minigameLoaded){
    TAS.warn("error","Pantheon minigame hasn't been unlocked yet.");
    return;
  }
  //See minigamePantheon.js
  if (M.swaps>=3) TAS.warn("warning","Unable to refill pantheon. Swaps is full.");
  TAS.util.refillLump(1,function(){
    M.swaps=3;
    M.swapT=Date.now();
    PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
  });
}
TAS.util.Grimoire={};
TAS.util.Grimoire.ToggleMenu=function (){
  TAS.util.ToggleMinigameMenu("Wizard tower");
}
TAS.util.Grimoire.Refill=TAS.util.RefillGrimoire;
TAS.util.Grimoire.getSpell=function (spell){
  if (typeof spell=="number") spell=Game.Objects["Wizard tower"].minigame.spellsById[spell];
  if (typeof spell=="string") spell=Game.Objects["Wizard tower"].minigame.spells[spell];
  if (!spell||!Game.Objects["Wizard tower"].minigame.spellsById.includes(spell)){
    TAS.warn("error","Spell not found.");
    return null;
  }
  return spell;
}
TAS.util.Grimoire.CastSpell=function (spell){
  if (!Game.Objects["Wizard tower"].minigameLoaded){
    TAS.warn("error","Grimoire minigame hasn't been unlocked yet.");
    return;
  }
  spell=TAS.util.Grimoire.getSpell(spell);
  if (!spell) return;
  if (Game.Objects["Wizard tower"].minigame.magic<Game.Objects["Wizard tower"].minigame.getSpellCost(spell)){
    TAS.warn("error","Not enough magic.");
    return;
  }
  PlaySound('snd/tick.mp3');
  Game.Objects["Wizard tower"].minigame.castSpell(spell);
}
TAS.util.MakePlaySoundOutputToConsole=function (){
  var old=PlaySound;
  PlaySound=function(url,vol,pitchVar){
    console.log([url,vol,pitchVar]);
    old(url,vol,pitchVar);
  }
};
TAS.setup([{"time (ms)":0,"lag?":"n"},{"time (ms)":33,"lag?":"n"},{"time (ms)":Infinity,"lag?":"n"}]);
TAS.tutorial();