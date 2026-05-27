import { useState, useEffect } from 'react'
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
  
  const [homeStreet, setHomeStreet] = useState('Åsgatan 1')
  const [homeZip, setHomeZip] = useState('791 71')
  const [homeCity, setHomeCity] = useState('Falun')

  const [travelCache, setTravelCache] = useState({})

  const pad = (num) => String(num).padStart(2, '0')
  const format = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

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

  const fetchRealTravelTime = async (fromAddr, toAddr, cacheKey) => {
    if (!fromAddr || !toAddr || fromAddr.trim() === toAddr.trim()) return 0

    try {
      const resFrom = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddr)}&limit=1`)
      const dataFrom = await resFrom.json()
      
      const resTo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddr)}&limit=1`)
      const dataTo = await resTo.json()

      if (dataFrom.length > 0 && dataTo.length > 0) {
        const lon1 = dataFrom[0].lon
        const lat1 = dataFrom[0].lat
        const lon2 = dataTo[0].lon
        const lat2 = dataTo[0].lat

        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`)
        const routeData = await routeRes.json()

        if (routeData.routes && routeData.routes.length > 0) {
          const durationSeconds = routeData.routes[0].duration
          const durationMinutes = Math.round(durationSeconds / 60)
          
          setTravelCache(prev => ({ ...prev, [cacheKey]: durationMinutes }))
          return durationMinutes
        }
      }
    } catch (error) {
      console.error("Kunde inte hämta äkta restid från kartan:", error)
    }
    return 15
  }

  const getCustomerFullAddress = (customerId) => {
    const c = customers[customerId]
    if (!c || !c.street) return ''
    return `${c.street}, ${c.zip} ${c.city}`
  }

  const getHomeFullAddress = () => {
    if (!homeStreet) return ''
    return `${homeStreet}, ${homeZip || ''} ${homeCity || ''}`
  }

  useEffect(() => {
    const injectTravelTimes = async () => {
      if (bookings.length === 0) return

      const pureBookings = bookings.filter(b => !b.extendedProps?.isTravel)
      const sorted = [...pureBookings].sort((a, b) => new Date(a.start) - new Date(b.start))
      const actualHomeAddress = getHomeFullAddress()
      let hasChanged = false

      const updatedBookings = await Promise.all(sorted.map(async (booking, index) => {
        const currentStart = new Date(booking.start)
        const currentEnd = new Date(booking.end)
        const currentAddr = getCustomerFullAddress(booking.extendedProps?.customerId)

        const prevBooking = sorted[index - 1]
        let fromAddr = actualHomeAddress
        let labelBefore = 'Hemmet'

        if (prevBooking) {
          const prevEnd = new Date(prevBooking.end)
          const diff = (currentStart - prevEnd) / (1000 * 60)
          const isSameDay = currentStart.toDateString() === prevEnd.toDateString()

          if (isSameDay && diff >= 0 && diff <= 60) {
            fromAddr = getCustomerFullAddress(prevBooking.extendedProps?.customerId)
            labelBefore = customers[prevBooking.extendedProps?.customerId]?.name || 'Förra kunden'
          }
        }

        const cacheKeyBefore = `${fromAddr}_to_${currentAddr}`
        let minutesBefore = travelCache[cacheKeyBefore]
        if (minutesBefore === undefined) {
          minutesBefore = await fetchRealTravelTime(fromAddr, currentAddr, cacheKeyBefore)
        }

        const nextBooking = sorted[index + 1]
        let toAddrAfter = actualHomeAddress
        let labelAfter = 'Hemmet'

        if (nextBooking) {
          const nextStart = new Date(nextBooking.start)
          const diff = (nextStart - currentEnd) / (1000 * 60)
          const isSameDay = currentEnd.toDateString() === nextStart.toDateString()

          if (isSameDay && diff >= 0 && diff <= 60) {
            toAddrAfter = getCustomerFullAddress(nextBooking.extendedProps?.customerId)
            labelAfter = customers[nextBooking.extendedProps?.customerId]?.name || 'Nästa kund'
          }
        }

        const cacheKeyAfter = `${currentAddr}_to_${toAddrAfter}`
        let minutesAfter = travelCache[cacheKeyAfter]
        if (minutesAfter === undefined) {
          minutesAfter = await fetchRealTravelTime(currentAddr, toAddrAfter, cacheKeyAfter)
        }

        const oldBefore = booking.extendedProps?.travelMinutesBefore
        const oldAfter = booking.extendedProps?.travelMinutesAfter
        const oldLabelB = booking.extendedProps?.travelLabelBefore
        const oldLabelA = booking.extendedProps?.travelLabelAfter

        if (oldBefore !== minutesBefore || oldAfter !== minutesAfter || oldLabelB !== labelBefore || oldLabelA !== labelAfter) {
          hasChanged = true
        }

        return {
          ...booking,
          extendedProps: {
            ...booking.extendedProps,
            travelMinutesBefore: minutesBefore,
            travelLabelBefore: labelBefore,
            travelMinutesAfter: minutesAfter,
            travelLabelAfter: labelAfter
          }
        }
      }))

      if (hasChanged) {
        setBookings(updatedBookings)
      }
    }

    injectTravelTimes()
  }, [bookings, homeStreet, homeZip, homeCity, travelCache])

  const handleCopyBooking = (targetDateStr, directData = null, chosenTime = null) => {
    if (!targetDateStr) return

    let sourceTasks = []
    let sourceCustomerId = ''
    let sourceComment = ''
    let durationMs = 60 * 60 * 1000
    let sourceHours = 8, sourceMinutes = 0
    let currentBookingsList = [...bookings]

    if (directData) {
      sourceTasks = directData.tasks
      sourceCustomerId = directData.customerId
      sourceComment = directData.comment
      durationMs = new Date(directData.calculatedEndTime) - new Date(directData.startTime)
      
      const d = new Date(directData.startTime)
      sourceHours = d.getHours()
      sourceMinutes = d.getMinutes()

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
      sourceTasks = selectedBooking.extendedProps.tasks
      sourceCustomerId = selectedBooking.extendedProps.customerId
      sourceComment = selectedBooking.extendedProps.comment
      durationMs = new Date(selectedBooking.end) - new Date(selectedBooking.start)
      
      const d = new Date(selectedBooking.start)
      sourceHours = d.getHours()
      sourceMinutes = d.getMinutes()
    }

    let cloneHours = sourceHours
    let cloneMinutes = sourceMinutes

    if (chosenTime && chosenTime.includes(':')) {
      const parts = chosenTime.split(':')
      cloneHours = parseInt(parts[0], 10)
      cloneMinutes = parseInt(parts[1], 10)
    }

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
      updatedBookings = bookings.map(b => {
        if (b.id === selectedBooking.id) {
          return {
            ...b,
            title: displayTitle,
            start: selectedStart,
            end: calculatedEndTime,
            backgroundColor,
            borderColor,
            extendedProps: { ...b.extendedProps, customerId, price: finalPrice, rutPrice: finalPrice * 0.5, tasks, comment, isInvoiced }
          }
        }
        return b
      })
    } else {
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

    if (repeatType !== 'none') {
      const extraPassesCount = repeatCount - 1
      for (let i = 1; i <= extraPassesCount; i++) {
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
          backgroundColor: '#2ecc71',
          borderColor: '#27ae60',
          extendedProps: { customerId: customerId, price: finalPrice, rutPrice: finalPrice * 0.5, tasks: JSON.parse(JSON.stringify(tasks)), comment, isInvoiced: false }
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
    homeStreet, setHomeStreet,
    homeZip, setHomeZip,
    homeCity, setHomeCity,
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