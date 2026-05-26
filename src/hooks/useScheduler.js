import { useState } from 'react'
import { DEFAULT_SERVICES } from '../constants/services'
import { DEFAULT_CUSTOMERS } from '../constants/customers'

export function useScheduler() {
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [customerManagerOpen, setCustomerManagerOpen] = useState(false)
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

  const pad = (num) => String(num).padStart(2, '0')
  const format = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

// UPPDATERAD IGEN: Nu kan man även styra klockslaget för den klonade bokningen!
  const handleCopyBooking = (targetDateStr, directData = null, chosenTime = null) => {
    if (!targetDateStr) return

    let sourceTasks = []
    let sourceCustomerId = ''
    let sourceComment = ''
    let durationMs = 60 * 60 * 1000 // Standard 1 timme
    let sourceHours = 8, sourceMinutes = 0
    let currentBookingsList = [...bookings]

    if (directData) {
      // SCENARIO 1: Direkt-kloning från fönstret
      sourceTasks = directData.tasks
      sourceCustomerId = directData.customerId
      sourceComment = directData.comment
      durationMs = new Date(directData.calculatedEndTime) - new Date(directData.startTime)
      
      const d = new Date(directData.startTime)
      sourceHours = d.getHours()
      sourceMinutes = d.getMinutes()

      // --- Spara originalpasset först ---
      const currentCustomer = customers[sourceCustomerId]
      const serviceNames = sourceTasks.map(t => services[t.serviceKey]?.name || 'Okänd').join(', ')
      const displayTitleOriginal = currentCustomer ? `${currentCustomer.name} - ${serviceNames}` : `Okänd - ${serviceNames}`

      if (selectedBooking) {
        currentBookingsList = bookings.map(b => {
          if (b.id === selectedBooking.id) {
            return {
              ...b,
              title: displayTitleOriginal,
              start: selectedStart,
              end: directData.calculatedEndTime,
              extendedProps: { customerId: sourceCustomerId, price: directData.finalPrice, rutPrice: directData.finalPrice * 0.5, tasks: sourceTasks, comment: sourceComment, isInvoiced: selectedBooking.extendedProps.isInvoiced }
            }
          }
          return b
        })
      } else {
        currentBookingsList.push({
          id: String(Date.now() + '_orig'),
          title: displayTitleOriginal,
          start: selectedStart,
          end: directData.calculatedEndTime,
          backgroundColor: '#2ecc71',
          borderColor: '#27ae60',
          extendedProps: { customerId: sourceCustomerId, price: directData.finalPrice, rutPrice: directData.finalPrice * 0.5, tasks: JSON.parse(JSON.stringify(sourceTasks)), comment: sourceComment, isInvoiced: false }
        })
      }
    } else if (selectedBooking) {
      // SCENARIO 2: Kloning av redan sparat pass
      sourceTasks = selectedBooking.extendedProps.tasks
      sourceCustomerId = selectedBooking.extendedProps.customerId
      sourceComment = selectedBooking.extendedProps.comment
      durationMs = new Date(selectedBooking.end) - new Date(selectedBooking.start)
      
      const d = new Date(selectedBooking.start)
      sourceHours = d.getHours()
      sourceMinutes = d.getMinutes()
    }

    // --- Bestäm klockslag för kopian ---
    let cloneHours = sourceHours
    let cloneMinutes = sourceMinutes

    // Om svärfar har valt en specifik tid i den nya rutan, så tolkar vi den ("HH:MM")
    if (chosenTime && chosenTime.includes(':')) {
      const parts = chosenTime.split(':')
      cloneHours = parseInt(parts[0], 10)
      cloneMinutes = parseInt(parts[1], 10)
    }

    // --- Skapa kopian på det nya måldatumet med det valda klockslaget ---
    const currentCustomer = customers[sourceCustomerId]
    const serviceNames = sourceTasks.map(t => services[t.serviceKey]?.name || 'Okänd').join(', ')
    const displayTitleClone = currentCustomer ? `${currentCustomer.name} - ${serviceNames}` : `Okänd - ${serviceNames}`

    const newStart = new Date(targetDateStr)
    newStart.setHours(cloneHours, cloneMinutes, 0, 0)
    const newEnd = new Date(newStart.getTime() + durationMs)

    const clonedBooking = {
      id: String(Date.now() + '_clone'),
      title: displayTitleClone,
      start: format(newStart),
      end: format(newEnd),
      backgroundColor: '#2ecc71',
      borderColor: '#27ae60',
      extendedProps: {
        customerId: sourceCustomerId,
        price: directData ? directData.finalPrice : selectedBooking.extendedProps.price,
        rutPrice: (directData ? directData.finalPrice : selectedBooking.extendedProps.price) * 0.5,
        tasks: JSON.parse(JSON.stringify(sourceTasks)),
        comment: sourceComment,
        isInvoiced: false
      }
    }

    setBookings([...currentBookingsList, clonedBooking])
    setModalOpen(false)
    setSelectedBooking(null)
  }

  // UPPDATERAD: Skapar serier oavsett om det är en ny bokning eller om man uppdaterar en gammal!
  const handleSaveBooking = (e, tasks, finalPrice, customerId, calculatedEndTime, comment, isInvoiced, repeatType = 'none', repeatCount = 4) => {
    if (e) e.preventDefault()
    
    const currentCustomer = customers[customerId]
    const serviceNames = tasks.map(t => services[t.serviceKey]?.name || 'Okänd').join(', ')
    const invoiceEmoji = isInvoiced ? '✅ ' : ''
    const displayTitle = currentCustomer ? `${invoiceEmoji}${currentCustomer.name} - ${serviceNames}` : `${invoiceEmoji}Okänd - ${serviceNames}`
    const backgroundColor = isInvoiced ? '#94a3b8' : '#2ecc71'
    const borderColor = isInvoiced ? '#64748b' : '#27ae60'
    
    let baseStart = new Date(selectedStart)
    let durationMs = new Date(calculatedEndTime) - baseStart
    let updatedBookings = [...bookings]

    if (selectedBooking) {
      // 1. Uppdatera det aktuella passet först
      updatedBookings = bookings.map(b => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            title: displayTitle,
            start: selectedStart,
            end: calculatedEndTime,
            backgroundColor,
            borderColor,
            extendedProps: { customerId, price: finalPrice, rutPrice: finalPrice * 0.5, tasks, comment, isInvoiced }
          }
        }
        return b
      })
    } else {
      // Skapa det första passet om det är helt nytt
      updatedBookings.push({
        id: String(Date.now()),
        title: displayTitle,
        start: format(baseStart),
        end: format(new Date(baseStart.getTime() + durationMs)),
        backgroundColor,
        borderColor,
        extendedProps: { customerId, price: finalPrice, rutPrice: finalPrice * 0.5, tasks, comment, isInvoiced }
      })
    }

    // 2. Om användaren dessutom valde en upprepning, spottar vi ut EXTRA framtida pass!
    if (repeatType !== 'none') {
      const extraPassesCount = selectedBooking ? repeatCount - 1 : repeatCount - 1
      const startLoopIndex = 1

      for (let i = startLoopIndex; i <= extraPassesCount; i++) {
        const loopStart = new Date(baseStart.getTime())
        
        if (repeatType === 'weekly') {
          loopStart.setDate(baseStart.getDate() + (i * 7))
        } else if (repeatType === 'biweekly') {
          loopStart.setDate(baseStart.getDate() + (i * 14))
        } else if (repeatType === 'monthly') {
          loopStart.setMonth(baseStart.getMonth() + i)
        }

        const loopEnd = new Date(loopStart.getTime() + durationMs)
        
        updatedBookings.push({
          id: String(Date.now() + i + Math.random()), 
          title: displayTitle,
          start: format(loopStart),
          end: format(loopEnd),
          backgroundColor: '#2ecc71', // Framtida pass startar som ofakturerade (gröna)
          borderColor: '#27ae60',
          extendedProps: { 
            customerId, 
            price: finalPrice, 
            rutPrice: finalPrice * 0.5, 
            tasks: JSON.parse(JSON.stringify(tasks)), 
            comment, 
            isInvoiced: false 
          }
        })
      }
    }

    setBookings(updatedBookings)
    setModalOpen(false)
    setSelectedBooking(null)
  }

  const handleDeleteBooking = () => {
    if (!selectedBooking) return
    const filteredBookings = bookings.filter(b => b.id !== selectedBooking.id)
    setBookings(filteredBookings)
    setModalOpen(false)
    setSelectedBooking(null)
  }

  const handleDeleteCustomer = (customerId) => {
    const updatedCustomers = { ...customers }
    delete updatedCustomers[customerId]
    setCustomers(updatedCustomers)

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
    customerManagerOpen, setCustomerManagerOpen,
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
    handleDeleteCustomer,
    handleCopyBooking
  }
}