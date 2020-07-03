"use strict";

// const nunjucks = require('nunjucks');
// const html5Boilerplate = require('_includes/extends/html5boilerplate.njk');
// console.log(nunjucks.render('/src/_includes/extends/html5boilerplate.njk'))

require('./_splittype.js');

document.documentElement.classList.remove('no-js');

let heroSplit;
let projectsSplit;

window.addEventListener('DOMContentLoaded', ()=>{
  let heroSplit = new SplitType('.home-hero__title', { split: 'lines', tagName: 'span' });
  // let heroLinkSplit = new SplitType('.home-hero__link', { split: 'lines', tagName: 'span' });
  let projectsSplit = new SplitType('.project__title', { split: 'lines', tagName: 'span' });
  document.documentElement.classList.add('ready');
});

// window.addEventListener('resize', ()=>{
//   if(heroSplit) {
//     heroSplit.revert();
//   }
//   if(projectsSplit) {
//     projectsSplit.revert();
//   }
//
//   new SplitType('.home-hero__title', { split: 'lines', tagName: 'span' });
//   new SplitType('.project__title', { split: 'lines', tagName: 'span' });
// });