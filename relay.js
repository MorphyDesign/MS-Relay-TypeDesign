const testerText=document.querySelector("#tester-text");
const weightSelect=document.querySelector("#weight-select");
const sizeRange=document.querySelector("#size-range");
const trackingRange=document.querySelector("#tracking-range");
const weightOutput=document.querySelector("#weight-output");
const sizeOutput=document.querySelector("#size-output");
const trackingOutput=document.querySelector("#tracking-output");

function responsiveTypeScale(){
  return Math.min(1,Math.max(.22,window.innerWidth/1500));
}

function updateTester(){
  const testerScale=window.innerWidth>=901?1:responsiveTypeScale();
  const displaySize=Math.max(28,Number(sizeRange.value)*testerScale);
  testerText.style.fontWeight=weightSelect.value;
  testerText.style.fontSize=displaySize+"px";
  testerText.style.letterSpacing=trackingRange.value+"px";
  weightOutput.textContent=weightSelect.value;
  sizeOutput.textContent=sizeRange.value+" px";
  trackingOutput.textContent=Number(trackingRange.value)===0?"000":trackingRange.value;
}

if(window.matchMedia("(min-width: 1600px)").matches){
  sizeRange.value="190";
}
[weightSelect,sizeRange,trackingRange].forEach(control=>control.addEventListener("input",updateTester));
updateTester();

const pairTesterUpdates=[];
document.querySelectorAll(".relay-pair-unit").forEach((unit,index)=>{
  const text=unit.querySelector(".relay-pair-text");
  const size=unit.querySelector('[data-pair-control="size"]');
  const weight=unit.querySelector('[data-pair-control="weight"]');
  const tracking=unit.querySelector('[data-pair-control="tracking"]');
  const sizeValue=unit.querySelector('[data-pair-value="size"]');
  const weightValue=unit.querySelector('[data-pair-value="weight"]');
  const trackingValue=unit.querySelector('[data-pair-value="tracking"]');
  if(window.matchMedia("(min-width: 901px) and (max-width: 1599px)").matches){
    size.value="40";
    weight.value=index===0?"400":"750";
    tracking.value="0";
  }
  function updatePairTester(){
    const displaySize=Math.max(20,Number(size.value)*responsiveTypeScale());
    text.style.setProperty("--pair-size",displaySize+"px");
    text.style.setProperty("--pair-weight",weight.value);
    text.style.setProperty("--pair-tracking",tracking.value+"px");
    sizeValue.textContent=size.value+" px";
    weightValue.textContent=weight.value;
    trackingValue.textContent=tracking.value;
  }
  [size,weight,tracking].forEach(control=>control.addEventListener("input",updatePairTester));
  pairTesterUpdates.push(updatePairTester);
  updatePairTester();
});

const kerningLab=document.querySelector(".kerning-lab");
const kerningSource=document.querySelector("#kerning-source");
const kerningGlyphs=document.querySelector("#kerning-glyphs");
const kerningWeight=document.querySelector("#kerning-weight");
const kerningSize=document.querySelector("#kerning-size");
const kerningTracking=document.querySelector("#kerning-tracking");
const kerningCanvas=document.createElement("canvas");
const kerningContext=kerningCanvas.getContext("2d");

if(window.matchMedia("(min-width: 901px) and (max-width: 1599px)").matches){
  kerningSize.value="100";
}

