import React, { useState, useEffect } from 'react'

function AdminPanel({ 
  isOpen, onClose, services, setServices, 
  homeStreet, setHomeStreet, homeZip, setHomeZip, homeCity, setHomeCity 
}) {
  const [localServices, setLocalServices] = useState({})
  const [localStreet, setLocalStreet] = useState('')
  const [localZip, setLocalZip] = useState('')
  const [localCity, setLocalCity] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLocalServices(JSON.parse(JSON.stringify(services || {})))
      setLocalStreet(homeStreet || '')
      setLocalZip(homeZip || '')
      setLocalCity(homeCity || '')
    }
  }, [isOpen, services, homeStreet, homeZip, homeCity])

  if (!isOpen) return null

  // FUNKTION: Uppdatera fält (både namn och pris) för en tjänst
  const handleServiceChange = (key, field, value) => {
    setLocalServices({
      ...localServices,
      [key]: { 
        ...localServices[key], 
        [field]: field === 'pricePerHour' ? (value === '' ? '' : Number(value)) : value 
      }
    })
  }

  // FUNKTION: Lägg till en helt ny tom tjänst i listan
  const handleAddService = () => {
    const newKey = 'service_' + Date.now()
    setLocalServices({
      ...localServices,
      [newKey]: { name: 'Ny tjänst 🌿', pricePerHour: 450 }
    })
  }

  // FUNKTION: Ta bort en tjänst ur listan
  const handleRemoveService = (key) => {
    const updated = { ...localServices }
    delete updated[key]
    setLocalServices(updated)
  }

  const handleSave = () => {
    const cleanedServices = { ...localServices }
    Object.keys(cleanedServices).forEach(key => {
      if (cleanedServices[key].pricePerHour === '') {
        cleanedServices[key].pricePerHour = services[key]?.pricePerHour || 0
      }
      if (!cleanedServices[key].name.trim()) {
        cleanedServices[key].name = services[key]?.name || 'Namnlös tjänst'
      }
    })

    setServices(cleanedServices)
    setHomeStreet(localStreet)
    setHomeZip(localZip)
    setHomeCity(localCity)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Inställningar ⚙️</h3>
        
        {/* UTGÅNGSADRESS */}
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

        {/* TJÄNSTER OCH TIMPRISER */}
        <h4 style={{ color: '#34495e', marginBottom: '10px' }}>Tjänster & Timpriser</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
          {Object.keys(localServices).map((key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Uppdatera namn */}
                <input
                  type="text"
                  value={localServices[key].name}
                  onChange={(e) => handleServiceChange(key, 'name', e.target.value)}
                  style={{ flex: 3, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
                
                {/* Uppdatera pris */}
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <input
                    type="number"
                    value={localServices[key].pricePerHour}
                    onChange={(e) => handleServiceChange(key, 'pricePerHour', e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '14px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>kr/h</span>
                </div>

                {/* Radera tjänst */}
                <button
                  type="button"
                  onClick={() => handleRemoveService(key)}
                  style={{ background: '#ffc9c9', color: '#da1b1b', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Knapp för att lägga till ny tjänst */}
        <button
          type="button"
          onClick={handleAddService}
          style={{ width: '100%', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        >
          + Lägg till ny tjänst
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Avbryt</button>
          <button type="button" onClick={handleSave} style={{ padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Spara inställningar</button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel