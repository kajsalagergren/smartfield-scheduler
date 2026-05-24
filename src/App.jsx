import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BookingModal from './components/BookingModal'

// IMPORTERAR STANDARDTJÄNSTERNA 
import { DEFAULT_SERVICES } from './constants/services'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStart, setSelectedStart] = useState('')
  const [selectedEnd, setSelectedEnd] = useState('')
  const [customerName, setCustomerName] = useState('')
  
  // Lägger tjänsterna i ett State! 
  // Detta gör att vi i framtiden kan lägga till/ta bort tjänster live i appen.
  const [services, setServices] = useState(DEFAULT_SERVICES)

  const handleDateSelect = (selectInfo) => {
    setSelectedStart(selectInfo.startStr)
    setSelectedEnd(selectInfo.endStr)
    setModalOpen(true)
  }

  const handleSaveBooking = (e, serviceName, finalPrice) => {
    e.preventDefault()
    console.log('Bokning sparad i systemet:', {
      kund: customerName,
      tjänst: serviceName,
      start: selectedStart,
      slut: selectedEnd,
      totalPris: finalPrice,
      rutPris: finalPrice * 0.5
    })
    setModalOpen(false)
    setCustomerName('')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>SmartField-Scheduler 🌿</h1>
        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Smartare planering</p>
      </header>
      
      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
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
        />
      </div>

      {/* SKICKAR MED SERVICES TILL MODALEN HÄR */}
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