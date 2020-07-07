const path = require('path');
const svgContents = require("eleventy-plugin-svg-contents");
const { JSDOM } = require('jsdom');

module.exports = function(eleventyConfig) {

  // Shortcodes
  eleventyConfig.addShortcode('excerpt', article => extractExcerpt(article));

  // Plugins
  // eleventyConfig.addPlugin( pluginSrcsetImg );
  eleventyConfig.addPlugin(svgContents);

  // Copy files
  eleventyConfig.addPassthroughCopy('./src/admin');
  eleventyConfig.addPassthroughCopy('./src/assets');
  eleventyConfig.addPassthroughCopy('./src/uploads');
  eleventyConfig.addPassthroughCopy({ "./src/_favicons/**/*": "./" });

  // Collections
  eleventyConfig.addCollection('posts', collection => {
    return collection.getFilteredByGlob('./src/posts/*.md');
  });

  // Categories
  eleventyConfig.addCollection('tags', collection => {
    return collection.getFilteredByGlob('./src/tags/*.md').sort(function(a, b) {
      return Number(b.data.order || 0) - Number(a.data.order || 0);
    });
  });

  eleventyConfig.addCollection('tips', collection => {
    return collection.getFilteredByGlob('./src/tips/*.md');
  });

  eleventyConfig.addCollection('pipeline', collection => {
    return collection.getFilteredByGlob('./src/pipeline/*.md');
  });

  eleventyConfig.addCollection('pages', collection => {
    return collection.getFilteredByGlob('./src/pages/*.md');
  });

  eleventyConfig.addLayoutAlias('supporters', 'partials/supporters.html');


  eleventyConfig.addFilter('where', function (array, key, value) {
    return array.filter(item => {
      const keys = key.split('.');
      const reducedKey = keys.reduce((object, key) => {
        return object[key];
      }, item);

      return (reducedKey === value ? item : false);
    });

  });

  eleventyConfig.addFilter('whereContains', function (array, key, value) {
    return array.filter(item => {
      const keys = key.split('.');
      const reducedKey = keys.reduce((object, key) => {
        return object[key];
      }, item);

      return (reducedKey.indexOf(value) == -1 ? false : item);
    });
  });

  eleventyConfig.addNunjucksFilter("limit", function(arr, limit) {
    return arr.slice(0, limit);
  });

  eleventyConfig.addNunjucksFilter("slice", function(arr, start, end) {
    return arr.slice(start, end);
  });


  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    root: [
      '_includes',
      '.'
    ]
  });

  const md = require('markdown-it')({
      html: false,
      breaks: true,
      linkify: true
  });

  eleventyConfig.addNunjucksFilter("markdownify", markdownString => md.render(markdownString));


  eleventyConfig.cloudinary = 'letsdance';
  eleventyConfig.srcsetWidths = [ 320, 540, 960, 1280, 1600, 1920, 2240, 2560 ];
  eleventyConfig.autoselector = '.page-body img';
  eleventyConfig.fallbackWidth = 540;

  const createMarkup = (path, alt, className, width, height, sizes, resize) => {
    const src = `//res.cloudinary.com/${ eleventyConfig.cloudinary }/image/fetch/${ width ? 'w_' + width : '' }${ height ? ',h_' + height : '' }${(height && width) ? (',' + (resize || 'c_fill')) : ''},f_auto,q_80/${process.env.URL + path.split(" ").join("%20")}`;
    const srcset = eleventyConfig.srcsetWidths.map(w => {
      return `//res.cloudinary.com/${ eleventyConfig.cloudinary }/image/fetch/${ w ? 'w_' + w : '' }${ (height && width) ? ',h_' + Math.floor(height/width * w) : '' }${(height && width) ? (',' + (resize || 'c_fill')) : ''},f_auto,q_80/${process.env.URL + path.split(" ").join("%20")} ${w}w`;
    }).join(', ');
    return `<img src="${src}" class="${className}" srcset="${srcset}" sizes="${sizes ? sizes : '100vw'}" alt="${alt ? alt : ''}">`;
  }

  eleventyConfig.addShortcode('srcset', (path, alt, className, width, height, sizes, resize) => {
    return createMarkup(path, alt, className, width, height, sizes, resize);
  });

  eleventyConfig.addTransform('autoSrcset', async (content, outputPath) => {
    if( outputPath.endsWith(".html") && eleventyConfig.autoselector) {
      const dom = new JSDOM(content);
      const images = [...dom.window.document.querySelectorAll(eleventyConfig.autoselector)];
      if(images.length > 0) {
        await Promise.all(images.map(updateImage));
      }
      content = dom.serialize();
      return content;
    }
  });

  const updateImage = async imgElem => {
    let path = imgElem.src;
    let imageExtension = path.split('.').pop();
    if(imageExtension != 'svg' && !path.startsWith("//res.cloudinary.com")) {
      let alt = imgElem.alt | '';
      let className = 'post-image';
      let sizes = `(min-width: ${ eleventyConfig.fallbackWidth || 800 }px) ${ eleventyConfig.fallbackWidth || 800 }px, 100vw`;
      let resize = eleventyConfig.autoResizeMode || 'c_fill';
      let height = eleventyConfig.fallbackHeight || null;
      let width = eleventyConfig.fallbackWidth || 800;
      let newMarkup = createMarkup(path, alt, className, width, height, sizes, resize);
      imgElem.insertAdjacentHTML('afterend', newMarkup);
      imgElem.remove();
    }
  }

  return {
    dir: {
      input: "./src",      // Equivalent to Jekyll's source property
      output: "./dist", // Equivalent to Jekyll's destination property
      data: `./_data/`,
      includes: `./_includes/`,
    },
    // passthroughFileCopy: true,
    templateFormats: [
      "njk",
      "md",
      "html"
    ]
  };
};

function extractExcerpt(article) {
  let excerpt = null;

  const content = article.templateContent || 'foo';

  // The start and end separators to try and match to extract the excerpt
  const startPosition = content.indexOf('<p>');
  const endPosition = content.indexOf('</p>');
  const excerptLength = 100;

  if (startPosition !== -1 && endPosition !== -1) {
    excerpt = content.substring(startPosition, endPosition).replace(/(<([^>]+)>)/ig,"").trim().substring(0,excerptLength) + '...';
  }
  else {
    excerpt = '';
  }

  return excerpt;
}