function renderKerning(){
  const weight=Number(kerningWeight.value);
  const requestedSize=Number(kerningSize.value);
  let size=Math.max(24,requestedSize*responsiveTypeScale());
  const tracking=Number(kerningTracking.value);
  let displayTracking=tracking*responsiveTypeScale();
  document.querySelector("#kerning-weight-output").textContent=weight;
  document.querySelector("#kerning-size-output").textContent=requestedSize;
  document.querySelector("#kerning-tracking-output").textContent=tracking;
  kerningContext.font=weight+" 1000px Relay";
  kerningContext.fontKerning="normal";
  const characters=Array.from(kerningSource.value);
  const sample=characters.slice(0,10);
  const availableWidth=Math.max(1,kerningGlyphs.clientWidth*.97);
  const sampleWidth=sample.reduce((total,character)=>{
    const metrics=kerningContext.measureText(character);
    const inkWidth=(metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight)/1000*size;
    return total+Math.max(18,inkWidth+displayTracking+1);
  },0);
  if(sample.length===10&&sampleWidth>availableWidth){
    const fitScale=availableWidth/sampleWidth;
    size=Math.max(24,size*fitScale);
    displayTracking*=fitScale;
  }
  kerningLab.style.setProperty("--k-weight",weight);
  kerningLab.style.setProperty("--k-size",size);
  kerningLab.style.setProperty("--k-tracking",displayTracking);
  kerningGlyphs.replaceChildren();
  characters.forEach((character,index)=>{
    const cell=document.createElement("div");
    const value=document.createElement("span");
    const glyph=document.createElement("strong");
    cell.className="kerning-glyph";
    cell.dataset.character=character;
    value.className="kerning-glyph-value";
    glyph.className="kerning-glyph-character";
    glyph.textContent=character===" "?"·":character;
    const metrics=kerningContext.measureText(character);
    const measuredWidth=Math.round(metrics.width);
    const inkWidth=(metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight)/1000*size;
    const usesNativeSidebearings=character==="i"||character==="l";
    const width=usesNativeSidebearings
      ?Math.max(18,metrics.width/1000*size+displayTracking)
      :Math.max(18,inkWidth+displayTracking+1);
    cell.style.width=width+"px";
    const opticalShift=(metrics.width-metrics.actualBoundingBoxRight+metrics.actualBoundingBoxLeft)/2/1000*size-.5;
    glyph.style.transform=usesNativeSidebearings?"none":"translateX("+opticalShift+"px)";
    cell.dataset.inkWidth=inkWidth.toFixed(3);
    if(index>0){
      const previous=characters[index-1];
      const pairWidth=kerningContext.measureText(previous+character).width;
      const previousWidth=kerningContext.measureText(previous).width;
      const pairAdjustment=(pairWidth-previousWidth-measuredWidth)/1000*size;
      cell.style.marginLeft=pairAdjustment+"px";
    }
    value.textContent=measuredWidth;
    cell.append(value,glyph);
    kerningGlyphs.append(cell);
  });
}

[kerningSource,kerningWeight,kerningSize,kerningTracking].forEach(control=>control.addEventListener("input",renderKerning));
document.fonts.ready.then(renderKerning);

window.addEventListener("resize",()=>{
  updateTester();
  pairTesterUpdates.forEach(update=>update());
  renderKerning();
},{passive:true});

const weightLayerStage=document.querySelector(".weight-system-glyph");
const weightLayerObject=document.querySelector(".weight-layer-object");
const weightLayerLabel=document.querySelector(".weight-layer-label");
const weightLayerNames=["1000 Black","900 Heavy","800 Extrabold","700 Bold","600 Semibold","500 Medium","400 Regular","300 Light","200 Extralight","100 Thin"];

function weightLayerGroups(){
  return Array.from(weightLayerObject?.contentDocument?.querySelectorAll("svg > g")||[]);
}

function resetWeightLayers(){
  weightLayerGroups().forEach(group=>{
    group.style.opacity="";
    group.style.filter="";
  });
  if(weightLayerLabel) weightLayerLabel.textContent="Move to explore";
}

function highlightWeightLayer(event){
  const groups=weightLayerGroups();
  if(!groups.length) return;
  const bounds=weightLayerStage.getBoundingClientRect();
  const progress=Math.min(.999,Math.max(0,(event.clientX-bounds.left)/bounds.width));
  const index=Math.min(groups.length-1,Math.floor(progress*groups.length));
  groups.forEach((group,groupIndex)=>{
    group.style.opacity=groupIndex===index?".5":".055";
    group.style.filter="none";
  });
  if(weightLayerLabel) weightLayerLabel.textContent=weightLayerNames[index]||("Layer "+(index+1));
}

