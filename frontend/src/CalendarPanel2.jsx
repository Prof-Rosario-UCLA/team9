import { useState } from 'react';

export default function CalendarPanel2() {
  const [selectedDatePopup, setSelectedDatePopup] = useState(null);
  const [selectedChore, setSelectedChore] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [popupPage, setPopupPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const mockChores = [];
  for (let day = 1; day <= 30; day++) {
    for (let i = 1; i <= 5; i++) {
      mockChores.push({
        description: `Chore ${i} on day ${day}`,
        assigned: i % 2 === 0 ? 'Alice' : null,
        points: i * 2,
        created: `2025-06-${String(day).padStart(2, '0')}T08:30`,
        dueDate: `2025-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00`
      });
    }
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getChoresForDate = (dateStr) => {
    return mockChores.filter(c => c.dueDate.startsWith(dateStr));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openDatePopup = (dateStr) => {
    const chores = getChoresForDate(dateStr);
    setSelectedDatePopup({ dateStr, chores });
    setPopupPage(0); // reset page on open
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  return (
    <div className="w-full h-full flex flex-col p-1 overflow-hidden">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-info text-sm font-bold">{monthName} {year}</h2>
        <div className="space-x-1">
          <button className="btn btn-xs btn-outline btn-info" onClick={handlePrevMonth}>« Prev</button>
          <button className="btn btn-xs btn-outline btn-info" onClick={handleNextMonth}>Next »</button>
        </div>
      </div>

      <div className="grid grid-cols-7 grid-rows-[repeat(5,1fr)] gap-[1px] flex-grow overflow-hidden">
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const chores = getChoresForDate(dateStr);
          const hasChores = chores.length > 0;

          return (
            <div
              key={day}
              className={`border p-1 rounded text-[10px] leading-tight flex flex-col items-start justify-start overflow-hidden
                ${hasChores ? 'bg-info text-base-content' : 'bg-base-100 text-base-content'} hover:bg-base-200`}
              onClick={() => openDatePopup(dateStr)}
            >
              <div className="font-bold">{day}</div>
              <div className="w-full min-w-0">
                {chores.slice(0, 2).map((chore, j) => (
                  <div key={j} className="truncate">• {chore.description}</div>
                ))}
                {chores.length > 2 && (
                  <div className="italic text-base-content/70 text-[9px]">+{chores.length - 2} more</div>
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
                    <p className="font-semibold">{chore.description}</p>
                    <p className="text-sm">{chore.assigned || 'Unclaimed'}</p>
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
            <p className="mb-2">Assigned: {selectedChore.assigned || 'Unclaimed'}</p>
            <p className="mb-2">Points: {selectedChore.points}</p>
            <p className="mb-2">Created: {selectedChore.created}</p>
            <p className="mb-2">Due: {selectedChore.dueDate}</p>
            {!selectedChore.assigned && (
              <button
                className="btn btn-info btn-sm text-white w-full mt-4"
                onClick={() => {
                  alert('You claimed the chore (mock)');
                  setSelectedChore(null);
                }}
              >
                Claim this chore
              </button>
            )}
            <button className="btn btn-sm w-full mt-2" onClick={() => setSelectedChore(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
