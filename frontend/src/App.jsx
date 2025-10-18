import React, { useState } from 'react'
const API = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [city, setCity] = useState('Taipei')
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  const go = async () => {
    setErr(null)
    setData(null)
    try {
      const r = await fetch(`${API}?city=${encodeURIComponent(city)}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setData(await r.json())
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui', textAlign: 'center' }}>
      <h1>氣象查詢與建議</h1>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="輸入城市名稱（例：Taipei）"
      />
      <button onClick={go}>查詢</button>

      {err && <p style={{ color: 'red' }}>錯誤：{err}</p>}

      {data && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 30 }}>
            <div style={cardStyle}>
              <h2>座標</h2>
              <p>{data.city}</p>
              <p>經度：{data.longitude ?? '未知'}</p>
              <p>緯度：{data.latitude ?? '未知'}</p>
            </div>
            <div style={cardStyle}>
              <h2>天氣建議</h2>
              <div style={{ fontSize: 48 }}>{getIcon(data.weather_code)}</div>
              <p>{data.advice}</p>
            </div>
            <div style={cardStyle}>
              <h2>溫度</h2>
              <p>{data.temperature} °C</p>
              <p>風速：{data.windspeed} km/h</p>
            </div>
          </div>
          <button style={reloadBtn} onClick={() => window.location.reload()}>
            重新整理
          </button>
        </>
      )}
    </div>
  )
}

const cardStyle = {
  flex: 1,
  background: 'white',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  padding: 20,
  textAlign: 'center'
}

const reloadBtn = {
  marginTop: 20,
  padding: '10px 20px',
  border: 'none',
  borderRadius: 6,
  backgroundColor: '#3b82f6',
  color: 'white',
  fontSize: 16,
  cursor: 'pointer'
}

function getIcon(code) {
  if ([0, 1].includes(code)) return '☀️'
  if ([2, 3].includes(code)) return '⛅'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 61, 80].includes(code)) return '🌧️'
  if ([71, 73, 75].includes(code)) return '❄️'
  return '🌡️'
}

