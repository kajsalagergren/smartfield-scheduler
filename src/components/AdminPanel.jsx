import React, { useState } from 'react'

function AdminPanel({ isOpen, onClose, services, setServices }) {
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceRate, setNewServiceRate] = useState('')
  
  // Håller koll på vilken tjänst som just nu redigeras (om någon)
  const [editingKey, setEditingKey] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRate, setEditRate] = useState('')

  if (!isOpen) return null

  // Lägg till ny tjänst
  const handleAddService = (e) => {
    e.preventDefault()
    if (!newServiceName || !newServiceRate) return

    const serviceKey = newServiceName.toLowerCase().replace(/\s+/g, '') + '_' + Date.now()

    setServices({
      ...services,
      [serviceKey]: {
        name: newServiceName,
        hourlyRate: Number(newServiceRate)
      }
    })

    setNewServiceName('')
    setNewServiceRate('')
  }

  // Aktivera redigeringsläge för en tjänst
  const startEdit = (key) => {
    setEditingKey(key)
    setEditName(services[key].name)
    setEditRate(services[key].hourlyRate)
  }

  // Spara uppdaterad tjänst
  const handleUpdateService = (e) => {
    e.preventDefault()
    if (!editName || !editRate) return

    setServices({
      ...services,
      [editingKey]: {
        name: editName,
        hourlyRate: Number(editRate)
      }
    })

    setEditingKey(null)
  }

  // Ta bort tjänst
  const handleDeleteService = (keyToDelete) => {
    const updatedServices = { ...services }
    delete updatedServices[keyToDelete]
    setServices(updatedServices)
    if (editingKey === keyToDelete) setEditingKey(null)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9998 // Strax under bokningsmodalen
    }}>
      <div style={{ 
        background: '#fff', padding: '25px', borderRadius: '8px', 
        width: '450px', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' 
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Hantera tjänster & priser ⚙️</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#95a5a6' }}>&times;</button>
        </div>

        {/* LISTA ÖVER TJÄNSTER */}
        <div style={{ marginBottom: '20px' }}>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {Object.keys(services).map((key) => (
              <li key={key} style={{ background: '#f8f9fa', padding: '10px', marginBottom: '8px', borderRadius: '6px', borderLeft: '4px solid #3498db' }}>
                {editingKey === key ? (
                  /* Redigeringsformulär för raden */
                  <form onSubmit={handleUpdateService} style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
                    />
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={editRate} 
                        onChange={(e) => setEditRate(e.target.value)}
                        style={{ padding: '6px', width: '90px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
                      />
                      <span style={{ fontSize: '14px' }}>kr/h</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                        <button type="button" onClick={() => setEditingKey(null)} style={{ background: '#95a5a6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Avbryt</button>
                        <button type="submit" style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Spara</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Standardvy för raden */
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#2c3e50' }}>{services[key].name}</strong>
                      <div style={{ fontSize: '14px', color: '#7f8c8d' }}>{services[key].hourlyRate} kr/h</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => startEdit(key)} style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Ändra ✏️</button>
                      <button onClick={() => handleDeleteService(key)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>📋</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* SKAPA NY TJÄNST */}
        <form onSubmit={handleAddService} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px dashed #bdc3c7', marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>Lägg till ny tjänst:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Namn (t.ex. Häckklippning ✂️)"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Timpris (kr/h)"
                value={newServiceRate}
                onChange={(e) => setNewServiceRate(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
                required
              />
              <button type="submit" style={{ background: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                + Lägg till
              </button>
            </div>
          </div>
        </form>

        <button 
          onClick={onClose}
          style={{ width: '100%', padding: '10px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Stäng inställningar
        </button>
      </div>
    </div>
  )
}

export default AdminPanel