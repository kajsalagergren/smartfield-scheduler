import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

function App() {
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
          locale="sv" // Gör kalendern svensk (dagar, månader etc.)
          slotMinTime="06:00" // Kalendern startar kl 06:00 på morgonen
          slotMaxTime="20:00" // Kalendern slutar kl 20:00 på kvällen
          allDaySlot={false} // Tar bort "Hela dagen"-fältet för att spara skärmutrymme
          editable={true}
          selectable={true}
          firstDay={1} // Sätter måndag som veckans första dag
        />
      </div>
    </div>
  )
}

export default App