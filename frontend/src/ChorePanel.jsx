import { useState, useRef, useEffect } from 'react';

export default function ChorePanel() {
  const initialChores = [];

  const [activeTab, setActiveTab] = useState("view");
  const [unclaimedChores, setUnclaimedChores] = useState(initialChores);
  const [myChores, setMyChores] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [selectedChore, setSelectedChore] = useState(null);
  const [pageUnclaimed, setPageUnclaimed] = useState(0);
  const [pageMine, setPageMine] = useState(0);
  const [inGroup, setInGroup] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    due_date: '',
    point_worth: 0
  });

  const ITEMS_PER_PAGE = 3;
  const ghostRef = useRef(null);

  useEffect(() => {
    if (activeTab !== 'view') return;

    const fetchTasks = async () => {
      try {
        const resp = await fetch('http://localhost:8080/getMyGroupTasks', {
          method: 'GET',
          credentials: 'include'
        });

        const data = await resp.json();
        if (!resp.ok || data.inGroup === false) {
          setInGroup(false);
          setUnclaimedChores([]);
          setMyChores([]);
          return;
        }
        
        const tasks = data.group.tasks;
        // unclaimed
        const unclaimed = tasks
          .filter(t => t.claimed_by === null && !t.is_completed)
          .map(t => ({
            id: t.task_id.toString(),
            title: t.description.slice(0, 30),
            description: t.description,
            due_date: t.due_date,
            point_worth: t.point_worth
          }));
        
        setInGroup(true);
        setUnclaimedChores(unclaimed);
        setPageUnclaimed(0);
      } catch (err) {
        console.error('Error fetching chores:', err);
        setInGroup(false);
        setUnclaimedChores([]);
        setMyChores([]);
      }
    };

    fetchTasks();
  }, [activeTab]);

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
      <section
        className={`flex-1 flex flex-col justify-between bg-base-200 rounded-box drop-zone-${type === 'unclaimed' ? 'unclaimed' : 'mine'}`}
        style={{
          height: '176px',
          minHeight: '176px',
          maxHeight: '176px',
          padding: '0.5rem',
          overflow: 'hidden',
        }}
      >
        <header>
          <h2 className={`text-sm font-bold mb-1 ${type === 'unclaimed' ? 'text-info' : 'text-success'}`}>
            {type === 'unclaimed' ? 'Unclaimed Chores' : 'Your Area'}
          </h2>
        </header>

        <div className="flex flex-col gap-1">
          {pageItems.map(item => (
            <article
              key={item.id}
              className={`text-xs p-1 bg-base-100 rounded shadow hover:bg-base-300 ${draggingItem?.id === item.id ? 'opacity-50 pointer-events-none' : ''}`}
              onMouseDown={(e) => handleMouseDown(item, type, e)}
              onTouchStart={(e) => handleMouseDown(item, type, e)}
              onClick={() => setSelectedChore(item)}
            >
              {item.title}
            </article>
          ))}
        </div>

        <footer>
          {renderPagination(page, setPage, chores.length)}
          {type === 'mine' && chores.length > 0 && (
            <button
              className="btn btn-success btn-xs mt-1 w-full"
              onClick={handleClaimPage}
            >
              Claim Chores
            </button>
          )}
        </footer>
      </section>
    );
  };

  const handleClaimPage = async () => {


    // determine which chores are on the current page
    const start = pageMine * ITEMS_PER_PAGE;
    const pageItems = myChores.slice(start, start + ITEMS_PER_PAGE);
    if (pageItems.length === 0) {
      alert('No chores to claim on this page.');
      return;
    }
    const taskIds = pageItems.map(c => parseInt(c.id, 10));

    try {
      const resp = await fetch('http://localhost:8080/claimTasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: taskIds }),
     });

      const data = await resp.json();
      if (!resp.ok) {
        if (data.inGroup === false) {
          alert('You are not in a group.');
        } else {
          alert(data.error || 'Failed to claim chores.');
        }
        return;
      }
      // Remove the claimed chores from your area
      setMyChores(prev => prev.filter(c => !taskIds.includes(parseInt(c.id, 10))));
      alert(`Claimed ${data.claimedCount} chores!`);
    } catch (err) {
      console.error('Error claiming chores:', err);
      alert('An unexpected error occurred while claiming chores.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    // Prepare payload
    const payload = {
      description: formData.description.trim(),
      // convert to ISO string
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      point_worth: formData.point_worth
    };

      try {
        const resp = await fetch("http://localhost:8080/createTask", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      const data = await resp.json();
      if (!resp.ok) {
        // if user not in group
        if (data.inGroup === false) {
          alert("You are not in a group. Create or join a group first.");
        } else {
          alert(data.error || "Failed to create chore.");
        }
        return;
      }

      // On success, data.task contains the new task
      const newTask = data.task;
      const newChore = {
        id: newTask.task_id.toString(),
        title: newTask.description.slice(0, 30),
        description: newTask.description,
        due_date: newTask.due_date,
        point_worth: newTask.point_worth
      };

      setUnclaimedChores(prev => [...prev, newChore]);
      setFormData({ description: '', due_date: '', point_worth: 0 });
      setActiveTab('view');
    } catch (err) {
      console.error("Error creating chore:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main className="w-full h-full p-2 md:p-4 scale-[0.93] sm:scale-100 overflow-hidden">
      <nav className="flex justify-center mb-4 gap-2">
        <button className={`btn btn-xs ${activeTab === 'view' ? 'btn-info' : ''}`} onClick={() => setActiveTab('view')}>View</button>
        <button className={`btn btn-xs ${activeTab === 'create' ? 'btn-info' : ''}`} onClick={() => setActiveTab('create')}>Create</button>
      </nav>

      {activeTab === 'view' ? (
        <section className="flex flex-col md:flex-row gap-2 md:gap-4">
          {renderList(unclaimedChores, 'unclaimed', pageUnclaimed, setPageUnclaimed)}
          {renderList(myChores, 'mine', pageMine, setPageMine)}
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center h-full gap-4">
                    { !inGroup ? (
            <div className="text-center text-base-content/60 p-4">
              You need to be in a group before you can add chores.
            </div>
          ) : (
          <form onSubmit={handleCreateSubmit} className="bg-base-200 p-4 rounded-box flex flex-col gap-3 w-full max-w-sm">
            <h3 className="text-lg font-bold text-info">Create a Chore</h3>
            <input
              className="input input-sm input-bordered w-full"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              className="input input-sm input-bordered w-full"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <input
              type="number"
              className="input input-sm input-bordered w-full"
              placeholder="Point Worth"
              value={formData.point_worth}
              onChange={(e) => setFormData({ ...formData, point_worth: parseInt(e.target.value || '0') })}
            />
            <button className="btn btn-info btn-sm text-white w-full">Add Chore</button>
          </form>
          )}
        </section>
      )}

      {selectedChore && (
        <section role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 p-6 rounded-box shadow max-w-md w-full">
            <h3 className="text-xl font-bold text-info mb-2">{selectedChore.title}</h3>
            <p className="mb-4">{selectedChore.description}</p>
            <button className="btn btn-sm btn-outline" onClick={() => setSelectedChore(null)}>
              Close
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
