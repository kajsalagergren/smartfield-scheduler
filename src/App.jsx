import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BookingModal from './components/BookingModal'
import AdminPanel from './components/AdminPanel'
import { DEFAULT_SERVICES } from './constants/services'
import { DEFAULT_CUSTOMERS } from './constants/customers'

function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [selectedStart, setSelectedStart] = useState('')
  const [selectedEnd, setSelectedEnd] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [bookings, setBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [customers, setCustomers] = useState(DEFAULT_CUSTOMERS)

  const handleDateSelect = (selectInfo) => {
    setSelectedBooking(null)
    setSelectedStart(selectInfo.startStr)
    setSelectedEnd(selectInfo.endStr)
    setCustomerName(Object.keys(customers)[0] || '')
    setModalOpen(true)
  }

  const handleEventClick = (clickInfo) => {
    const bookingId = clickInfo.event.id
    const foundBooking = bookings.find(b => b.id === bookingId)
    
    if (foundBooking) {
      setSelectedBooking(foundBooking)
      setSelectedStart(foundBooking.start)
      setSelectedEnd(foundBooking.end)
      setCustomerName(foundBooking.extendedProps.customerId)
      setModalOpen(true)
    }
  }

  const handleEventDrop = (dropInfo) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === dropInfo.event.id) {
        return { ...b, start: dropInfo.event.startStr, end: dropInfo.event.endStr }
      }
      return b
    })
    setBookings(updatedBookings)
  }

  const handleEventResize = (resizeInfo) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === resizeInfo.event.id) {
        return { ...b, start: resizeInfo.event.startStr, end: resizeInfo.event.endStr }
      }
      return b
    })
    setBookings(updatedBookings)
  }

  const handleSaveBooking = (e, serviceName, finalPrice, customerId) => {
    e.preventDefault()
    
    const currentCustomer = customers[customerId]
    const displayTitle = currentCustomer ? `${currentCustomer.name} - ${serviceName}` : `Okänd - ${serviceName}`
    
    if (selectedBooking) {
      const updatedBookings = bookings.map(b => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            title: displayTitle,
            start: selectedStart,
            end: selectedEnd,
            extendedProps: { customerId: customerId, price: finalPrice, rutPrice: finalPrice * 0.5 }
          }
        }
        return b
      })
      setBookings(updatedBookings)
    } else {
      const newBooking = {
        id: String(Date.now()),
        title: displayTitle,
        start: selectedStart,
        end: selectedEnd,
        backgroundColor: '#2ecc71',
        borderColor: '#27ae60',
        extendedProps: { customerId: customerId, price: finalPrice, rutPrice: finalPrice * 0.5 }
      }
      setBookings([...bookings, newBooking])
    }

    setModalOpen(false)
  }

  const handleDeleteBooking = () => {
    if (!selectedBooking) return
    const filteredBookings = bookings.filter(b => b.id !== selectedBooking.id)
    setBookings(filteredBookings)
    setModalOpen(false)
    setSelectedBooking(null)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eaeded', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>SmartField-Scheduler 🌿</h1>
          <p style={{ margin: '3px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Smartare planering</p>
        </div>
        <button onClick={() => setAdminOpen(true)} style={{ background: '#34495e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          Inställningar ⚙️
        </button>
      </header>
      
      <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          locale="sv"
          slotMinTime="06:00"
          slotMaxTime="20:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          firstDay={1}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}     
          eventResize={handleEventResize} 
          events={bookings}
          height="auto" 
        />
      </div>

      <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} services={services} setServices={setServices} />

      <BookingModal 
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedBooking(null); }}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
        customerName={customerName}       
        setCustomerName={setCustomerName}   
        startTime={selectedStart}
        setStartTime={setSelectedStart} 
        endTime={selectedEnd}
        setEndTime={setSelectedEnd}     
        services={services} 
        customers={customers}               
        setCustomers={setCustomers}         
        isEditing={!!selectedBooking}
      />
    </div>
  )
}

export default App