import React, { useState, useEffect } from 'react'

function AdminPanel({ isOpen, onClose, services, setServices, homeStreet, setHomeStreet, homeZip, setHomeZip, homeCity, setHomeCity }) {
  const [localServices, setLocalServices] = useState({})
  const [localStreet, setLocalStreet] = useState('')
  const [localZip, setLocalZip] = useState('')
  const [localCity, setLocalCity] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLocalServices({ ...services })
      setLocalStreet(homeStreet || '')
      setLocalZip(homeZip || '')
      setLocalCity(homeCity || '')
    }
  }, [isOpen, services, homeStreet, homeZip, homeCity])

  if (!isOpen) return null

  const handlePriceChange = (key, value) => {
    setLocalServices({
      ...localServices,
      [key]: { ...localServices[key], pricePerHour: Number(value) }
    })
  }

  const handleSave = () => {
    setServices(localServices)
    setHomeStreet(localStreet)
    setHomeZip(localZip)
    setHomeCity(localCity)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '420px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Inställningar ⚙️</h3>
        
        {/* UPPDATERAT: STRUKTURERADE ADRESSFÄLT */}
        <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
            🏠 Utgångsadress (Hem/Kontor)
          </label>
          
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Gatuadress</span>
            <input
              type="text"
              value={localStreet}
              onChange={(e) => setLocalStreet(e.target.value)}
              placeholder="Ex: Storgatan 1"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Postnummer</span>
              <input
                type="text"
                value={localZip}
                onChange={(e) => setLocalZip(e.target.value)}
                placeholder="Ex: 791 30"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '14px' }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Ort</span>
              <input
                type="text"
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                placeholder="Ex: Falun"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        <h4 style={{ color: '#34495e', marginBottom: '10px' }}>Tjänster & Timpriser</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto' }}>
          {Object.keys(localServices).map((key) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{localServices[key].name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="number"
                  value={localServices[key].pricePerHour}
                  onChange={(e) => handlePriceChange(key, e.target.value)}
                  style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>kr/h</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button onClick={onClose} style={{ padding: '10px 15px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Avbryt</button>
          <button onClick={handleSave} style={{ padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Spara inställningar</button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel