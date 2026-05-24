import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BookingModal from './components/BookingModal'
import AdminPanel from './components/AdminPanel'
import { DEFAULT_SERVICES } from './constants/services'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [selectedStart, setSelectedStart] = useState('')
  const [selectedEnd, setSelectedEnd] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [bookings, setBookings] = useState([])

  const handleDateSelect = (selectInfo) => {
    setSelectedStart(selectInfo.startStr)
    setSelectedEnd(selectInfo.endStr)
    setModalOpen(true)
  }

  const handleSaveBooking = (e, serviceName, finalPrice) => {
    e.preventDefault()
    
    const newBooking = {
      id: String(Date.now()),
      title: `${customerName} - ${serviceName}`,
      start: selectedStart,
      end: selectedEnd,
      backgroundColor: '#2ecc71',
      borderColor: '#27ae60',
      extendedProps: {
        price: finalPrice,
        rutPrice: finalPrice * 0.5
      }
    }

    setBookings([...bookings, newBooking])
    setModalOpen(false)
    setCustomerName('')
  }

  return (
    // VIKTIGT: Vi tar bort alla fasta bredder (maxWidth) härifrån så appen fyller skärmen
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        borderBottom: '1px solid #eaeded',
        paddingBottom: '15px'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>SmartField-Scheduler 🌿</h1>
          <p style={{ margin: '3px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Smartare planering</p>
        </div>
        <button 
          onClick={() => setAdminOpen(true)}
          style={{
            background: '#34495e', color: '#fff', border: 'none', 
            padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Inställningar ⚙️
        </button>
      </header>
      
      {/* KALENDERBOXEN: Tvingas nu till bredast möjliga yta */}
      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title', // Sätter tillbaka titeln i mitten
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="sv"
          slotMinTime="06:00"
          slotMaxTime="20:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          firstDay={1}
          select={handleDateSelect}
          events={bookings}
          height="auto" // Tvingar kalendern att hålla ett brett, snyggt datorformat
        />
      </div>

      <AdminPanel 
        isOpen={adminOpen} 
        onClose={() => setAdminOpen(false)} 
        services={services} 
        setServices={setServices} 
      />

      <BookingModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveBooking}
        customerName={customerName}
        setCustomerName={setCustomerName}
        startTime={selectedStart}
        endTime={selectedEnd}
        services={services} 
      />
    </div>
  )
}

export default App