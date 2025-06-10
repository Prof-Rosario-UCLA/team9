import { useState, useEffect } from 'react';

export default function CalendarPanel2() {
  const [selectedDatePopup, setSelectedDatePopup] = useState(null);
  const [selectedChore, setSelectedChore] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [popupPage, setPopupPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const [choresByDate, setChoresByDate] = useState({});

    const fetchTasks = async () => {
      try {
        const resp = await fetch('/getMyGroupTasks', {
          method: 'GET',
          credentials: 'include'
      });

        const data = await resp.json();
        if (!resp.ok || data.inGroup === false) {
          setChoresByDate({});
          return;
        }

        const tasks = data.group.tasks;
        // group by date string
        const byDate = {};
        tasks.forEach(t => {
          const d = new Date(t.due_date);
          const dateStr = d.toISOString().slice(0,10);
          if (!byDate[dateStr]) byDate[dateStr] = [];
          byDate[dateStr].push({
            task_id: t.task_id,
            description: t.description,
            assigned: t.claimed_by ? 'Claimed' : null,
            points: t.point_worth,
            created: t.created_at,
            dueDate: t.due_date,
            completed:  t.is_completed
          });
        });
        setChoresByDate(byDate);
      } catch (err) {
        console.error('Error loading tasks for calendar:', err);
        setChoresByDate({});
      }
    };

  useEffect(() => {
    fetchTasks();
  }, [currentMonth]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const getChoresForDate = dateStr => choresByDate[dateStr] || [];

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openDatePopup = (dateStr) => {
    const chores = getChoresForDate(dateStr);
    setSelectedDatePopup({ dateStr, chores });
    setPopupPage(0);
  };

  // Claim handler
  const handleClaimChore = async () => {
    if (!selectedChore) return;
    try {
      const resp = await fetch('/claimTasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: [selectedChore.task_id] })
    });

      const data = await resp.json();
      if (!resp.ok) {
        if (data.inGroup === false) {
          alert('You are not in a group.');
        } else {
          alert(data.error || 'Failed to claim chore.');
        }
      } else {
        alert(`Claimed chore!`);
        // reloads
        fetchTasks();
      }
    } catch (err) {
      console.error('Error claiming chore:', err);
      alert('Error claiming chore.');
    } finally {
      setSelectedChore(null);
    }
  };
  
  // Complete handler
  const handleCompleteChore = async () => {
    if (!selectedChore) return;
    try {
      const resp = await fetch('/completeTasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: [selectedChore.task_id] })
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (data.inGroup === false) {
          alert('You are not in a group.');
        } else {
          alert(data.error || 'Failed to complete chore.');
        }
      } else {
        alert(`Marked chore complete!`);
        // reload
        fetchTasks();
      }
    } catch (err) {
      console.error('Error completing chore:', err);
      alert('Error completing chore.');
    } finally {
      setSelectedChore(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-2 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-info text-sm font-bold">{monthName} {year}</h2>
        <div className="space-x-1">
          <button className="btn btn-xs btn-outline btn-info" onClick={handlePrevMonth}>« Prev</button>
          <button className="btn btn-xs btn-outline btn-info" onClick={handleNextMonth}>Next »</button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto scale-[0.90] sm:scale-[0.95] md:scale-100 md:-translate-y-2 grid grid-cols-7 auto-rows-fr gap-1 sm:gap-2 md:gap-3">


        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const chores = getChoresForDate(dateStr);
          const hasChores = chores.length > 0;
          const isPast = new Date(dateStr) < new Date();
          const hasIncomplete = chores.some(c => !c.completed);
          const allCompleted = chores.length > 0 && chores.every(c => c.completed);

          let borderColor = 'border-base-300';
          if (allCompleted) {
            borderColor = 'border-green-500';
          } else if (isPast && hasIncomplete) {
            borderColor = 'border-red-500';
          } else if (hasChores) {
            borderColor = 'border-purple-500';
          }

          return (
            <div
              key={day}
              className={`p-1 sm:p-2 rounded text-[9px] sm:text-[11px] leading-tight flex flex-col items-start justify-start overflow-hidden
                bg-base-100 text-base-content border-2 transition-colors duration-150
                ${borderColor} hover:border-purple-400`}
              onClick={() => openDatePopup(dateStr)}
              style={{
                width: '90%',
                aspectRatio: '1 / 1',
                margin: 'auto',
              }}
            >
              <div className="font-bold">{day}</div>
              <div className="w-full min-w-0 flex-grow overflow-y-auto" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                {chores.slice(0, 2).map((chore, j) => (
                  <div
                    key={j}
                    className={`truncate ${chore.completed ? 'line-through text-base-content/50' : ''}`}
                  >
                    • {chore.description}
                  </div>
                ))}
                {chores.length>2 && (
                  <div className="italic text-base-content/70 text-[9px]">+{chores.length-2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDatePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-box p-4 w-full max-w-md text-sm text-base-content border border-info shadow-lg max-h-[90vh] flex flex-col overflow-hidden">
            <h3 className="text-xl text-info font-bold mb-4 text-center">
              Chores for {selectedDatePopup.dateStr}
            </h3>

            <div className="flex-1 overflow-y-auto">
              {selectedDatePopup.chores
                .slice(popupPage * ITEMS_PER_PAGE, (popupPage + 1) * ITEMS_PER_PAGE)
                .map((chore, index) => (
                  <div
                    key={index}
                    className="p-3 bg-base-200 rounded mb-2 hover:bg-base-300 cursor-pointer"
                    onClick={() => {
                      setSelectedChore(chore);
                      setSelectedDatePopup(null);
                    }}
                  >
                    <p className={`font-semibold ${chore.completed ? 'line-through text-base-content/50' : ''}`}>
                      {chore.description}
                    </p>
                    <p className="text-sm">{chore.assigned || (chore.completed ? 'Completed' : 'Unclaimed')}</p>
                  </div>
              ))}
            </div>

            {selectedDatePopup.chores.length > ITEMS_PER_PAGE && (
              <div className="join mt-2 self-center">
                <button
                  className="join-item btn btn-sm"
                  disabled={popupPage === 0}
                  onClick={() => setPopupPage(p => Math.max(0, p - 1))}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">
                  Page {popupPage + 1} of {Math.ceil(selectedDatePopup.chores.length / ITEMS_PER_PAGE)}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={popupPage >= Math.ceil(selectedDatePopup.chores.length / ITEMS_PER_PAGE) - 1}
                  onClick={() => setPopupPage(p => p + 1)}
                >
                  »
                </button>
              </div>
            )}

            <button className="btn btn-sm w-full mt-2" onClick={() => setSelectedDatePopup(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {selectedChore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-box p-4 w-full max-w-md text-sm text-base-content border border-info shadow-lg max-h-[90vh] overflow-auto">
            <h3 className="text-xl text-info font-bold mb-4 text-center">{selectedChore.description}</h3>
            <p className="mb-2">Assigned: {selectedChore.assigned || (selectedChore.completed ? 'Completed' : 'Unclaimed')}</p>
            <p className="mb-2">Points: {selectedChore.points}</p>
            <p className="mb-2">Created: {selectedChore.created}</p>
            <p className="mb-2">Due: {selectedChore.dueDate}</p>

            {!selectedChore.assigned && !selectedChore.completed && (
              <button
                className="btn btn-info btn-sm text-white w-full mt-4"
                onClick={handleClaimChore}
              >
                Claim this chore
              </button>
            )}
            {selectedChore.assigned && !selectedChore.completed && (
              <button
                className="btn btn-success btn-sm text-white w-full mt-2"
                onClick={handleCompleteChore}
              >
                Mark as Completed
              </button>
            )}
            {selectedChore.completed && (
              <div className="text-center text-base-content/60 mt-2">Already completed</div>
            )}

            <button className="btn btn-sm w-full mt-2" onClick={() => setSelectedChore(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