weightLayerStage?.addEventListener("pointermove",highlightWeightLayer);
weightLayerStage?.addEventListener("pointerleave",resetWeightLayers);

weightLayerObject?.addEventListener("load",resetWeightLayers);

const pictogramCells=document.querySelectorAll(".pictogram-grid span");

function drawGridPictogram(cell){
  const holder=cell.querySelector("b");
  const canvas=holder?.querySelector("canvas");
  if(!canvas)return;
  const bounds=holder.getBoundingClientRect();
  const pixelRatio=window.devicePixelRatio||1;
  const context=canvas.getContext("2d");
  const holderStyle=getComputedStyle(holder);
  const fontSize=parseFloat(holderStyle.fontSize);
  const fontWeight=holderStyle.fontWeight;
  canvas.width=Math.round(bounds.width*pixelRatio);
  canvas.height=Math.round(bounds.height*pixelRatio);
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  context.clearRect(0,0,bounds.width,bounds.height);
  context.font=fontWeight+' '+fontSize+'px "Relay"';
  const metrics=context.measureText(cell.dataset.symbol);
  const inkWidth=metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight;
  const inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
  const x=(bounds.width-inkWidth)/2+metrics.actualBoundingBoxLeft;
  const y=(bounds.height-inkHeight)/2+metrics.actualBoundingBoxAscent;
  const inverted=(cell.matches(":hover")&&!cell.classList.contains("is-hover-suppressed"))||cell.classList.contains("is-active");
  context.fillStyle=inverted?getComputedStyle(document.documentElement).getPropertyValue("--bg"):getComputedStyle(document.body).color;
  context.fillText(cell.dataset.symbol,x,y);
}

pictogramCells.forEach(cell=>{
  const holder=cell.querySelector("b");
  const canvas=document.createElement("canvas");
  canvas.setAttribute("aria-hidden","true");
  holder.replaceChildren(canvas);
  cell.setAttribute("aria-label",cell.dataset.symbol+" "+cell.dataset.code);
  cell.addEventListener("pointerenter",()=>drawGridPictogram(cell));
  cell.addEventListener("pointerleave",()=>{
    cell.classList.remove("is-hover-suppressed");
    drawGridPictogram(cell);
  });
  cell.addEventListener("click",()=>{
    const wasActive=cell.classList.contains("is-active");
    pictogramCells.forEach(item=>item.classList.remove("is-active"));
    if(!wasActive){
      cell.classList.remove("is-hover-suppressed");
      cell.classList.add("is-active");
    }
    else cell.classList.add("is-hover-suppressed");
    pictogramCells.forEach(drawGridPictogram);
  });
});

document.fonts.load('900 100px "Relay"').then(()=>pictogramCells.forEach(drawGridPictogram));
const pictogramObserver=new ResizeObserver(entries=>entries.forEach(entry=>drawGridPictogram(entry.target)));
pictogramCells.forEach(cell=>pictogramObserver.observe(cell));

const characterPreview=document.querySelector("#character-preview-value");
const characterCells=document.querySelectorAll(".character-grid span");
const characterUnicode=document.querySelector("#character-unicode");
const characterCodeValue=document.querySelector("#character-code-value");
const characterCanvas=document.querySelector("#character-preview-canvas");

