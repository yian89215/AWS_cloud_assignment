# 雲端氣象建議系統

於 **AWS 雲端架構** 上，實作一個簡易氣象查詢網站。  
使用者可輸入城市名稱，即時取得當地氣象資料與外出建議。

---

## 專案結構
backend/
├── template.yml # 定義 Lambda + API Gateway 架構
└── weather_api/ # Python Lambda 運作程式碼

frontend/
├── template.yml # 定義 S3 + CloudFront 前端架構
├── amplify.yml #前端建置設定檔
└── dist/ # npm run build 後產物
---

## 前端部署
```bash
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://frontend-infra-frontend-bucket
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```
## 後端部署
```bash
cd backend/weather_api
zip -r ../weather_api.zip .
aws s3 cp ../weather_api.zip s3://frontend-infra-frontend-bucket/weather_api.zip
aws cloudformation deploy \
  --template-file ../template.yml \
  --stack-name weather-backend \
  --parameter-overrides CodeBucketName=frontend-infra-frontend-bucket CodeKey=weather_api.zip \
  --capabilities CAPABILITY_IAM
```
