import React from 'react'

function RepeatForm({ repeatType, setRepeatType, repeatCount, setRepeatCount }) {
  return (
    <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
        Upprepning / Skapa serie framåt:
      </label>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value)}
          style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff', fontSize: '14px' }}
        >
          <option value="none">Ingen ny upprepning (Enstaka pass)</option>
          <option value="weekly">Varje vecka 🔁</option>
          <option value="biweekly">Varannan vecka 🔁</option>
          <option value="monthly">Varje månad 📅</option>
        </select>

        {repeatType !== 'none' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="number"
              min="2"
              max="24"
              value={repeatCount}
              onChange={(e) => setRepeatCount(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '14px' }}
            />
            <span style={{ fontSize: '13px', color: '#7f8c8d' }}>ggr</span>
          </div>
        )}
      </div>
      
      {repeatType !== 'none' && (
        <div style={{ fontSize: '12px', color: '#2980b9', marginTop: '6px' }}>
          💡 Detta kommer att behålla detta pass samt skapa <strong>{repeatCount - 1} stycken nya</strong> separata pass framåt i tiden.
        </div>
      )}
    </div>
  )
}

export default RepeatForm