function drawCharacter(character){
  const previewBox=characterCanvas.getBoundingClientRect();
  const capLine=document.querySelector(".metric-cap i").getBoundingClientRect();
  const baseline=document.querySelector(".metric-baseline i").getBoundingClientRect();
  const pixelRatio=window.devicePixelRatio||1;
  const context=characterCanvas.getContext("2d");

  characterCanvas.width=Math.round(previewBox.width*pixelRatio);
  characterCanvas.height=Math.round(previewBox.height*pixelRatio);
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  context.clearRect(0,0,previewBox.width,previewBox.height);
  context.font='400 1000px "Relay"';

  const referenceA=context.measureText("A");
  const capToBaseline=baseline.top-capLine.top;
  const fontSize=1000*capToBaseline/referenceA.actualBoundingBoxAscent;
  context.font='400 '+fontSize+'px "Relay"';

  const xMeasurement=context.measureText("x");
  const xLine=document.querySelector(".metric-x");
  const xLineRule=xLine.querySelector("i").getBoundingClientRect();
  const xLineBox=xLine.getBoundingClientRect();
  const ruleOffset=xLineRule.top-xLineBox.top;
  const xTop=baseline.top-previewBox.top-xMeasurement.actualBoundingBoxAscent;
  xLine.style.top=(xTop-ruleOffset)+"px";

  context.fillStyle=getComputedStyle(document.body).color;
  context.textAlign="center";
  context.textBaseline="alphabetic";
  const baseY=baseline.top-previewBox.top;
  context.fillText(character,previewBox.width/2,baseY);

  if(character==="j"){
    const pixels=context.getImageData(0,0,characterCanvas.width,characterCanvas.height);
    const occupiedRows=[];
    for(let row=0;row<characterCanvas.height;row+=1){
      let occupied=false;
      for(let column=0;column<characterCanvas.width;column+=1){
        if(pixels.data[(row*characterCanvas.width+column)*4+3]>24){
          occupied=true;
          break;
        }
      }
      if(occupied) occupiedRows.push(row);
    }

    const rowRuns=[];
    occupiedRows.forEach(row=>{
      const current=rowRuns[rowRuns.length-1];
      if(!current||row>current[1]+1) rowRuns.push([row,row]);
      else current[1]=row;
    });

    if(rowRuns.length>1){
      const separated=context.createImageData(characterCanvas.width,characterCanvas.height);
      const iDotTop=Math.round((baseY-context.measureText("i").actualBoundingBoxAscent)*pixelRatio);
      const xHeightTop=Math.round(xTop*pixelRatio);

      const copyRows=(start,end,offset)=>{
        for(let sourceRow=start;sourceRow<=end;sourceRow+=1){
          const targetRow=sourceRow+offset;
          if(targetRow<0||targetRow>=characterCanvas.height) continue;
          const sourceStart=sourceRow*characterCanvas.width*4;
          const sourceEnd=sourceStart+characterCanvas.width*4;
          separated.data.set(pixels.data.subarray(sourceStart,sourceEnd),targetRow*characterCanvas.width*4);
        }
      };

      copyRows(rowRuns[0][0],rowRuns[0][1],iDotTop-rowRuns[0][0]);
      copyRows(rowRuns[1][0],rowRuns[rowRuns.length-1][1],xHeightTop-rowRuns[1][0]);
      context.clearRect(0,0,previewBox.width,previewBox.height);
      context.putImageData(separated,0,0);
    }
  }
}

function selectCharacter(cell){
  characterCells.forEach(item=>item.classList.remove("is-selected"));
  cell.classList.add("is-selected");
  characterPreview.textContent=cell.textContent;
  drawCharacter(cell.textContent);
  characterCodeValue.textContent=cell.textContent;
  characterUnicode.textContent="U+"+cell.textContent.codePointAt(0).toString(16).toUpperCase().padStart(4,"0");
}

characterCells.forEach(cell=>{
  cell.tabIndex=0;
  cell.addEventListener("mouseenter",()=>selectCharacter(cell));
  cell.addEventListener("focus",()=>selectCharacter(cell));
  cell.addEventListener("click",()=>selectCharacter(cell));
});

