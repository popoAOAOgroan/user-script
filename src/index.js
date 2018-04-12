/* jshint asi:true */
// ==UserScript==
// @name         niuniu test
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *
// @include      *
// @grant        none

// ==/UserScript==

// todo
// 1. 自动翻译
// 2. 点击展示详细
// 3. 保存至生词？
// 4. 解决Content-Security-Policy

// Set endpoints
const endpoints = {
  translate: "",
  detect: "detect",
  languages: "languages"
};
const DefaultOpts = {
  method: 'GET',
  headers: {
    'content-type': 'application/json',
    'Accept': 'application/json',
    'Content-Security-Policy:': 'none'
  },
  // mode: 'no-cors',
  credentials: 'include'
};
const API_KEY = "AIzaSyAqrwjQNr_tiAPb0-dkOmKmZ760q3TVMaQ";
function apiRequest (url, opts) {
  // Return response from API
  // return $.ajax({
  //   url: url,
  //   type: opts.method,
  //   // data: data ? JSON.stringify(data) : "",
  //   // dataType: "json",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Accept: "application/json"
  //   }
  // });

  return new Promise(function(res, rej){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if(this.status == 200) {
            // Typical action to be performed when the document is ready:
            res(JSON.parse(xhttp.responseText));
          }else{
            console.log(xhttp);
            rej(xhttp.responseText);
          }
        }
    };
    xhttp.open(opts.method, url, true);
    xhttp.send();
  })

  // return fetch(url, {method: opts.method});
};

(function() {
  'use strict';
  let currentSelectText = '';
  let saveBtn = null;
  let resultBox = null;
  
  addWrapperToHTML();
  // <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://www.google.com">
  // document.onload = function() {
  //   $('meta[http-equiv=Content-Security-Policy]').remove();
  //   $('head').append( "<meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googleapis.com">" );
  // }

  function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      (activeElTagName == "textarea") || (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
      (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
  }

  document.onselectionchange = function() {
    currentSelectText = getSelectionText();
  };
  document.onmouseup = function(e) {
    if(currentSelectText !== '') {
      const {clientX, clientY} = e;
      hideResultBox();
      showSaveBtn(clientX, clientY);
    }else{
      hideSaveBtn();
      hideResultBox();
    }
  };
  document.onscroll = function() {
    hideSaveBtn();
    hideResultBox();
  }

  // Abstract API request function
  function makeApiRequest(endpoint, data, type) {
    let url = "https://www.googleapis.com/language/translate/v2/" + endpoint;
    url += "?key=" + API_KEY;

    // If not listing languages, send text to translate
    if (endpoint !== endpoints.languages) {
      url += "&q=" + encodeURI(data.textToTranslate);
    }

    // If translating, send target and source languages
    if (endpoint === endpoints.translate) {
      url += "&target=" + data.targetLang;
      url += "&source=" + data.sourceLang;
    }

    // Return response from API
    return apiRequest(url, Object.assign({}, DefaultOpts, {method: type}));
  }
  // Translate
  function translate(data, cb) {
    let translation = 'no result';
    makeApiRequest(endpoints.translate, data, "GET").then(res=>{
      if(res && res.data) {
        let translations = res.data.translations;
        translation = translations.length ? translations[0].translatedText : 'no result';
      }
      cb && cb(translation);
    },err=>{
      translation = err || 'err';
      cb && cb(translation);
    });
  }

  // get select text
  function handleSaveText() {
    // translate
    const {x, y} = saveBtn.getBoundingClientRect();
    showResultBox(x, y);
    hideSaveBtn();
    resultBox.innerHTML = 'processing..';
    const res = translate({
      sourceLang: 'en',
      targetLang: 'zh',
      textToTranslate: currentSelectText
    }, function(res) {
      resultBox.innerHTML = res;
    });
  }
  function showSaveBtn(x, y) {
    saveBtn.style.display = 'block';
    saveBtn.style.top = `${y}px`;
    saveBtn.style.left = `${x}px`;
  }
  function hideSaveBtn() {
    saveBtn.style.display = 'none';
  }
  function showResultBox(x, y) {
    resultBox.style.display = 'block';
    resultBox.style.top = `${y}px`;
    resultBox.style.left = `${x}px`;
  }
  function hideResultBox() {
    resultBox.style.display = 'none';
  }
  function addWrapperToHTML() {
    const body = document.getElementsByTagName('body')[0];
    body.innerHTML += getSaveBtn();
    body.innerHTML += getTransResultBox();

    saveBtn = document.getElementById('niuSave');
    saveBtn.addEventListener('click', handleSaveText);
    resultBox = document.getElementById('niuResult');
  }
  function getSaveBtn() {
    return '<button id="niuSave" type="button" style=" \
      display:none; \
      position: fixed; \
      z-index: 999; \
    ">翻译</button>';
  }
  function getTransResultBox() {
    return '<div id="niuResult" type="button" style=" \
      display:none; \
      position: fixed; \
      z-index: 999; \
      background: rgba(255, 255, 255, .9); \
      border: 1px solid #f1f1f1; \
      padding: 5px 10px; \
      box-shadow: 1px 1px 1px rgba(0,0,0, .8); \
      max-width: 300px; \
    ">?</div>';
  }
})();
