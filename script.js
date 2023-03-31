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
  const waitPageLoad = async () => {
    while (true) {
      // Before processing runes, detect whether rune related elements are loaded
      const loadCheckDiv = [
        ...document.querySelectorAll("[class^=LargeRunePanel_wrapper]"),
      ];
      // rune elements
      const runePickrateDivs = [
        ...document.querySelectorAll("[class^=RuneCell_pick__]"),
      ];
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
      const clickElementPatternList = ["SetSingle_togglespells"];
      
      const removeParentByContentList = [];

      // Change background image to plain gray #111111
      const backgroundImagePanel = [
        ...document.querySelectorAll("[class^=Background_back]"),
      ];
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

      // Tweak runes section
      if (loadCheckDiv.length > 0) {
        for (const div of runePickrateDivs) {
          let pickrateValue = parseFloat(div.innerHTML);

          // Set border radius
          div.style.borderRadius = "5px";

          // Set borders with colors
          if (pickrateValue >= 40.0)
            // 40%+
            div.style.border = "4px solid #ff9b00"; // Yellow border
          else if (pickrateValue >= 15.0)
            // 15-40%
            div.style.border = "4px solid #0756fa"; // Dark blue border
          else if (pickrateValue >= 5.0)
            // 5-15%
            //div.style.border = "4px solid #b5caf7"; // Light blue border
            div.style.border = "4px solid #AAAAAA"; // Gray border
          //   else if (pickrateValue >= 1.0) {
          //     // 1-5%
          //     div.parentNode.children[1].style.visibility = "hidden"; // Hide winrate
          //     div.parentNode.children[2].style.visibility = "hidden"; // Hide pickrate
          //   }
          else if (pickrateValue < 1.0)
            // <1%
            div.parentNode.style.visibility = "hidden"; // Hide all runes
        }
        //break;

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
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
    }
  };
  waitPageLoad();

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
})();