if(characterCells.length){
  document.fonts.load('400 100px "Relay"').then(()=>{
    selectCharacter(characterCells[0]);
  });
}
window.addEventListener("resize",()=>drawCharacter(characterPreview.textContent));

const enclosedGlyphs=document.querySelectorAll(".enclosed-glyph");

function drawEnclosedGlyph(container){
  const canvas=container.querySelector("canvas");
  if(!canvas)return;
  const bounds=container.getBoundingClientRect();
  const pixelRatio=window.devicePixelRatio||1;
  const context=canvas.getContext("2d");
  const fontSize=parseFloat(getComputedStyle(container).fontSize);
  canvas.width=Math.round(bounds.width*pixelRatio);
  canvas.height=Math.round(bounds.height*pixelRatio);
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  context.clearRect(0,0,bounds.width,bounds.height);
  context.font='900 '+fontSize+'px "Relay"';
  const metrics=context.measureText(container.dataset.glyph);
  const inkWidth=metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight;
  const inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
  const x=(bounds.width-inkWidth)/2+metrics.actualBoundingBoxLeft;
  const y=(bounds.height-inkHeight)/2+metrics.actualBoundingBoxAscent;
  context.fillStyle=getComputedStyle(container).color;
  context.fillText(container.dataset.glyph,x,y);
}

enclosedGlyphs.forEach(container=>{
  container.dataset.glyph=container.textContent.trim();
  container.setAttribute("aria-label",container.dataset.glyph);
  const canvas=document.createElement("canvas");
  canvas.setAttribute("aria-hidden","true");
  container.replaceChildren(canvas);
});

document.fonts.load('900 100px "Relay"').then(()=>{
  enclosedGlyphs.forEach(drawEnclosedGlyph);
});

const enclosedObserver=new ResizeObserver(entries=>{
  entries.forEach(entry=>drawEnclosedGlyph(entry.target));
});
enclosedGlyphs.forEach(glyph=>enclosedObserver.observe(glyph));

const relayCycle=document.querySelector(".relay-pictogram-cycle");
const relayCycleSymbol=document.querySelector("#relay-cycle-symbol");
const relayCycleCode=document.querySelector("#relay-cycle-code");
const relayCycleGlyphs=[
  ["\uE02E","U+E02E"],["\uE008","U+E008"],["\uE02C","U+E02C"],["↑","U+2191"],
  ["❷","U+2777"],["\uE02D","U+E02D"],["④","U+2463"],["\uE014","U+E014"],
  ["🅖","U+1F156"],["\uE02F","U+E02F"],["↗","U+2197"],["⮊","U+2B8A"]
];
let relayCycleIndex=0;

function advanceRelayPictogram(){
  if(!relayCycle)return;
  relayCycle.classList.add("is-changing");
  window.setTimeout(()=>{
    relayCycleIndex=(relayCycleIndex+1)%relayCycleGlyphs.length;
    const [symbol,code]=relayCycleGlyphs[relayCycleIndex];
    relayCycleSymbol.textContent=symbol;
    relayCycleCode.textContent=code;
    relayCycle.classList.remove("is-changing");
  },200);
}

window.setInterval(advanceRelayPictogram,1800);

const relayWeightStudy=document.querySelector(".relay-layered-r");
const relayWeightButtons=document.querySelectorAll("[data-r-weight]");

function setRelayStudyWeight(button){
  relayWeightStudy.style.fontWeight=button.dataset.rWeight;
  relayWeightButtons.forEach(item=>{
    const active=item===button;
    item.classList.toggle("is-active",active);
    item.setAttribute("aria-pressed",String(active));
  });
}

relayWeightButtons.forEach(button=>{
  button.addEventListener("pointerenter",()=>setRelayStudyWeight(button));
  button.addEventListener("focus",()=>setRelayStudyWeight(button));
  button.addEventListener("click",()=>setRelayStudyWeight(button));
});

