import json, urllib.request

def lambda_handler(event, context):
    try:
        qs = event.get("queryStringParameters") or {}
        city = qs.get("city", "Taipei")

        # 取得地理位置
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        with urllib.request.urlopen(urllib.request.Request(geo_url, headers={"User-Agent": "weather_lambda"}), timeout=5) as res:
            geo = json.loads(res.read().decode())
        if not geo.get("results"):
            return _resp(404, {"error": f"City '{city}' not found"})

        lat = geo["results"][0]["latitude"]
        lon = geo["results"][0]["longitude"]

        # 取得氣象資料
        w_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        with urllib.request.urlopen(urllib.request.Request(w_url, headers={"User-Agent": "weather_lambda"}), timeout=5) as res:
            data = json.loads(res.read().decode())
        w = data.get("current_weather")
        if not w:
            return _resp(502, {"error": "weather data missing"})

        temp = w.get("temperature")
        wind = w.get("windspeed")
        code = int(w.get("weathercode", 0))

        # 天氣建議
        if code in [0]:
            advice = "晴朗 ☀️ 適合外出活動!"
        elif code in [1, 2, 3]:
            advice = "多雲 ⛅ 請注意防曬!"
        elif code in [51, 61, 80]:
            advice = "下雨 🌧️ 出門請帶傘!"
        elif temp is not None and temp > 32:
            advice = "高溫 ☀️ 注意防曬!"
        else:
            advice = "天氣舒適 🌤️"

        return _resp(200, {
            "city": city,
            "latitude": lat,
            "longitude": lon,
            "temperature": temp,
            "windspeed": wind,
            "weather_code": code,
            "advice": advice
        })
    except Exception as e:
        return _resp(500, {"error": str(e)})


def _resp(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }

