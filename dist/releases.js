'use strict';

// Human-maintained release history. Dates use Asia/Kuala_Lumpur.
// Current publication resolves by projectId + version; exact historical IDs are filled next release.
const VoidReleases = Object.freeze({
  "currentVersion": 33,
  "projectId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f",
  "entries": [
    {
      "version": 33,
      "displayVersion": "0.1.1",
      "date": "2026-10-21",
      "type": "UI",
      "title": "One focused game layout",
      "changes": [
        "Game layout now fits the screen from opening; removed Page view and view-switching buttons."
      ],
      "verification": "Automated checks passed; device playtest pending."
    },
    {
      "version": 32,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Release history in Debug & Codex",
      "changes": [
        "Added a read-only Updates tab and loaded-version indicator."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_f780eed2acb081918314e27873409ace",
      "commitSha": "4c22af44e972356f6a2d7f569c764c1f6361e42c"
    },
    {
      "version": 31,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Cleaner shield and jump indicators",
      "changes": [
        "Removed shield-break countdown labels and Jump-button seconds."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_c1de7267bab48191b4b9263027c97fa6",
      "commitSha": "8e46a67696632f6e9695811a0354dce9f8a426f7"
    },
    {
      "version": 30,
      "date": "2026-10-21",
      "type": "Bug fix",
      "title": "Player stays visible after boss defeat",
      "changes": [
        "Fixed Donald disappearing during the health-supply phase."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_b762798eee1c81919a771fda5f2362c8",
      "commitSha": "2c7bed4cd9e2f45b0382eb2ae1f0058539a4824f"
    },
    {
      "version": 29,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Removed page footer",
      "changes": [
        "Removed duplicate controls and credit text below the game."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_52bb0c34b160819188169c1ff446f49b",
      "commitSha": "3e6c57fc5d4b842d97a06c37e6b9433d8e502da2"
    },
    {
      "version": 28,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Shorter start screens and Player reference",
      "changes": [
        "Simplified menus and tutorial text; kept Player stats and build details."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_40db46831ed08191b8d8ae572ff800a4",
      "commitSha": "511bdbf6d03e4aa079b5e7cf0cc7b5d70b89e430"
    },
    {
      "version": 27,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Concise Debug controls",
      "changes": [
        "Shortened Infinite hearts to ON/OFF; changed chapter labels to levels."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_b980460103788191967a91faceb3376d",
      "commitSha": "f66c805ed7748fd37b3e6b95857cfafbff44f1a8"
    },
    {
      "version": 26,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Less Codex commentary",
      "changes": [
        "Removed enemy/Boss counter advice and tab opening/closing paragraphs."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_e41c0d17786881918a4526d6670b5c8c",
      "commitSha": "19d15947c6d1a492662c80a573a75ef8e6d358ae"
    },
    {
      "version": 25,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Fewer floating countdowns",
      "changes": [
        "Removed following jump text and bomb warning numbers; kept visual rings."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_f04ed41bfa388191b226ab32026defb6",
      "commitSha": "339f9b2c7610743e3744f16d82e1607d5f48c11a"
    },
    {
      "version": 24,
      "date": "2026-10-21",
      "type": "UI",
      "title": "Play mode and readable HUD",
      "changes": [
        "Added viewport-fit Play mode, clearer Pause and mobile upgrade choices."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_ded5f7ccb7788191a5a12167185ae20e",
      "commitSha": "32b17ba8e721eb54bd6de61a47c9eca2b48b89b2"
    },
    {
      "version": 23,
      "date": "2026-10-21",
      "type": "Maintenance",
      "title": "Readable code and consistent timing",
      "changes": [
        "Split browser code by responsibility; corrected low-frame-rate slowdown."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_77c58c46c3048191bd1e6d98bb6fa1f9",
      "commitSha": "3f1b5c37e77bd4b56fe2e28626db08a6e5027721"
    },
    {
      "version": 22,
      "date": "2026-10-21",
      "type": "Gameplay",
      "title": "Landing-driven item builds",
      "changes": [
        "Removed Q; reworked landing items and moved essential HUD information into the game."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_a4d947b363b4819182a0bf2261a32efb",
      "commitSha": "a27a9bf599f4b9401eeb0e5b0467a135e8d2258b"
    }
  ],
  "displayVersion": "0.1.1"
});