relayWeightStudy.addEventListener("pointermove",event=>{
  const bounds=relayWeightStudy.getBoundingClientRect();
  const position=Math.max(0,Math.min(.999,(event.clientX-bounds.left)/bounds.width));
  const button=relayWeightButtons[Math.floor(position*relayWeightButtons.length)];
  if(button)setRelayStudyWeight(button);
});

const initialRelayWeightButton=document.querySelector("[data-r-weight].is-active")||relayWeightButtons[relayWeightButtons.length-1];
if(initialRelayWeightButton)setRelayStudyWeight(initialRelayWeightButton);

const relayArrowCanvas=document.querySelector("#relay-rotating-arrow-canvas");

function drawCenteredRelayArrow(){
  if(!relayArrowCanvas)return;
  const cssSize=parseFloat(getComputedStyle(relayArrowCanvas).width);
  const pixelRatio=window.devicePixelRatio||1;
  relayArrowCanvas.width=Math.round(cssSize*pixelRatio);
  relayArrowCanvas.height=Math.round(cssSize*pixelRatio);
  const context=relayArrowCanvas.getContext("2d");
  context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  context.clearRect(0,0,cssSize,cssSize);
  const fontSize=cssSize*1.01;
  context.font="900 "+fontSize+'px "Relay"';
  const metrics=context.measureText("⮉");
  const inkWidth=metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight;
  const inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
  const x=(cssSize-inkWidth)/2+metrics.actualBoundingBoxLeft;
  const y=(cssSize-inkHeight)/2+metrics.actualBoundingBoxAscent;
  context.fillStyle=getComputedStyle(document.body).color;
  context.fillText("⮉",x,y);
}

document.fonts.load('900 100px "Relay"').then(drawCenteredRelayArrow);
window.addEventListener("resize",drawCenteredRelayArrow);

