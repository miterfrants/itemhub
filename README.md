# 公司目前產品方向

```mermaid
graph LR
    A(ItemHub) --> B(應用場景推廣)
    B --> C(智慧盆栽)
    B --> D(蝦皮販賣太陽能氣象站)
    B --> E(植物工廠)
    A --> F(教學推廣)
    F --> G(FB 社團教學)
    F --> H(學校研習)
```

# 專案結構

目前總共有兩個專案項目，分別為：

```
.
├── website         (負責認證, 金流, 訂閱, 行銷)
├── dashboard       (負責裝置控制, 觸發, oAuthClient)
├── api             (website, dashboard api 目前都共用這個專案, 未來如果有需要可以把兩個前台的 API 拆開)
├── static          (靜態檔案, 目前只放使用者產生 firmware, 要避免 web server 直接 access 這個資料夾)
│   ├── archived
│   └── firmware
└── firmware        (firmware template)
    ├── arduino-nano-33-iot
    ├── esp-01s
    ├── particle-io-photon
    └── raspberry-pi-pico
```

各個專案項目的說明，請參見各自資料夾中的 README。

# 團隊協作遊戲規則

Itemhub 採用去中心化決策流程, 每個人都能在 Issue 撰寫自己想為 Itemhub 開發的功能或是行銷任務,
目前加入這個組織的人, 必須先裝上 `Homo.Bet` 這個 Chrome Extension, `Homo.Bet` 於每個星期日發放 10 枚硬幣,
你可以把這些籌碼投注在你所關心的 Issue 上面, 如果在下一個星期日來臨時還沒把籌碼投注完則會被清空, 執行 Issue 的人並完成驗收
可以賺取這些被投注在 Issue 上的籌碼, 可為日後商店兌換加薪, 股權, 假期等,
如果需要修改這裡規則, 必須限時團體內取得所有人共識決, 超過時限就使用多數決

## Install Homo.Bet Chrome Extension

https://github.com/miterfrants/bet 先把這個專案 clone 下來, 按以下幾個步驟來完成安裝

- 在載下來的路徑中找到 chrome-ext 資料夾, 修改設定資料
  - `chrome-ext/manifest.template.json` 改成 `chrome-ext/manifest.json`
  - `chrome-ext/config.template.js` 改成 `chrome-ext/config.js` 並將其中的 `{DEV_API_ENDPOINT}` 和 `{PRODUCTION_API_ENDPOINT}` 改成相對應的網址
- 安裝 Chrome Extension

  - 在 chrome 網址欄輸入 `chrome://extensions/`
  - `載入未封裝項目` 選擇剛剛修改的 chrome-ext 資料夾
  - 載入後會出現 chrome extension id (如下圖) 把這個 Id 給 Homo.Bet 管理員他會給你一組 client id
    <img width="417" alt="截圖 2021-12-02 下午4 03 27" src="https://user-images.githubusercontent.com/2028693/144387289-34e9b059-22b2-4834-9cc4-01c486ad0c2a.png">

  - 修改 chrome extension `chrome-ext/manifest.json` 中的 `{clientId}` 取代成 Homo.Bet 管理員給的 client id
  - 以上步驟都完成以後在 `chrome://extensions/` 重新載入後開啟 Homo.Bet 如下圖紅色圈起的地方
    <img width="417" alt="截圖 2021-12-02 下午4 03 27 (1)" src="https://user-images.githubusercontent.com/2028693/144387503-06bad2ec-f590-4f7c-a7cd-31e5a332c7cb.png">

- 要求管理員把這個會員拉到 Itemhub 組織中

## Issue 開啟

- 開啟 Issue 的使用者在有其他人投注籌碼的當下會獲得 1 枚硬幣做為獎勵
- Issue 中的 Dependency 只能有一層, 避免過多的 Issue 無法依照重要性排序 Issue 而亂投注, 如果超過一層的 Issue 應於前一個 Dependency 完成後再開, ex: `研究收費標準` -> `規劃收費標準頁面` -> `實作收費標準頁面`, `實作收費標準頁面` 和 `規劃收費標準` 這兩個 Issue 不應該先開啟, 一直等到 `研究收費標準` 完成時才應該產出下一個要做的事項 `規劃收費標準`

## 投注

- 連到 Itemhub issues 畫面 https://www.github.com/miterfrants/itemhub/issues
- 開啟 Homo Bet 的 Chrome Extension 你將會看到以下畫面, 點擊 `Sync Github Issue`
  <img width="348" alt="截圖 2021-12-02 下午4 44 36" src="https://user-images.githubusercontent.com/2028693/144387873-cb68ef3e-dfd7-4c58-98fe-a3254c90a2ac.png">

- 接著你會在 Github Header 上看到你剩下的籌碼, 並看到每一個 Issue 現在認領的人, 預計完成的時間和一個加減籌碼的按鈕
- 按下加減按鈕來投注你關心的 Issue, 如果已經有人認領的 Issue 你就無法減少你當初投注的籌碼, 只能加碼

## Issue 認領規則

- 連到 Itemhub issues 畫面 https://www.github.com/miterfrants/itemhub/issues
- 開啟 Homo Bet 的 Chrome Extension 你將會看到以下畫面, 點擊 `Sync Github Issue`
- 評估 Issue 上的籌碼是否符合期待, 按下 `Claim` 並輸入預期的完成時間 (時間目前沒有懲罰條款, 未來可能有延遲懲罰)
- 把 Issue Assign 自己
- 實作完成時把 Issue lable 上 `Done`, 並在 Issue 列表開啟 `Sync Github Issue` 把完成的 Issue 按下 `Mark Finish`

## Issue 驗收

- 驗收已標記上 `Done` 的 Issue
- 依照 Issue 上面的驗收列表檢驗是否真實完成
- 如果已完成在 Issue 列表開啟 `Sync Github Issue` 把完成的 Issue 按下 `Done` 並可獲額外紅利, 投注籌碼的 1/5 紅利
- 接著把這個 Issue Close 掉

# 參考資料

- 網站規劃相關文件: https://drive.google.com/drive/folders/1J7kGuGP9iTKDntaVqGkwYPG7USJ9WFIP
- 網站規劃設計稿: https://www.figma.com/file/eqxlwbzWPRrdMDCede74yX/itemhub?node-id=46%3A1397
- 其他參考文件: https://paper.dropbox.com/folder/show/itemhub-e.1gg8YzoPEhbTkrhvQwJ2zzRUpNqie6wHdN3EeSUW6SOikHBvFYHu
