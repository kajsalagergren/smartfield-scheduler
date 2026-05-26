import { useState } from 'react'
import { DEFAULT_SERVICES } from '../constants/services'
import { DEFAULT_CUSTOMERS } from '../constants/customers'

export function useScheduler() {
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [customerManagerOpen, setCustomerManagerOpen] = useState(false) // NYTT: State för kundlistan
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

  // UPPDATERAD: Tar nu även emot 'comment' och 'isInvoiced' i slutet!
  const handleSaveBooking = (e, tasks, finalPrice, customerId, calculatedEndTime, comment, isInvoiced) => {
    if (e) e.preventDefault()
    
    const currentCustomer = customers[customerId]
    
    // Skapa en snygg titel baserad på alla valda tjänster
    const serviceNames = tasks.map(t => services[t.serviceKey]?.name || 'Okänd').join(', ')
    
    // Om den är fakturerad lägger vi till en liten bock i kalendertiteln!
    const invoiceEmoji = isInvoiced ? '✅ ' : ''
    const displayTitle = currentCustomer 
      ? `${invoiceEmoji}${currentCustomer.name} - ${serviceNames}` 
      : `${invoiceEmoji}Okänd - ${serviceNames}`
    
    // NYTT: Bestäm färg automatiskt – gråblå (#94a3b8) om fakturerad, annars grön
    const backgroundColor = isInvoiced ? '#94a3b8' : '#2ecc71'
    const borderColor = isInvoiced ? '#64748b' : '#27ae60'
    
    if (selectedBooking) {
      // UPPDATERA BEFINTLIG BOKNING
      const updatedBookings = bookings.map(b => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            title: displayTitle,
            start: selectedStart,
            end: calculatedEndTime,
            backgroundColor, // Uppdaterar färg live
            borderColor,     // Uppdaterar kantfärg live
            extendedProps: { 
              customerId, 
              price: finalPrice, 
              rutPrice: finalPrice * 0.5,
              tasks,
              comment,       // Sparar kommentaren i datan
              isInvoiced     // Sparar fakturastatusen i datan
            }
          }
        }
        return b
      })
      setBookings(updatedBookings)
    } else {
      // SKAPA EN HELT NY BOKNING
      const newBooking = {
        id: String(Date.now()),
        title: displayTitle,
        start: selectedStart,
        end: calculatedEndTime,
        backgroundColor, // Sätter färg direkt
        borderColor,     // Sätter kantfärg direkt
        extendedProps: { 
          customerId, 
          price: finalPrice, 
          rutPrice: finalPrice * 0.5,
          tasks,
          comment,       // Sparar kommentaren i datan
          isInvoiced     // Sparar fakturastatusen i datan
        }
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

  // NYTT: Funktion för att radera en kund helt från registret
  const handleDeleteCustomer = (customerId) => {
    const updatedCustomers = { ...customers }
    delete updatedCustomers[customerId]
    setCustomers(updatedCustomers)

    // Snygg extra-detalj: Om kunden raderas, döp om kundens bokningar i kalendern till "Raderad kund"
    const updatedBookings = bookings.map(b => {
      if (b.extendedProps.customerId === customerId) {
        const serviceName = b.title.split(' - ')[1] || ''
        return { ...b, title: `Raderad kund - ${serviceName}` }
      }
      return b
    })
    setBookings(updatedBookings)
  }

  return {
    modalOpen, setModalOpen,
    adminOpen, setAdminOpen,
    customerManagerOpen, setCustomerManagerOpen, // Skickas med ut
    selectedStart, setSelectedStart,
    selectedEnd, setSelectedEnd,
    customerName, setCustomerName,
    services, setServices,
    bookings,
    selectedBooking, setSelectedBooking,
    customers, setCustomers,
    handleDateSelect,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    handleSaveBooking,
    handleDeleteBooking,
    handleDeleteCustomer // Skickas med ut
  }
}