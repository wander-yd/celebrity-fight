'use strict';

// Human-maintained release history. Dates use Asia/Kuala_Lumpur.
// Current publication resolves by projectId + version; exact historical IDs are filled next release.
const VoidReleases = Object.freeze({
  "currentVersion": 43,
  "projectId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f",
  "entries": [
    {
      "version": 43,
      "displayVersion": "0.3.3",
      "date": "2026-10-26",
      "type": "Fix",
      "title": "Stable mobile aim after release",
      "changes": [
        "Releasing ATTACK freezes direction, including a tap waiting for cooldown.",
        "Moving without ATTACK or while manually aiming no longer shifts facing; press again to resume assisted aim."
      ],
      "verification": "Full regression and five frozen-aim scenario groups passed; device playtest pending."
    },
    {
      "version": 42,
      "displayVersion": "0.3.2",
      "date": "2026-10-25",
      "type": "Refactor",
      "title": "Shared player input commands",
      "changes": [
        "Keyboard/mouse and touch now use separate adapters with shared movement, aim, attack and Jump commands.",
        "Centralized input clearing; existing controls and combat rules are preserved."
      ],
      "verification": "Automated adapter, one-shot, clearing, Build41 replay and regression checks passed; physical-device smoke playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_4f1bc686796881918f850b5a7c8595d8",
      "commitSha": "1a06ec9773f52961fbfb71bec72044b4ba4d18ba"
    },
    {
      "version": 41,
      "displayVersion": "0.3.1",
      "date": "2026-10-25",
      "type": "Fix",
      "title": "More responsive melee aiming",
      "changes": [
        "Dollar stack follows aim during windup, locks for the downswing, then turns toward live aim while recovering.",
        "Damage stays aligned with the committed swing; attack speed, reach and damage are unchanged."
      ],
      "verification": "Automated steering, damage, recovery and input regressions passed; physical-device feel pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_57be2bd99f9c8191baabdf79a8390cea",
      "commitSha": "eb9a019c20fcfa2efb0b32f6db139a836ed931a7"
    },
    {
      "version": 40,
      "displayVersion": "0.3.0",
      "date": "2026-10-22",
      "type": "Controls",
      "title": "Independent mobile attack and aim",
      "changes": [
        "Left stick moves only; tap or hold ATTACK for assisted aim, drag for manual aim.",
        "Larger paired Attack/Jump controls with local layout tuning and device-specific help."
      ],
      "verification": "Automated gesture, targeting, persistence, interruption and regression checks passed; physical-phone comfort pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_8cb085c577848191b0a04d83c7857f94",
      "commitSha": "cfb1dc73fa5a3cea33c557fd5155371918eb10a6"
    },
    {
      "version": 39,
      "displayVersion": "0.2.3",
      "date": "2026-10-22",
      "type": "Fix",
      "title": "Land without sudden shoves",
      "changes": [
        "Landing no longer relocates the player when overlapping enemies.",
        "Overlapping landing targets give a brief contact-only exit window after stun; leaving ends it immediately."
      ],
      "verification": "Automated landing/contact and regression checks passed; physical-phone combat feel pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_ddbe005d2888819186b24f7600c0275d",
      "commitSha": "0b8eef73a3e68847db4dc5e9279039f59da1cc71"
    },
    {
      "version": 38,
      "displayVersion": "0.2.2",
      "date": "2026-10-22",
      "type": "Controls",
      "title": "Local touch layout tuning",
      "changes": [
        "Movement stick fades out where released; higher Jump defaults for portrait and landscape.",
        "Debug Controls previews and saves Jump position/size per orientation on this browser, with Reset and Copy config."
      ],
      "verification": "Automated regression and control-layout checks passed; physical-phone comfort pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_1b19fee4a0948191a4a8607be121b863",
      "commitSha": "6957530a3f15667e3e4266045b03fa54abcb5c2b"
    },
    {
      "version": 37,
      "displayVersion": "0.2.1",
      "date": "2026-10-22",
      "type": "Controls",
      "title": "Thumb-friendly mobile controls",
      "changes": [
        "Visible floating movement stick with a small deadzone; larger inset Jump button in both orientations.",
        "Move and jump independently with two fingers; touch controls hide when using mouse or keyboard."
      ],
      "verification": "Automated input and regression checks passed; browser layout preview inspected. Physical-phone feel pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_7c90a8740c14819193b87928606737bf",
      "commitSha": "fc392f796c695df6445ff36286d272f9f9b35256"
    },
    {
      "version": 36,
      "displayVersion": "0.2.0",
      "date": "2026-10-21",
      "type": "Camera & UI",
      "title": "Square arena and following camera",
      "changes": [
        "Square arena with near-original area, closer smooth camera and floating HUD.",
        "Portrait/landscape keep the same visible world area; rotation preserves combat and player visibility."
      ],
      "verification": "Automated checks and desktop/portrait/landscape browser previews passed; physical phone feel pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_b391d10fc080819190eb2a356b272b82",
      "commitSha": "3dafa13495ac4c18e40063b34efff9cbffa902b5"
    },
    {
      "version": 35,
      "displayVersion": "0.1.3",
      "date": "2026-10-21",
      "type": "UI",
      "title": "Text for Start and Resume",
      "changes": [
        "Restored plain START and RESUME buttons; other menu icons remain unchanged."
      ],
      "verification": "UI and guide checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_1650e3e47c74819199c61ccc4e86b4c6",
      "commitSha": "03345c66fd408a426f715f2216c6b58c3ad21016"
    },
    {
      "version": 34,
      "displayVersion": "0.1.2",
      "date": "2026-10-21",
      "type": "UI",
      "title": "Familiar menu icons",
      "changes": [
        "Added consistent play, pause, sound and close icons; shortened restart controls and removed the death-screen tip."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_50a0a5e373fc8191b7688ea9b2cd79dc",
      "commitSha": "4aa1c65e585778ce8f9194591ac020a97b79bdb0"
    },
    {
      "version": 33,
      "displayVersion": "0.1.1",
      "date": "2026-10-21",
      "type": "UI",
      "title": "One focused game layout",
      "changes": [
        "Game layout now fits the screen from opening; removed Page view and view-switching buttons."
      ],
      "verification": "Automated checks passed; device playtest pending.",
      "savedVersionId": "appgprj_6ad740f9f07081918e87fce2aa1f3a9f~appgver_8c9d60d638d88191b5ff66c1f5121995",
      "commitSha": "58a86eb26208b4c3d4d2f0af5f615a2a44b295d2"
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
  "displayVersion": "0.3.3"
});