document.querySelectorAll(".wayfinding-copy").forEach(section=>{
  const walker=document.createTreeWalker(section,NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(node=>{
    node.nodeValue=node.nodeValue.replace(/fi/gi,match=>match[0]+"\u200C"+match.slice(1));
  });
});

const systemAlignmentLines=document.querySelectorAll(".system-alignment-display>div");

function fitSystemAlignmentLines(){
  systemAlignmentLines.forEach(line=>{
    const text=line.querySelector("span");
    if(!text)return;
    text.style.transform="none";
    text.style.fontSize="";
    const available=line.getBoundingClientRect().width;
    if(!available)return;
    let low=12;
    let high=180;
    for(let step=0;step<14;step++){
      const size=(low+high)/2;
      text.style.fontSize=`${size}px`;
      if(text.getBoundingClientRect().width<=available)low=size;
      else high=size;
    }
    text.style.fontSize=`${low}px`;
  });
}

document.fonts.ready.then(fitSystemAlignmentLines);
window.addEventListener("resize",fitSystemAlignmentLines);

const departureStage=document.querySelector(".departure-stage");
const departureStageInner=document.querySelector(".departure-stage-inner");

function scaleDepartureStage(){
  if(!departureStage||!departureStageInner)return;
  const scale=Math.min(1,departureStage.clientWidth/1080);
  departureStage.style.setProperty("--departure-stage-scale",String(scale));
  departureStage.style.height=`${departureStageInner.offsetHeight*scale}px`;
}

if(departureStage&&departureStageInner){
  new ResizeObserver(scaleDepartureStage).observe(departureStage);
  document.fonts.ready.then(scaleDepartureStage);
  window.addEventListener("resize",scaleDepartureStage);
  scaleDepartureStage();
}

const departureClock=document.querySelector(".departure-clock");

if(departureClock){
  const clockSeconds=departureClock.querySelector("sup");
  const clockStart=Date.now();
  let lastDisplayedSecond=-1;

  function updateDepartureClock(){
    const elapsedSeconds=Math.floor((Date.now()-clockStart)/1000);
    if(elapsedSeconds===lastDisplayedSecond)return;
    lastDisplayedSecond=elapsedSeconds;
    const seconds=elapsedSeconds%60;
    const main="23:33";
    const secondText=String(seconds).padStart(2,"0");
    clockSeconds.textContent=secondText;
    departureClock.dateTime=`${main}:${secondText}`;
  }

  updateDepartureClock();
  window.setInterval(updateDepartureClock,250);
}

const departureStopLists=[
  {
    element:document.querySelector(".departure-panel-primary .departure-stops"),
    pages:[
      [
        ["Farringdon",true],
        ["London Blackfriars",true],
        ["London Bridge",true],
        ["Norwood Junction",false],
        ["East Croydon",false],
        ["Purley",false],
        ["Redhill",false],
        ["Earlswood Surrey",false],
        ["Salfords",false],
        ["Horley",false]
      ],
      [
        ["Gatwick Airport",false,false,"\uE02F"],
        ["Three Bridges",false],
        ["Crawley",false],
        ["Ifield",false,true],
        ["Littlehaven",false],
        ["Horsham",false]
      ]
    ]
  },
  {
    element:document.querySelector(".departure-panel-secondary .departure-stops"),
    pages:[
      [
        ["Farringdon",true],
        ["London Blackfriars",true],
        ["Elephant & Castle",true],
        ["Loughborough Jcn",false],
        ["Herne Hill",false],
        ["Tulse Hill",false],
        ["Streatham",false],
        ["Tooting",false],
        ["Haydons Road",false],
        ["Wimbledon",true]
      ],
      [
        ["Wimbledon Chase",false],
        ["South Merton",false],
        ["Morden South",false],
        ["St Helier",false],
        ["Sutton Common",false],
        ["West Sutton",false],
        ["Sutton",false]
      ]
    ]
  }
];

function renderDepartureStopPage(list,page){
  if(!list.element)return;
  list.element.replaceChildren(...list.pages[page].map(([name,hasMetro,noLigatures,extraIcon])=>{
    const item=document.createElement("li");
    if(noLigatures)item.classList.add("no-ligatures");
    item.append(document.createTextNode(name));
    if(hasMetro){
      const metro=document.createElement("span");
      metro.className="departure-metro-logo";
      metro.setAttribute("aria-label","Metro");
      metro.textContent="\uE02D";
      item.append(" ",metro);
    }
    if(extraIcon){
      const icon=document.createElement("span");
      icon.className="departure-metro-logo departure-airport-logo";
      icon.setAttribute("aria-label","icon.airport");
      icon.dataset.iconName="icon.airport";
      icon.textContent=extraIcon;
      item.append(" ",icon);
    }
    return item;
  }));
}

if(departureStopLists.every(list=>list.element)){
  let departureStopPage=0;
  const departurePageLabels=document.querySelectorAll(".departure-page-label");
  departureStopLists.forEach(list=>renderDepartureStopPage(list,departureStopPage));
  departurePageLabels.forEach(label=>{label.textContent="Page 1 of 4";});
  window.setInterval(()=>{
    departureStopPage=departureStopPage===0?1:0;
    departureStopLists.forEach(list=>renderDepartureStopPage(list,departureStopPage));
    departurePageLabels.forEach(label=>{label.textContent=`Page ${departureStopPage+1} of 4`;});
  },3000);
}

document.querySelectorAll(".portfolio-name-typewriter[data-typewriter-text]").forEach((typewriterText)=>{
  const fullTypewriterText=window.matchMedia("(max-width: 650px)").matches
    ? (typewriterText.dataset.typewriterMobile||typewriterText.dataset.typewriterText)
    : (typewriterText.dataset.typewriterDesktop||typewriterText.dataset.typewriterText);
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reducedMotion)return;

  let typewriterPosition=0;
  let correctionIndex=0;
  const correctionPoints=[
    Math.max(4,Math.round(fullTypewriterText.length*.38))
  ];
  const typoFragments=["Desg"];
  typewriterText.textContent="";

  function typeForward(){
    typewriterPosition+=1;
    typewriterText.textContent=fullTypewriterText.slice(0,typewriterPosition);
    if(correctionIndex<correctionPoints.length&&typewriterPosition===correctionPoints[correctionIndex]){
      const typo=typoFragments[correctionIndex];
      correctionIndex+=1;
      window.setTimeout(()=>typeTypo(typo,1),120);
      return;
    }
    if(typewriterPosition<fullTypewriterText.length){
      window.setTimeout(typeForward,50+Math.random()*55);
    }else{
      window.setTimeout(eraseAll,1200);
    }
  }

  function typeTypo(typo,typedLength){
    typewriterText.textContent=fullTypewriterText.slice(0,typewriterPosition)+typo.slice(0,typedLength);
    if(typedLength<typo.length){
      window.setTimeout(()=>typeTypo(typo,typedLength+1),60+Math.random()*30);
    }else{
      window.setTimeout(()=>eraseTypo(typo,typo.length),220);
    }
  }

  function eraseTypo(typo,remaining){
    typewriterText.textContent=fullTypewriterText.slice(0,typewriterPosition)+typo.slice(0,remaining-1);
    if(remaining>1){
      window.setTimeout(()=>eraseTypo(typo,remaining-1),50);
    }else{
      window.setTimeout(typeForward,180);
    }
  }

  function eraseAll(){
    typewriterPosition-=1;
    typewriterText.textContent=fullTypewriterText.slice(0,typewriterPosition);
    if(typewriterPosition>0){
      window.setTimeout(eraseAll,28);
    }else{
      correctionIndex=0;
      window.setTimeout(typeForward,450);
    }
  }

  window.setTimeout(typeForward,350);
});

