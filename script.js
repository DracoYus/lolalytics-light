// ==UserScript==
// @name         Lolalytics Light
// @namespace    https://github.com/DracoYus/lolalytics-light
// @description  Minimalism mode - Removed most useless information and highlighted the best option
// @version      1.0.1
// @author       Yu Jiamin, Ivan Pavlov
// @match        file:///*.mhtml
// @match        https://lolalytics.com/*
// @run-at       document-body
// ==/UserScript==

(function () {
  "use strict";
  // green, orange, red
  const HighLightColor = ["#22863A", "#DBAB09", "#D73A49"];
  // some elements I don't like
  const removePanelPatternList = [
    "ChampionHeader_medium__",
    "ChampionHeader_header__",
    "Summary_full__",
    "HLeaderboard_leaderboard",
    "GraphLegend_wrapper",
    "Graphs_medium3",
    "Champion_mythic",
    "PanelHeading_games",
    "PanelHeading_time",
    "Cell_games",
    "Cell_time",
    "CellFilter_games",
    "Billboard_billboard",
    "RuneHeading_games",
    "RuneCell_games",
    "ButtonSet_wrapper",
    "NavBar_navbar",
    "TierListHeader_medium",
    "ChampionSideBar_triple",
  ];
  // Adjust the element to compress the gaps caused by deleting nodes
  const resizePanelPatternList = ["PanelLazy_panel"];
  // toggle summoner skills
  const clickElementPatternList = [
    "SetSingle_togglespells",
    "SetSingle_toggleitemset",
  ];
  const removeParentByContentList = [];
  const highLightList = [
    ["[class^=PanelHeading_title]", "Mythic"],
    ["[class^=PanelHeading_title]", "Summoner Spells"],
    ["[class^=PanelHeading_title]", "Starting Items"],
    ["[class^=PanelHeading_title]", "Item"],
    ["[class^=PanelHeading_title]", "Boots"],
    ["[class^=PanelHeading_title]", "Popular Items"],
    ["[class^=PanelHeading_title]", "Winning Items"],
  ];
  const runeRowsPattern = "[class^=RuneRow_runerow]";
  const runeStatsPattern = "[class^=RuneStatPanel_runetype]";

  const waitPageLoad = async () => {
    while (true) {
      // Before processing runes, detect whether rune related elements are loaded
      const loadCheckDiv = [
        ...document.querySelectorAll("[class^=LargeRunePanel_wrapper]"),
      ];
      // rune pickrate elements
      const runePickrateDivs = [
        ...document.querySelectorAll("[class^=RuneCell_pick__]"),
      ];
      // Change background image to plain gray #111111
      const backgroundImagePanel = [
        ...document.querySelectorAll("[class^=Background_back]"),
      ];

      const runeRows = [...document.querySelectorAll(runeRowsPattern),...document.querySelectorAll(runeStatsPattern)];

      if (backgroundImagePanel.length > 0)
        backgroundImagePanel[0].style.backgroundImage =
          'url("https://i.imgur.com/cT5l4hu.png")';

      // Hide runes that champion can't pick (eg. Teemo Aftershock)
      const unavailableRunesDivs = [
        ...document.querySelectorAll("[class^=RuneCell_runecell__]"),
      ];
      if (unavailableRunesDivs.length > 0) {
        for (const div of unavailableRunesDivs) {
          if (div.children.length == 1) {
            div.style.visibility = "hidden";
          }
        }
      }

      // hide runes that pick rate lower than 1%
      if (loadCheckDiv.length > 0) {
        for (const div of runePickrateDivs) {
          let pickrateValue = parseFloat(div.innerHTML);
          if (pickrateValue < 1.0) div.parentNode.style.visibility = "hidden"; // Hide all runes
        }
      }

      for (let runeRow of runeRows) {
        highLightRune(runeRow);
      }

      for (const removePanelPattern of removePanelPatternList) {
        const divs = [
          ...document.querySelectorAll(`[class^=${removePanelPattern}]`),
        ];
        removeDivs(divs);
      }

      for (const resizePanelPattern of resizePanelPatternList) {
        const divs = [
          ...document.querySelectorAll(`[class^=${resizePanelPattern}]`),
        ];
        resizeDivs(divs);
      }

      for (const clickElementPattern of clickElementPatternList) {
        const divs = [
          ...document.querySelectorAll(`[class^=${clickElementPattern}]`),
        ];
        clickDivs(divs);
      }

      for (const removeParentByContent of removeParentByContentList) {
        const divs = [
          ...document.querySelectorAll(`:contains(${removeParentByContent}`),
        ];
        removeParentDivs(divs);
      }

      removeUselessDiv();

      for (let hightLightElement of highLightList) {
        highLight(...hightLightElement);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
  var observer = new MutationObserver(waitPageLoad);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  function removeDivs(divs) {
    for (const div of divs) {
      div.style.display = "none";
    }
  }

  function removeParentDivs(divs) {
    for (const div of divs) {
      div.parentNode.parentNode.style.display = "none";
    }
  }

  function hideDivs(divs) {
    for (const div of divs) {
      div.style.visibility = "hidden";
    }
  }

  function resizeDivs(divs) {
    for (const div of divs) {
      div.style.minHeight = "90px";
    }
  }

  function clickDivs(divs) {
    for (const div of divs) {
      div.click();
    }
  }

  function removeUselessDiv() {
    // remove PanelHeading_title, which is meanless in ARAM
    const earlyItemSetClass = "PanelHeading_title";
    const earlyItemSetdivs = document.querySelectorAll(
      `[class^=${earlyItemSetClass}]`
    );
    earlyItemSetdivs.forEach((div) => {
      if (div.textContent.trim() === "Early Items (10min)") {
        div.parentNode.parentNode.style.display = "none";
      }
    });

    // remove 2, 3, 4, 5 item sets. The better alternatives are the winning rate and pick rate sets
    let UselessClass = "PanelHeading_item_subtitle";
    let specificStrings = ["2", "3", "4", "5"];
    let Uselessdivs = document.querySelectorAll(`[class^=${UselessClass}]`);
    for (let i = 0; i < Uselessdivs.length; i++) {
      for (let j = 0; j < specificStrings.length; j++) {
        if (Uselessdivs[i].textContent.includes(specificStrings[j])) {
          Uselessdivs[i].parentNode.parentNode.style.display = "none";
        }
      }
    }

    UselessClass = "PanelHeading_title";
    specificStrings = "All";
    Uselessdivs = document.querySelectorAll(`[class^=${UselessClass}]`);
    Uselessdivs.forEach((div) => {
      if (div.textContent.trim() === specificStrings) {
        div.parentNode.parentNode.style.display = "none";
      }
    });
  }

  function highLight(Pattern, text) {
    let div = elementWithTextIsLoaded(Pattern, text);
    if (div) {
      let highLightParentDivs = div.parentNode.nextSibling.firstChild;
      const divsArray = Array.from(highLightParentDivs.childNodes);
      let FilterAndSortedDivs = divsArray
        .filter((highLightDiv) => {
          return parseFloat(highLightDiv.children[2].innerHTML) > 1;
        })
        .sort(
          (a, b) =>
            // balance the winrate and pick rate
            parseFloat(b.children[1].innerHTML) +
            Math.log(parseFloat(b.children[2].innerHTML)) -
            parseFloat(a.children[1].innerHTML) -
            Math.log(parseFloat(a.children[2].innerHTML))
        );
      for (
        let i = 0;
        i < Math.min(HighLightColor.length, FilterAndSortedDivs.length);
        i++
      ) {
        FilterAndSortedDivs[i].style.borderRadius = "2px";
        FilterAndSortedDivs[i].style.border = `2px solid ${HighLightColor[i]}`;
        FilterAndSortedDivs[i].style["box-sizing"] = "border-box";
      }
    }
  }

  function elementWithTextIsLoaded(selectorPattern, text) {
    let divs = document.querySelectorAll(selectorPattern);
    for (let i = 0; i < divs.length; i++) {
      if (divs[i].textContent === text) {
        return divs[i];
      }
    }
    return null;
  }

  function highLightRune(div) {
    const divsArray = Array.from(div.children);
    let FilterAndSortedDivs = divsArray
      .filter((highLightDiv) => {
        if (highLightDiv.children[2])
          return parseFloat(highLightDiv.children[2].innerHTML) > 1;
        else return false;
      })
      .sort(
        (a, b) =>
          // balance the winrate and pick rate
          parseFloat(b.children[1].innerHTML) +
          Math.log(parseFloat(b.children[2].innerHTML)) -
          parseFloat(a.children[1].innerHTML) -
          Math.log(parseFloat(a.children[2].innerHTML))
      );
    let FirstWinRate;
    let FirstPickRate;
    if (FilterAndSortedDivs[0]) {
      FirstWinRate = parseFloat(
        FilterAndSortedDivs[0].children[1].innerHTML
      );
      FirstPickRate = parseFloat(
        FilterAndSortedDivs[0].children[2].innerHTML
      );
    }
    for (
      let i = 0;
      i < Math.min(HighLightColor.length, FilterAndSortedDivs.length);
      i++
    ) {
      if (
        parseFloat(FilterAndSortedDivs[i].children[1].innerHTML) >=
          FirstWinRate ||
        parseFloat(FilterAndSortedDivs[i].children[2].innerHTML) >=
          FirstPickRate
      ) {
        FilterAndSortedDivs[i].style.borderRadius = "2px";
        FilterAndSortedDivs[i].style.border = `2px solid ${HighLightColor[i]}`;
        FilterAndSortedDivs[i].style["box-sizing"] = "border-box";
      }
    }
  }
})();
