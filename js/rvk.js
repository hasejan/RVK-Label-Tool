'use strict';

let textarea = document.getElementById('signatures');
let body = document.getElementById('body');
let date = document.getElementById('date');
let dateLoading = document.getElementById('dateLoading');
let printLabelHeader = document.getElementById('printLabelHeader');

// preloading some items
let d = new Date();

// Sunday - Saturday : 0 - 6, just load a workday
if (d.getDay() === 0)
  d = new Date(d.getTime() - 2 * 24 * 60 * 60 * 1000);
else if(d.getDay() === 6)
  d = new Date(d.getTime() - 1 * 24 * 60 * 60 * 1000);

// finally set the date to the input field
// as on https://stackoverflow.com/questions/6982692/html5-input-type-date-default-value-to-today
date.valueAsDate = d;
 
loadSignaturesForDate();

date.onchange = loadSignaturesForDate;

// preset the checkbox to prevent caching
printLabelHeader.checked = true;

// testmode prints 1mm wide columns to check page size
let test = false;
function getMeasureArea(){
  let area = document.createElement('div');
  area.id = "mm";
  for (let i = 1 ; i <= 210; i++)
    area.innerHTML += '<div class="mm" data-count="'+i+'"></div>';
  return area;
}

// add a blank sheet
let actSheet = addSheet();

// regex to test and split signatures/call numbers
/*
 * [
  "ST 510 S05 H798 W2(2)+1",
  "ST",
  "510",
  "S05",
  null,
  null,
  " H798 W2(2)",
  " H798",
  " W2",
  "(2)",
  null,
  "+1"
]
 */
const RVK = /^(\w{2})\s(\d{3,5})\s(\w{1,2}\d{2,5}(\(\d{1,3}\))?(\-\d{1,2})?)((\s\w{1,2}\d{2,5})?(\s\w{1}\d{1,2})?(\(\d\))?(\-\d{1,2})?)(\+\d{1,3})?(\sLBS)?$/;
//             ST    _   25021  _  AB      23456    (123)?          -12?      _AB23456?           _A12?            (1)?    -12?            +123?    _LBS?
//                                (                                        )(                                                         )   

// empty tag 
const DUMMY =  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "]; 

let signatures = [];//["ST 110 B673(2)+2","ST 510 S05 H798 W2(2)+1","ST 250 J35 H819 C7-1","ST 250 J35 H819 C27(6)-1+3","ST 250 J35(2)+1"];
//"signatures" : ["ST250J678M345(1)-1+1" ,"PN219H176","PN219H176+1","PN219H176+2","PN219H176+3","PN219H176+4","PN219H176+1","PN219H176+5","PN219H176+6","ST250H123(2)+2","ST250H123Q132(2)+2","PN219H176","PN219H176+1","PN219H176+2","PN219H176+3","PN219H176+4","PN219H176+1","PN219H176+5","PN219H176+6","ST250H123(2)+2","ST250H123Q132(2)+2","PN219H176","PN219H176+1","PN219H176+2","PN219H176+3","PN219H176+4","PN219H176+1","PN219H176+5","PN219H176+6","ST250H123(2)+2","ST250H123Q132(2)+2"]

// enable draggable menu
addDrag();

/**
 * adds a new sheet and returns node
 * @returns {undefined}
 */ 
function addSheet() {
  
  let sheet = document.createElement("section");
  sheet.className = "sheet label-area sheet-" + document.querySelectorAll('.sheet').length;
  
  if (test)
    sheet.appendChild(getMeasureArea());
  
  document.getElementById('body').appendChild(sheet);
  return sheet;
}

/**
 * adds a dummy label, with empty rows
 * @returns {undefined}
 */
function createDummy(){
  let label = createLabel( DUMMY );
  appendLabel(label);
}

/**
 * create labels from textarea
 * @returns {undefined}
 */
function createFromTextarea() {
  // get signatures from textarea 
  signatures = textarea.value.split("\n");
  
  // add a \n to the last line in order to replace a hit with an empty line
  if (textarea.value.charCodeAt(textarea.value.length -1) !== 10)
    textarea.value += "\n";
  
  for (let i = 0; i < signatures.length; i++) {
        
    let sign = signatures[i].trim();
    console.log(sign, RVK.test(sign), RVK.exec(sign));
    
    let label;
    
    if (RVK.test(sign)){
      label = createLabel( RVK.exec(sign) );
      
      // replace the signature in textarea by ""
      textarea.value = textarea.value.replace(sign+"\n","");
      appendLabel(label);
    } 
      
  }
  
  // replace all line breaks afterwards
  textarea.value = textarea.value.replace(/^\n/gm,"");
}

/**
 * appends a label to a sheet
 * @param {type} label
 * @returns {undefined}
 */
function appendLabel(label){
  actSheet = body.lastElementChild;
  
  if (actSheet.childNodes.length >= 25)
    actSheet = addSheet();
  
  actSheet.appendChild(label);
}

/**
 * creates a label component by a given array
 * d = [ "ST 510 S05 H798 W2(2)+1", "ST", "510", "S05", undefined, undefined, " H798 W2(2)", " H798", " W2", "(2)", … ]
 * @param {type} d
 * @returns {Element|createLabel.label}
 */