function updateNumeralMetrics(){
  document.querySelectorAll(".numeral-study-row").forEach((row)=>{
    const numerals=row.querySelector("p");
    const label=row.querySelector("[data-numeral-metrics]");
    if(!numerals||!label)return;
    const styles=getComputedStyle(numerals);
    const size=Math.round(parseFloat(styles.fontSize)*.75);
    const leading=Math.round(parseFloat(styles.lineHeight)*.75);
    label.textContent=`${size}/${leading} pt`;
  });
}

updateNumeralMetrics();
window.addEventListener("resize",updateNumeralMetrics,{passive:true});

document.querySelectorAll(".numeral-study-rows").forEach((numeralStudy)=>{
  const rows=[...numeralStudy.querySelectorAll(".numeral-study-row p")];
  const cells=rows.flatMap((row,rowIndex)=>{
    const numerals=[...row.querySelectorAll("b")];
    return numerals.map((numeral,columnIndex)=>({
      numeral,
      rowIndex,
      x:numerals.length>1?(columnIndex/(numerals.length-1))*8:0
    }));
  });
  const resetWeights=()=>cells.forEach(({numeral})=>{numeral.style.fontWeight="100";});
  const applyWeightField=(activeCell)=>{
    cells.forEach((cell)=>{
      const horizontalDistance=cell.x-activeCell.x;
      const verticalDistance=cell.rowIndex-activeCell.rowIndex;
      const distance=Math.hypot(horizontalDistance,verticalDistance);
      cell.numeral.style.fontWeight=distance<.1?"900":distance<=1.1?"700":distance<=2.1?"400":"300";
    });
  };
  cells.forEach((cell)=>{
    cell.numeral.tabIndex=0;
    cell.numeral.addEventListener("pointerenter",()=>applyWeightField(cell));
    cell.numeral.addEventListener("focus",()=>applyWeightField(cell));
  });
  numeralStudy.addEventListener("pointerleave",resetWeights);
  numeralStudy.addEventListener("focusout",(event)=>{
    if(!numeralStudy.contains(event.relatedTarget))resetWeights();
  });
});
