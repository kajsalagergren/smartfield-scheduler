import React, { useEffect, useState } from 'react'

function TaskForm({ services, tasks, setTasks, startTime, onCalculated }) {
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  useEffect(() => {
    if (startTime && tasks.length > 0) {
      let totalMin = 0
      let totalCost = 0

      tasks.forEach(task => {
        const min = Number(task.minutes) || 0
        totalMin += min

        if (task.customPrice !== undefined && task.customPrice !== '') {
          totalCost += Number(task.customPrice) || 0
        } else {
          // FIX: Ändrat från hourlyRate till pricePerHour så den läser rätt från AdminPanelen!
          const hourlyRate = services[task.serviceKey]?.pricePerHour || 0
          totalCost += (min / 60) * hourlyRate
        }
      });

      setTotalMinutes(totalMin)
      setCalculatedPrice(totalCost)

      const startDate = new Date(startTime)
      const endDate = new Date(startDate.getTime() + totalMin * 60 * 1000)
      
      const pad = (num) => String(num).padStart(2, '0')
      const formattedEndTime = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`
      
      onCalculated({
        totalMinutes: totalMin,
        calculatedPrice: totalCost,
        calculatedEndTime: formattedEndTime,
        updatedTasks: tasks 
      })
    }
  }, [startTime, tasks, services, onCalculated])

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks]
    
    if (field === 'serviceKey') {
      updatedTasks[index].customPrice = ''
    }
    
    updatedTasks[index][field] = value
    setTasks(updatedTasks)
  }

  const addTaskRow = () => {
    setTasks([...tasks, { serviceKey: Object.keys(services)[0], minutes: 30, customPrice: '' }])
  }

  const removeTaskRow = (index) => {
    if (tasks.length === 1) return
    const updatedTasks = tasks.filter((_, i) => i !== index)
    setTasks(updatedTasks)
  }

  const getSuggestedPrice = (task) => {
    const min = Number(task.minutes) || 0
    // FIX: Ändrat från hourlyRate till pricePerHour här med!
    const hourlyRate = services[task.serviceKey]?.pricePerHour || 0
    return ((min / 60) * hourlyRate).toFixed(0)
  }

  return (
    <div style={{ marginBottom: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#34495e' }}>
        Arbetsmoment, tid & pris:
      </label>
      
      {tasks.map((task, index) => (
        <div key={index} style={{ background: '#fcfcfc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
            <select 
              value={task.serviceKey} 
              onChange={(e) => handleTaskChange(index, 'serviceKey', e.target.value)}
              style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', background: '#fff' }}
            >
              {Object.keys(services).map((key) => (
                <option key={key} value={key}>{services[key].name}</option>
              ))}
            </select>

            <button 
              type="button" 
              onClick={() => removeTaskRow(index)}
              disabled={tasks.length === 1}
              style={{ padding: '8px 12px', background: tasks.length === 1 ? '#eccfd1' : '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: tasks.length === 1 ? 'not-allowed' : 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Tid:</span>
              <input 
                type="number" 
                value={task.minutes} 
                min="5"
                step="5"
                onChange={(e) => handleTaskChange(index, 'minutes', e.target.value)}
                required
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
              />
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>min</span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Pris:</span>
              <input 
                type="number" 
                value={task.customPrice !== undefined ? task.customPrice : ''} 
                placeholder={`${getSuggestedPrice(task)} kr`}
                onChange={(e) => handleTaskChange(index, 'customPrice', e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #bdc3c7', fontWeight: task.customPrice ? 'bold' : 'normal', color: task.customPrice ? '#2e86de' : '#000' }}
              />
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>kr</span>
            </div>
          </div>
          {task.customPrice && (
            <div style={{ fontSize: '11px', color: '#2e86de', marginTop: '4px', textAlign: 'right' }}>
              ⚠️ Manuellt pris satt (Ordinarie: {getSuggestedPrice(task)} kr)
            </div>
          )}
        </div>
      ))}

      <button 
        type="button" 
        onClick={addTaskRow}
        style={{ marginTop: '5px', padding: '8px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
      >
        + Lägg till moment
      </button>

      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginTop: '20px', borderLeft: '4px solid #2ecc71' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#7f8c8d' }}>
          Total tidsåtgång: <strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}min</strong> ({ (totalMinutes / 60).toFixed(1) } timmar)
        </p>
        <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2c3e50' }}>
          Originalpris: <strong>{calculatedPrice.toFixed(0)} kr</strong>
        </p>
        <p style={{ margin: '0', fontSize: '18px', color: '#27ae60', fontWeight: 'bold' }}>
          Med RUT-avdrag (50%): { (calculatedPrice * 0.5).toFixed(0) } kr
        </p>
      </div>
    </div>
  )
}

export default TaskForm