function createLabel(d) {
  
  let label = document.createElement("div");
  //label.className = d[11] === "+2" ? "label vertical" : "label horizontal";
  label.className = "label horizontal";

  label.appendChild(getRotateButton());
  label.appendChild(getDeleteButton());

  let lineNo = 3;

  let line = document.createElement("div");
  line.className = "th blue";
  line.appendChild(document.createTextNode("TH Wildau Hochschulbibliothek"));
  
  label.appendChild(line);

  let sign = document.createElement("div");
  sign.className = "signature";

  line = document.createElement("span");
  line.className = "bold line l1";
  line.appendChild(document.createTextNode(d[1]));
  line.contentEditable = true;
  sign.appendChild(line);

  line = document.createElement("span");
  line.className = "bold line l2";
  line.appendChild(document.createTextNode(d[2]));
  line.contentEditable = true;
  sign.appendChild(line);

  line = document.createElement("span");
  line.className = "bold line l3";
  line.appendChild(document.createTextNode(d[3]));
  line.contentEditable = true;
  sign.appendChild(line);

  if (typeof d[6] !== "undefined" && d[6] !== "") {
    lineNo++;
    line = document.createElement("span");
    line.className = "line l" + lineNo;
    line.appendChild(document.createTextNode(d[6]));
    line.contentEditable = true;
    sign.appendChild(line);
  }

  if (typeof d[11] !== "undefined") {
    lineNo++;
    line = document.createElement("span");
    line.className = "line l" + lineNo;
    line.appendChild(document.createTextNode(d[11]));
    line.contentEditable = true;
    sign.appendChild(line);
  }
  
  label.appendChild(sign);
  label.onclick = onLablelClick;
  return label;

}

/**
 * 
 * @returns {Element|getRotateButton.button}
 */
function getRotateButton(){
  let button = document.createElement('a');
  button.className = "rotate-button no-print";
  button.value = "rotate";
  button.title = "Drehen";
  button.appendChild(document.createTextNode("↻"));
  return button;
}

/**
 * 
 * @returns {getDeleteButton.button|Element}
 */
function getDeleteButton(){
  let button = document.createElement('a');
  button.className = "delete-button no-print";
  button.value = "delete";
  button.title = "Löschen";
  button.appendChild(document.createTextNode("×"));
  return button;
}

/**
 * 
 * @param {type} e
 * @returns {undefined}
 */
function onLablelClick(e){
  
  if (e.target.value === "rotate"){
    //console.log(this.classList)
    //temp = this;
    if (this.classList.contains("vertical")){
      this.classList.remove("vertical");
      this.classList.add("horizontal");
    } else {
      this.classList.remove("horizontal");
      this.classList.add("vertical");
    }
  }
  
  if (e.target.value === "delete"){
    removeLabel(this);
  }
    
}

/**
 * remove a label by click 
 * @param {type} label
 * @returns {undefined}
 */
function removeLabel(label){
  label.parentNode.removeChild(label);
  // jetzt kommt das paafyll
  hochrutschen();
}

/**
 * fills up gaps after a label has been deleted
 * @returns {undefined}
 */
function hochrutschen(){
  document.querySelectorAll(".sheet").forEach( sheet => { 
    while (sheet.children.length < 25 && sheet.nextElementSibling !== null && sheet.nextElementSibling.firstElementChild !== null){
      // append the first child from the next sheet
      sheet.appendChild(sheet.nextElementSibling.firstElementChild); 
    }
    if (sheet.children.length === 0 && body.querySelectorAll('.sheet').length > 1){
      sheet.parentNode.removeChild(sheet);
    }
  });
}

/**
 * 
 * @param {type} event
 * @returns {undefined}
 */
window.onbeforeprint = function(event) { 
  checkPrintLabelHeader();
};

/**
 * polyfill for safari
 * @type MediaQueryList
 */
var mediaQueryList = window.matchMedia('print');
mediaQueryList.addListener(function(mql) {
  if(mql.matches) {
    checkPrintLabelHeader();
  }
});

/**
 * adds or removes a flag whether to print the library banner on the label or not
 * @returns {undefined}
 */
function checkPrintLabelHeader(){
  
  document.querySelectorAll('.th').forEach( lh => { 
    if (printLabelHeader.checked)
      lh.classList.remove("no-print");
    else
      lh.classList.add("no-print");
  });
}

/**
 * loads signatures from db
 * @returns {undefined}
 */
function loadSignaturesForDate(){
  if (date.value === "")
    return false;
  
  date.disabled = true;
  dateLoading.classList.add("loading");
  fetch( dataURL + date.value )
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    dateLoading.classList.remove("loading");
    date.disabled = false;
    if (data.signatures){
      textarea.value = data.signatures.length > 0 ? data.signatures.join("\n") : "";
    }    
  });
}

/**
 * enables dragging of menu
 * @returns {addDrag}
 */
function addDrag(){
  let drag = false;
  let dX = 0;
  let dY = 0;
  
  let draggable = document.getElementById('draggable');
  let signaturesContainer = document.getElementById('signaturesContainer');

  draggable.onmousedown = dragStart;
  //draggable.onmouseup = moveEnd;
  //body.onmousemove = moving;

  function dragStart(e){
    e.preventDefault();
    drag = { 
      x : e.clientX, 
      y : e.clientY, 
      oX : signaturesContainer.offsetLeft, 
      oY : signaturesContainer.offsetTop 
    };
    document.onmouseup = dragEnd;
    document.onmousemove = dragging;
  }

  function dragging(e){
    e.preventDefault();
    if (drag){
      //console.log(e);
      dX = e.clientX - drag.x;
      dY = e.clientY - drag.y;

      let newX = drag.oX + dX;
      let newY = drag.oY + dY;

      signaturesContainer.style.left = newX + "px";
      signaturesContainer.style.top = newY + "px";
      
    }

  }

  function dragEnd(e){
    drag = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }

}