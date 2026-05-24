import React, { useState, useEffect } from 'react'

function BookingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  customerName, 
  setCustomerName, 
  startTime, 
  setStartTime, 
  endTime, 
  setEndTime,   
  services, 
  isEditing 
}) {
  const [selectedService, setSelectedService] = useState(Object.keys(services)[0])
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [hours, setHours] = useState(0)

  useEffect(() => {
    if (startTime && endTime && services[selectedService]) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      const diffInMs = end - start
      const diffInHours = diffInMs / (1000 * 60 * 60)
      
      const finalHours = diffInHours > 0 ? diffInHours : 0
      setHours(finalHours)

      const rate = services[selectedService].hourlyRate
      setCalculatedPrice(finalHours * rate)
    }
  }, [startTime, endTime, selectedService, services])

  if (!isOpen) return null

  // Hjälpfunktion för tolkning: Extraherar "HH:MM" från "YYYY-MM-DDTHH:MM"
  const getTimeString = (dateTimeStr) => {
    if (!dateTimeStr || !dateTimeStr.includes('T')) return '00:00'
    return dateTimeStr.split('T')[1].substring(0, 5)
  }

  // Hjälpfunktion för uppdatering: Byter ut "HH:MM" i en "YYYY-MM-DDTHH:MM"-sträng
  const handleTimeChange = (newTimeStr, isStart) => {
    const currentDateTimeStr = isStart ? startTime : endTime
    if (!currentDateTimeStr) return

    const datePart = currentDateTimeStr.split('T')[0]
    const updatedDateTimeStr = `${datePart}T${newTimeStr}:00`

    if (isStart) {
      setStartTime(updatedDateTimeStr)
    } else {
      setEndTime(updatedDateTimeStr)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '380px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
          {isEditing ? 'Hantera bokning ✏️' : 'Ny bokning 📅'}
        </h3>
        
        <form onSubmit={(e) => onSave(e, services[selectedService].name, calculatedPrice)}>
          
          {/* KUNDNAMN */}
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

          {/* TIDSHANTERING PÅ SAMMA RAD (Snyggt och kompakt) */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Starttid:</label>
              <input 
                type="time" 
                value={getTimeString(startTime)}
                onChange={(e) => handleTimeChange(e.target.value, true)}
                required
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontFamily: 'Arial', fontSize: '16px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Sluttid:</label>
              <input 
                type="time" 
                value={getTimeString(endTime)}
                onChange={(e) => handleTimeChange(e.target.value, false)}
                required
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontFamily: 'Arial', fontSize: '16px' }}
              />
            </div>
          </div>

          {/* VÄLJ TJÄNST */}
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

          {/* PRISPANEL */}
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

          {/* KNAPPAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Avbryt
            </button>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {isEditing && (
                <button type="button" onClick={onDelete} style={{ padding: '10px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🗑️
                </button>
              )}
              <button type="submit" style={{ padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isEditing ? 'Spara' : 'Boka pass'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal