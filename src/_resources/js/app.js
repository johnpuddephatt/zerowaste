"use strict";
import "alpinejs";

require("./_splittype.js");

document.documentElement.classList.remove("no-js");

let heroSplit;
let projectsSplit;

window.addEventListener("DOMContentLoaded", () => {
  let heroSplit = new SplitType(".home-hero__title", {
    split: "lines",
    tagName: "span",
  });
  document.documentElement.classList.add("ready");
});

window.youtubePlaylist = function(playlistId) {
  return {
    number: 4,
    apiKey: "AIzaSyDH-EwjbWxGwqpEtpR2NGvtfTiX23qtJtg",
    videos: null,
    isLoading: false,
    fetchPlaylist() {
      console.log("fetching");
      this.isLoading = true;
      fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${
          this.number
        }&playlistId=${playlistId}&key=${this.apiKey}`
      )
        .then((res) => res.json())
        .then((data) => {
          this.isLoading = false;
          this.videos = data.items;
          console.log(data.items);
        });
    },
  };
};
