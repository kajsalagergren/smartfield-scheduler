import React, { useState, useEffect } from 'react'

function BookingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  customerName,       // Detta är valt customerId (t.ex. 'customer_1')
  setCustomerName,   
  startTime, 
  setStartTime, 
  endTime, 
  setEndTime,   
  services,
  customers,
  setCustomers,
  isEditing 
}) {
  const [selectedService, setSelectedService] = useState(Object.keys(services)[0])
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [hours, setHours] = useState(0)

  // States för ny kund
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerStreet, setNewCustomerStreet] = useState('')
  const [newCustomerZip, setNewCustomerZip] = useState('')
  const [newCustomerCity, setNewCustomerCity] = useState('')

  // State för att redigera en BEFINTLIG kunds uppgifter direkt i fönstret
  const [isEditingExistingCustomer, setIsEditingExistingCustomer] = useState(false)
  const [editPhone, setEditPhone] = useState('')
  const [editStreet, setEditStreet] = useState('')
  const [editZip, setEditZip] = useState('')
  const [editCity, setEditCity] = useState('')

  // Hämta den aktiva kunden baserat på valt ID
  const activeCustomer = customers[customerName]

  // Synka redigeringsfälten när man väljer en kund eller går in i ändra-läge
  useEffect(() => {
    if (activeCustomer) {
      setEditPhone(activeCustomer.phone || '')
      setEditStreet(activeCustomer.street || '')
      setEditZip(activeCustomer.zip || '')
      setEditCity(activeCustomer.city || '')
    }
    setIsEditingExistingCustomer(false)
  }, [customerName, isOpen, customers])

  // Nollställ "Ny kund"-formuläret vid stängning
  useEffect(() => {
    if (!isOpen) {
      setIsCreatingNewCustomer(false)
      setNewCustomerName('')
      setNewCustomerPhone('')
      setNewCustomerStreet('')
      setNewCustomerZip('')
      setNewCustomerCity('')
    }
  }, [isOpen])

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

  const getTimeString = (dateTimeStr) => {
    if (!dateTimeStr || !dateTimeStr.includes('T')) return '00:00'
    return dateTimeStr.split('T')[1].substring(0, 5)
  }

  const handleTimeChange = (newTimeStr, isStart) => {
    const currentDateTimeStr = isStart ? startTime : endTime
    if (!currentDateTimeStr) return
    const datePart = currentDateTimeStr.split('T')[0]
    const updatedDateTimeStr = `${datePart}T${newTimeStr}:00`
    if (isStart) setStartTime(updatedDateTimeStr)
    else setEndTime(updatedDateTimeStr)
  }

  // Sparar ändringar på en befintlig kunds kontaktuppgifter
  const handleUpdateCustomerDetails = () => {
    if (!customerName) return
    setCustomers({
      ...customers,
      [customerName]: {
        ...customers[customerName],
        phone: editPhone,
        street: editStreet,
        zip: editZip,
        city: editCity
      }
    })
    setIsEditingExistingCustomer(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let finalCustomerId = customerName

    // Om man väljer att skapa en helt ny kund (oavsett om det är nybokning eller redigering)
    if (isCreatingNewCustomer) {
      finalCustomerId = 'customer_' + Date.now()
      setCustomers({
        ...customers,
        [finalCustomerId]: {
          name: newCustomerName,
          phone: newCustomerPhone,
          street: newCustomerStreet,
          zip: newCustomerZip,
          city: newCustomerCity
        }
      })
    }

    onSave(e, services[selectedService].name, calculatedPrice, finalCustomerId)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '430px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
          {isEditing ? 'Hantera bokning ✏️' : 'Ny bokning 📅'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          
          {/* KUNDVÄLJARE (Nu med "+ Lägg till ny kund..." tillgängligt ALLTID) */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Välj kund:</label>
            <select
              value={isCreatingNewCustomer ? 'new' : customerName}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsCreatingNewCustomer(true)
                } else {
                  setIsCreatingNewCustomer(false)
                  setCustomerName(e.target.value)
                }
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff', fontSize: '15px' }}
            >
              {Object.keys(customers).map((key) => (
                <option key={key} value={key}>{customers[key].name}</option>
              ))}
              <option value="new" style={{ fontWeight: 'bold', color: '#3498db' }}>+ Lägg till ny kund...</option>
            </select>
          </div>

          {/* VISA OCH REDIGERA KONTAKTUPPGIFTER FÖR VALD KUND (Döljs om vi skapar en ny) */}
          {!isCreatingNewCustomer && activeCustomer && (
            <div style={{ background: '#f4f6f7', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', borderLeft: '4px solid #7f8c8d' }}>
              {!isEditingExistingCustomer ? (
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>📞 <strong>Tel:</strong> {activeCustomer.phone}</p>
                  <p style={{ margin: '0 0 8px 0' }}>📍 <strong>Adress:</strong> {activeCustomer.street}, {activeCustomer.zip} {activeCustomer.city}</p>
                  <button type="button" onClick={() => setIsEditingExistingCustomer(true)} style={{ background: 'none', border: 'none', color: '#2980b9', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '13px' }}>
                    Ändra kunduppgifter ✏️
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong style={{ color: '#2c3e50', fontSize: '13px' }}>Uppdatera kunduppgifter:</strong>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Telefonnummer" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                  <input type="text" value={editStreet} onChange={(e) => setEditStreet(e.target.value)} placeholder="Gatuadress" style={{ padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={editZip} onChange={(e) => setEditZip(e.target.value)} placeholder="Postnr" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                    <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Ort" style={{ flex: 2, padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button type="button" onClick={handleUpdateCustomerDetails} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Spara ändring</button>
                    <button type="button" onClick={() => setIsEditingExistingCustomer(false)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Avbryt</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMULÄR FÖR NY KUND */}
          {isCreatingNewCustomer && (
            <div style={{ background: '#ebf5fb', padding: '15px', borderRadius: '6px', marginBottom: '15px', borderLeft: '4px solid #3498db' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>Personuppgifter (GDPR-säkrad lagring) 🔒</h4>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" placeholder="Fullständigt namn" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input type="tel" placeholder="Telefonnummer" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" placeholder="Gatuadress (t.ex. Åsgatan 4)" value={newCustomerStreet} onChange={(e) => setNewCustomerStreet(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Postnummer" value={newCustomerZip} onChange={(e) => setNewCustomerZip(e.target.value)} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                <input type="text" placeholder="Ort" value={newCustomerCity} onChange={(e) => setNewCustomerCity(e.target.value)} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
              </div>
            </div>
          )}

          {/* TIDSHANTERING */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Start:</label>
              <input type="time" value={getTimeString(startTime)} onChange={(e) => handleTimeChange(e.target.value, true)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '16px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Slut:</label>
              <input type="time" value={getTimeString(endTime)} onChange={(e) => handleTimeChange(e.target.value, false)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '16px' }} />
            </div>
          </div>

          {/* VÄLJ TJÄNST */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Välj tjänst:</label>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff' }}>
              {Object.keys(services).map((key) => (
                <option key={key} value={key}>{services[key].name} ({services[key].hourlyRate} kr/h)</option>
              ))}
            </select>
          </div>

          {/* PRISPANEL */}
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #2ecc71' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>Tidsåtgång: <strong>{hours.toFixed(1)} timmar</strong></p>
            <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2c3e50' }}>Originalpris: <strong>{calculatedPrice.toFixed(0)} kr</strong></p>
            <p style={{ margin: '0', fontSize: '18px', color: '#27ae60', fontWeight: 'bold' }}>Med RUT-avdrag (50%): { (calculatedPrice * 0.5).toFixed(0) } kr</p>
          </div>

          {/* KNAPPAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Avbryt</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isEditing && (
                <button type="button" onClick={onDelete} style={{ padding: '10px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️</button>
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