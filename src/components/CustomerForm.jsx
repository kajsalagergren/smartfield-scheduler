import React from 'react'

function CustomerForm({ 
  name, setName, 
  phone, setPhone, 
  street, setStreet, 
  zip, setZip, 
  city, setCity 
}) {
  return (
    <div style={{ background: '#ebf5fb', padding: '15px', borderRadius: '6px', marginBottom: '15px', borderLeft: '4px solid #3498db' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>Personuppgifter (GDPR-säkrad lagring) 🔒</h4>
      <div style={{ marginBottom: '10px' }}>
        <input type="text" placeholder="Fullständigt namn" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input type="tel" placeholder="Telefonnummer" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input type="text" placeholder="Gatuadress (t.ex. Åsgatan 4)" value={street} onChange={(e) => setStreet(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="Postnummer" value={zip} onChange={(e) => setZip(e.target.value)} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
        <input type="text" placeholder="Ort" value={city} onChange={(e) => setCity(e.target.value)} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
      </div>
    </div>
  )
}

export default CustomerForm