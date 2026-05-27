import React, { useState, useEffect, useCallback } from 'react'
import CustomerForm from './CustomerForm'
import TaskForm from './TaskForm'
import RepeatForm from './RepeatForm'

function BookingModal({ 
  isOpen, onClose, onSave, onDelete, 
  customerName, setCustomerName,   
  startTime, setStartTime, 
  endTime, setEndTime,   
  services, customers, setCustomers, isEditing, selectedBooking,
  onCopyBooking
}) {
  const [tasks, setTasks] = useState([])
  const [finalPrice, setFinalPrice] = useState(0)
  const [calculatedEndTime, setCalculatedEndTime] = useState('')
  const [comment, setComment] = useState('')
  const [isInvoiced, setIsInvoiced] = useState(false)

  const [repeatType, setRepeatType] = useState('none')
  const [repeatCount, setRepeatCount] = useState(4)

  const [copyDate, setCopyDate] = useState('')
  const [copyTime, setCopyTime] = useState('') // GÅRDAGENS FIX: Håller koll på klontiden
  const [showCopySection, setShowCopySection] = useState(false)

  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerStreet, setNewCustomerStreet] = useState('')
  const [newCustomerZip, setNewCustomerZip] = useState('')
  const [newCustomerCity, setNewCustomerCity] = useState('')

  const [isEditingExistingCustomer, setIsEditingExistingCustomer] = useState(false)
  const [editPhone, setEditPhone] = useState('')
  const [editStreet, setEditStreet] = useState('')
  const [editZip, setEditZip] = useState('')
  const [editCity, setEditCity] = useState('')

  const activeCustomer = customers[customerName]

  const getTimeString = (dateTimeStr) => {
    if (!dateTimeStr || typeof dateTimeStr !== 'string' || !dateTimeStr.includes('T')) {
      return '00:00'
    }
    return dateTimeStr.split('T')[1].substring(0, 5)
  }

  useEffect(() => {
    if (isOpen) {
      setShowCopySection(false)
      setCopyDate('')
      setRepeatType('none')
      setRepeatCount(4)
      setCopyTime(getTimeString(startTime)) // GÅRDAGENS FIX: Sätt nuvarande tid som grund för klonen
      if (isEditing && selectedBooking) {
        setTasks(JSON.parse(JSON.stringify(selectedBooking.extendedProps?.tasks || [])))
        setComment(selectedBooking.extendedProps?.comment || '')
        setIsInvoiced(selectedBooking.extendedProps?.isInvoiced || false)
      } else {
        setTasks([{ serviceKey: Object.keys(services)[0], minutes: 60, customPrice: '' }])
        setComment('')
        setIsInvoiced(false)
      }
    }
  }, [isOpen, isEditing, selectedBooking, services, startTime])

  useEffect(() => {
    if (activeCustomer) {
      setEditPhone(activeCustomer.phone || '')
      setEditStreet(activeCustomer.street || '')
      setEditZip(activeCustomer.zip || '')
      setEditCity(activeCustomer.city || '')
    }
    setIsEditingExistingCustomer(false)
  }, [customerName, isOpen, customers])

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

  const handleCalculationUpdate = useCallback((data) => {
    setFinalPrice(data.calculatedPrice)
    setCalculatedEndTime(data.calculatedEndTime)
  }, [])

  if (!isOpen) return null

  const handleStartTimeChange = (newTimeStr) => {
    if (!startTime || typeof startTime !== 'string') return
    const datePart = startTime.includes('T') ? startTime.split('T')[0] : startTime
    const updated = `${datePart}T${newTimeStr}:00`
    setStartTime(updated)
  }

  const handleUpdateCustomerDetails = () => {
    if (!customerName) return
    setCustomers({
      ...customers,
      [customerName]: { ...customers[customerName], phone: editPhone, street: editStreet, zip: editZip, city: editCity }
    })
    setIsEditingExistingCustomer(false)
  }

  const handleDirectCopy = () => {
    if (!copyDate || !copyTime) return
    let finalCustomerId = customerName

    if (isCreatingNewCustomer) {
      finalCustomerId = 'customer_' + Date.now()
      setCustomers({
        ...customers,
        [finalCustomerId]: { name: newCustomerName, phone: newCustomerPhone, street: newCustomerStreet, zip: newCustomerZip, city: newCustomerCity }
      })
    }

    // GÅRDAGENS FIX: Skickar med copyTime (tredje argumentet)
    onCopyBooking(copyDate, {
      tasks,
      finalPrice,
      customerId: finalCustomerId,
      startTime,
      calculatedEndTime,
      comment
    }, copyTime)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let finalCustomerId = customerName

    if (isCreatingNewCustomer) {
      finalCustomerId = 'customer_' + Date.now()
      setCustomers({
        ...customers,
        [finalCustomerId]: { name: newCustomerName, phone: newCustomerPhone, street: newCustomerStreet, zip: newCustomerZip, city: newCustomerCity }
      })
    }
    onSave(e, tasks, finalPrice, finalCustomerId, calculatedEndTime, comment, isInvoiced, repeatType, repeatCount)
  }

  // DAGENS FIX: Hämtar ut restidsdatan från bokningen
  const travelBefore = selectedBooking?.extendedProps?.travelMinutesBefore
  const travelLabelBefore = selectedBooking?.extendedProps?.travelLabelBefore || 'Hemmet'
  const travelAfter = selectedBooking?.extendedProps?.travelMinutesAfter
  const travelLabelAfter = selectedBooking?.extendedProps?.travelLabelAfter || 'Hemmet'

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
          {isEditing ? 'Hantera bokning ✏️' : 'Ny bokning 📅'}
        </h3>
        
        {/* DAGENS FIX: Restids-info helt utan att störa din design */}
        {isEditing && ((travelBefore && travelBefore > 0) || (travelAfter && travelAfter > 0)) && (
          <div style={{ background: '#fff9db', border: '1px solid #ffe066', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', color: '#856404' }}>
            <strong>🚗 Beräknade körtider:</strong>
            {travelBefore > 0 && <div style={{ marginTop: '4px' }}>• Körtid hit: {travelBefore} min (från {travelLabelBefore})</div>}
            {travelAfter > 0 && <div style={{ marginTop: '2px' }}>• Körtid efteråt: {travelAfter} min (till {travelLabelAfter})</div>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* KUNDVÄLJARE */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Välj kund:</label>
            <select
              value={isCreatingNewCustomer ? 'new' : customerName}
              onChange={(e) => {
                if (e.target.value === 'new') setIsCreatingNewCustomer(true)
                else { setIsCreatingNewCustomer(false); setCustomerName(e.target.value); }
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff', fontSize: '15px' }}
            >
              {Object.keys(customers).map((key) => (
                <option key={key} value={key}>{customers[key].name}</option>
              ))}
              <option value="new" style={{ fontWeight: 'bold', color: '#3498db' }}>+ Lägg till ny kund...</option>
            </select>
          </div>

          {/* INFOBOX FÖR KUND */}
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
                    <button type="button" onClick={handleUpdateCustomerDetails} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Spara</button>
                    <button type="button" onClick={() => setIsEditingExistingCustomer(false)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Avbryt</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMULÄR FÖR NY KUND */}
          {isCreatingNewCustomer && (
            <CustomerForm 
              name={newCustomerName} setName={setNewCustomerName}
              phone={newCustomerPhone} setPhone={setNewCustomerPhone}
              street={newCustomerStreet} setStreet={setNewCustomerStreet}
              zip={newCustomerZip} setZip={setNewCustomerZip}
              city={newCustomerCity} setCity={setNewCustomerCity}
            />
          )}

          {/* STARTTID */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Bokningens starttid:</label>
            <input type="time" value={getTimeString(startTime)} onChange={(e) => handleStartTimeChange(e.target.value)} required style={{ width: '40%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '16px' }} />
          </div>

          {/* MOMENT-FORMULÄRET */}
          {isOpen && tasks.length > 0 && typeof startTime === 'string' && (
            <TaskForm 
              services={services}
              tasks={tasks}
              setTasks={setTasks}
              startTime={startTime}
              onCalculated={handleCalculationUpdate}
            />
          )}

          {/* UPPREPNINGSKOMPONENT */}
          <RepeatForm 
            repeatType={repeatType}
            setRepeatType={setRepeatType}
            repeatCount={repeatCount}
            setRepeatCount={setRepeatCount}
          />

          {/* INTERNAL KOMMENTAR-RUTA */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Kommentar / Anteckning:</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Nyckeln finns under krukan..."
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '14px', fontFamily: 'Arial, sans-serif', height: '60px', resize: 'vertical' }}
            />
          </div>

          {/* CHECKRUTA FÖR FAKTURERAD */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="isInvoiced"
              checked={isInvoiced}
              onChange={(e) => setIsInvoiced(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isInvoiced" style={{ fontWeight: 'bold', color: '#34495e', cursor: 'pointer', fontSize: '14px' }}>
              Markera som fakturerad ✅
            </label>
          </div>

          {/* KOPIERINGS-PANEL – NU MED BÅDE DATUM OCH TID IGEN 📋 */}
          <div style={{ marginBottom: '20px', background: '#34495e', padding: '12px', borderRadius: '6px' }}>
            {!showCopySection ? (
              <button 
                type="button" 
                onClick={() => setShowCopySection(true)}
                style={{ width: '100%', padding: '8px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                📋 Snabba på: Kopiera detta pass till ett annat datum också...
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Välj datum och tid att direkt-klona detta till:</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {/* Datumväljare */}
                  <input 
                    type="date" 
                    value={copyDate}
                    onChange={(e) => setCopyDate(e.target.value)}
                    style={{ flex: 2, padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff' }}
                  />
                  {/* GÅRDAGENS FIX: Tidväljare för kopian */}
                  <input 
                    type="time" 
                    value={copyTime}
                    onChange={(e) => setCopyTime(e.target.value)}
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff' }}
                  />
                  <button 
                    type="button" 
                    disabled={!copyDate || !copyTime}
                    onClick={handleDirectCopy}
                    style={{ padding: '6px 12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: (copyDate && copyTime) ? 'pointer' : 'not-allowed' }}
                  >
                    Klona!
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCopySection(false)}
                    style={{ padding: '6px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* KNAPPAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Avbryt</button>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isEditing && (
                <button type="button" onClick={onDelete} style={{ padding: '10px 15px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️</button>
              )}
              <button type="submit" style={{ padding: '10px 20px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isEditing ? 'Spara ändringar' : 'Boka pass'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal