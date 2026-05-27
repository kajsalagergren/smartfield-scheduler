import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BookingModal from './components/BookingModal'
import AdminPanel from './components/AdminPanel'
import CustomerManager from './components/CustomerManager'

import { useScheduler } from './hooks/useScheduler'

function App() {
  const s = useScheduler()

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eaeded', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>SmartField-Scheduler 🌿</h1>
          <p style={{ margin: '3px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Smartare planering</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => s.setCustomerManagerOpen(true)} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Kunder 👥
          </button>
          <button onClick={() => s.setAdminOpen(true)} style={{ background: '#34495e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Inställningar ⚙️
          </button>
        </div>
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
          select={s.handleDateSelect}
          eventClick={s.handleEventClick} // UPPDATERAT: Enkelt klick på alla synliga bokningar
          eventDrop={s.handleEventDrop}     
          eventResize={s.handleEventResize} 
          events={s.bookings}
          height="auto" 
        />
      </div>

      <AdminPanel 
        isOpen={s.adminOpen} 
        onClose={() => s.setAdminOpen(false)} 
        services={s.services} 
        setServices={s.setServices}
        homeStreet={s.homeStreet}
        setHomeStreet={s.setHomeStreet}
        homeZip={s.homeZip}
        setHomeZip={s.setHomeZip}
        homeCity={s.homeCity}
        setHomeCity={s.setHomeCity}
      />

      <CustomerManager 
        isOpen={s.customerManagerOpen} 
        onClose={() => s.setCustomerManagerOpen(false)} 
        customers={s.customers} 
        setCustomers={s.setCustomers} 
        onDeleteCustomer={s.handleDeleteCustomer}
      />

      <BookingModal 
        isOpen={s.modalOpen}
        onClose={() => { s.setModalOpen(false); s.setSelectedBooking(null); }}
        onSave={s.handleSaveBooking}
        onDelete={s.handleDeleteBooking}
        customerName={s.customerName}      
        setCustomerName={s.setCustomerName}   
        startTime={s.selectedStart}
        setStartTime={s.setSelectedStart} 
        endTime={s.selectedEnd}
        setEndTime={s.setSelectedEnd}     
        services={s.services} 
        customers={s.customers}               
        setCustomers={s.setCustomers}         
        isEditing={!!s.selectedBooking}
        selectedBooking={s.selectedBooking}
        onCopyBooking={s.handleCopyBooking}
      />
    </div>
  )
}

export default App