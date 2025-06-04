import { useState, useRef } from 'react';

export default function ChorePanel() {
  const initialChores = [
    { id: '1', title: "Do the dishes", description: "Wash all plates and utensils." },
    { id: '2', title: "Vacuum living room", description: "Vacuum the carpet and under furniture." },
    { id: '3', title: "Take out trash", description: "Take garbage to the bins outside." },
    { id: '4', title: "Clean bathroom", description: "Wipe down surfaces and mop the floor." },
    { id: '5', title: "Laundry", description: "Wash, dry, and fold clothes." },
    { id: '6', title: "Mow the lawn", description: "Cut the grass in the backyard." },
    { id: '7', title: "Feed pets", description: "Feed and check on the pets." }
  ];

  const [unclaimedChores, setUnclaimedChores] = useState(initialChores);
  const [myChores, setMyChores] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [selectedChore, setSelectedChore] = useState(null);
  const [pageUnclaimed, setPageUnclaimed] = useState(0);
  const [pageMine, setPageMine] = useState(0);

  const ITEMS_PER_PAGE = 3;
  const ghostRef = useRef(null);

  const handleMouseDown = (chore, source, e) => {
    e.preventDefault();
    setDraggingItem({ ...chore, source });

    const ghost = document.createElement('div');
    ghost.className = 'fixed z-50 pointer-events-none p-2 md:p-3 bg-base-100 rounded shadow text-xs md:text-sm';
    ghost.textContent = chore.title;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    const move = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (ghostRef.current) {
        ghostRef.current.style.left = x + 5 + 'px';
        ghostRef.current.style.top = y + 5 + 'px';
      }
    };

    const up = (e) => {
      const x = e.clientX ?? e.changedTouches?.[0]?.clientX;
      const y = e.clientY ?? e.changedTouches?.[0]?.clientY;
      const elem = document.elementFromPoint(x, y);

      if (elem?.closest('.drop-zone-unclaimed')) {
        moveChore(chore, source, 'unclaimed');
      } else if (elem?.closest('.drop-zone-mine')) {
        moveChore(chore, source, 'mine');
      }

      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      if (ghostRef.current) ghostRef.current.remove();
      setDraggingItem(null);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
  };

  const moveChore = (chore, from, to) => {
    if (from === to) return;
    if (from === 'unclaimed') {
      setUnclaimedChores((prev) => prev.filter(c => c.id !== chore.id));
      setMyChores((prev) => [...prev, chore]);
    } else {
      setMyChores((prev) => prev.filter(c => c.id !== chore.id));
      setUnclaimedChores((prev) => [...prev, chore]);
    }
  };

  const renderPagination = (page, setPage, total) => {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    return (
      <div className="join mt-1 flex justify-center">
        {Array.from({ length: totalPages }, (_, idx) => (
          <input
            key={idx}
            className="join-item btn btn-xs btn-square"
            type="radio"
            name={`page-${Math.random()}`}
            aria-label={`${idx + 1}`}
            checked={page === idx}
            onChange={() => setPage(idx)}
          />
        ))}
      </div>
    );
  };

  const renderList = (chores, type, page, setPage) => {
    const start = page * ITEMS_PER_PAGE;
    const pageItems = chores.slice(start, start + ITEMS_PER_PAGE);

    return (
      <div
        className={`flex-1 flex flex-col justify-between bg-base-200 rounded-box drop-zone-${type === 'unclaimed' ? 'unclaimed' : 'mine'}`}
        style={{
          height: '320px',
          padding: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <div>
          <h2 className={`text-sm md:text-base font-bold mb-1 ${type === 'unclaimed' ? 'text-info' : 'text-success'}`}>
            {type === 'unclaimed' ? 'Unclaimed Chores' : 'Your Area'}
          </h2>
          <div className="flex flex-col gap-2">
            {pageItems.map(item => (
              <div
                key={item.id}
                className={`text-xs md:text-sm p-2 bg-base-100 rounded shadow hover:bg-base-300 ${
                  draggingItem?.id === item.id ? 'opacity-50 pointer-events-none' : ''
                }`}
                onMouseDown={(e) => handleMouseDown(item, type, e)}
                onTouchStart={(e) => handleMouseDown(item, type, e)}
                onClick={() => setSelectedChore(item)}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>

        <div>
          {renderPagination(page, setPage, chores.length)}
          {type === 'mine' && chores.length > 0 && (
            <button
              className="btn btn-success btn-xs mt-2 w-full"
              onClick={() => alert("Claimed: " + chores.map(c => c.title).join(", "))}
            >
              Claim Chores
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 scale-[0.93] sm:scale-100 overflow-hidden">
      {renderList(unclaimedChores, 'unclaimed', pageUnclaimed, setPageUnclaimed)}
      {renderList(myChores, 'mine', pageMine, setPageMine)}

      {selectedChore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 p-6 rounded-box shadow max-w-md w-full">
            <h3 className="text-xl font-bold text-info mb-2">{selectedChore.title}</h3>
            <p className="mb-4">{selectedChore.description}</p>
            <button className="btn btn-sm btn-outline" onClick={() => setSelectedChore(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
