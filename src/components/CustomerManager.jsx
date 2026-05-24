import React, { useState } from 'react'
import CustomerForm from './CustomerForm'

function CustomerManager({ isOpen, onClose, customers, setCustomers, onDeleteCustomer }) {
  // States för att skapa en helt ny kund i registret
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')

  // State för att hålla koll på om man redigerar en kund i listan
  const [editingId, setEditingId] = useState(null)

  if (!isOpen) return null

  const handleAddCustomer = (e) => {
    e.preventDefault()
    const newId = 'customer_' + Date.now()
    
    setCustomers({
      ...customers,
      [newId]: { name, phone, street, zip, city }
    })

    // Nollställ fälten
    setName('')
    setPhone('')
    setStreet('')
    setZip('')
    setCity('')
  }

  const handleSaveEdit = (id, updatedData) => {
    setCustomers({
      ...customers,
      [id]: { ...customers[id], ...updatedData }
    })
    setEditingId(null)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', fontFamily: 'Arial, sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Kundregister 👥</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#95a5a6' }}>&times;</button>
        </div>

        {/* REGLERAD REGISTRERING (LÄGG TILL NY KUND UTAN BOKNING) */}
        <form onSubmit={handleAddCustomer} style={{ marginBottom: '25px' }}>
          <strong style={{ display: 'block', marginBottom: '8px', color: '#2c3e50', fontSize: '15px' }}>+ Registrera ny kund i databasen</strong>
          <CustomerForm 
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            street={street} setStreet={setStreet}
            zip={zip} setZip={setZip}
            city={city} setCity={setCity}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Lägg till i registret
          </button>
        </form>

        {/* LISTAN PÅ ALLA SPARADE KUNDER */}
        <strong style={{ display: 'block', marginBottom: '10px', color: '#2c3e50', borderTop: '1px solid #eee', paddingTop: '15px' }}>Sparade kunder ({Object.keys(customers).length} st)</strong>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(customers).map((key) => {
            const customer = customers[key]
            const isEditingThis = editingId === key

            return (
              <div key={key} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', background: '#f8fafc' }}>
                {!isEditingThis ? (
                  // Visningsläge för raden
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b' }}>{customer.name}</h5>
                      <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#64748b' }}>📞 {customer.phone}</p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>📍 {customer.street}, {customer.zip} {customer.city}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => setEditingId(key)} style={{ padding: '4px 8px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Ändra</button>
                      <button onClick={() => { if(confirm(`Vill du verkligen radera ${customer.name}?`)) onDeleteCustomer(key) }} style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Ta bort</button>
                    </div>
                  </div>
                ) : (
                  // Inline redigeringsläge för raden
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>Ändrar: {customer.name}</strong>
                    <input type="text" defaultValue={customer.phone} id={`edit-p-${key}`} placeholder="Telefon" style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    <input type="text" defaultValue={customer.street} id={`edit-s-${key}`} placeholder="Adress" style={{ padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="text" defaultValue={customer.zip} id={`edit-z-${key}`} placeholder="Postnr" style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                      <input type="text" defaultValue={customer.city} id={`edit-c-${key}`} placeholder="Ort" style={{ flex: 2, padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '4px' }}>
                      <button type="button" onClick={() => handleSaveEdit(key, {
                        phone: document.getElementById(`edit-p-${key}`).value,
                        street: document.getElementById(`edit-s-${key}`).value,
                        zip: document.getElementById(`edit-z-${key}`).value,
                        city: document.getElementById(`edit-c-${key}`).value,
                      })} style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Spara</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ padding: '5px 10px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Avbryt</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default CustomerManager