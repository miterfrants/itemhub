# Manually dump tips

## Step1. 確認資料

盤點資料庫的 table, view ...etc 的資料
記錄每個 table, view ...etc 的資料總數

## Step2. 匯出資料庫

### 建立並編輯 sh 執行檔

因為語法內有敏感資訊，建立 sh 去執行語法

```sh
mkdir {folder_name} // 建立資料夾
touch {file.name}.sh // 建立要執行的 sh 檔案
vi {file.name}.sh // 編輯 sh 檔案, 輸入以下 dump 指令
```

### 匯出資料庫

```sh
mysqldump -h {ip} -u {username} -p {password} {db_name} > {backup_file_name}.sql
```

-   `-h` 連線 host IP 或 Domain Name
-   `-u` 指定登入帳號
-   `-p` 指定登入密碼
-   `>` 匯出資料
-   匯出 {backup_file_name}.sql 資料庫

### 執行 sh

```sh
sh {file.name}.sh // 執行 sh
```

## 如果出現錯誤訊息

### Access denied

```sh
chmod x {file.name}.sh // 把 sh 檔案改成可執行的權限
```

-   `r` 讀取
-   `w` 寫入
-   `x` 執行
-   `rwx` 可讀取、寫入、執行

# Step3. 匯入資料庫

### 建立並編輯 sh 執行檔

因為語法內有敏感資訊，建立 sh 去執行語法

```sh
mkdir {file_name} // 建立資料夾
touch {file.name}.sh // 建立要執行的 sh 檔案
vi {file.name}.sh // 編輯 sh 檔案, 輸入匯入指令
```

## 匯入 {backup_file_name}.sql 資料庫

```sh
mysql /bin/sh -c 'mysql -u {username} -p {password} {db_name} < {backup_file_name}.sql'
```

-   `/bin/sh -c` 指向 /bin/sh 執行後面的語法
-   `<` 匯入資料

# Step4. 確認匯入的資料

連線至匯入的資料庫，比對 Step1 盤點的數量
