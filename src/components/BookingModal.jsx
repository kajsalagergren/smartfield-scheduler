import React, { useState, useEffect } from 'react'


function BookingModal({ isOpen, onClose, onSave, customerName, setCustomerName, startTime, endTime, services }) {
  // Vi sätter första tillgängliga tjänst som standard dynamiskt
  const [selectedService, setSelectedService] = useState(Object.keys(services)[0])
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [hours, setHours] = useState(0)

  useEffect(() => {
    if (startTime && endTime && services[selectedService]) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      const diffInMs = end - start
      const diffInHours = diffInMs / (1000 * 60 * 60)
      setHours(diffInHours)

      // Räknar ut priset baserat på tjänsterna från App.jsx
      const rate = services[selectedService].hourlyRate
      setCalculatedPrice(diffInHours * rate)
    }
  }, [startTime, endTime, selectedService, services])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '380px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Ny bokning 📅</h3>
        
        <form onSubmit={(e) => onSave(e, services[selectedService].name, calculatedPrice)}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Kundens namn:</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }}
              placeholder="Sven Svensson"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Välj tjänst:</label>
            <select 
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff' }}
            >
              {Object.keys(services).map((key) => (
                <option key={key} value={key}>
                  {services[key].name} ({services[key].hourlyRate} kr/h)
                </option>
              ))}
            </select>
          </div>

          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #2ecc71' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>
              Tidsåtgång: <strong>{hours.toFixed(1)} timmar</strong>
            </p>
            <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2c3e50' }}>
              Originalpris: <strong>{calculatedPrice.toFixed(0)} kr</strong>
            </p>
            <p style={{ margin: '0', fontSize: '18px', color: '#27ae60', fontWeight: 'bold' }}>
              Med RUT-avdrag (50%): { (calculatedPrice * 0.5).toFixed(0) } kr
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Avbryt
            </button>
            <button type="submit" style={{ padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Boka pass
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal