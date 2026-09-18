const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let tasks = [];
let nextId = 1;

function createTask(title) {
  const task = {
    id: nextId++,
    title: title.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Apex Tester Advanced</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            background: #f4f6f8;
            color: #1f2937;
          }
          header {
            background: #0f172a;
            color: #fff;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          header h1 { margin: 0; font-size: 1.25rem; }
          #clock { font-variant-numeric: tabular-nums; opacity: 0.9; }
          main {
            max-width: 720px;
            margin: 2rem auto;
            padding: 0 1rem;
          }
          .card {
            background: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1.5rem;
          }
          .input-row {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          input[type="text"] {
            flex: 1;
            padding: 0.6rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 1rem;
          }
          button {
            padding: 0.6rem 1rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 0.95rem;
            cursor: pointer;
          }
          .btn-primary { background: #2563eb; color: #fff; }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-success { background: #16a34a; color: #fff; }
          .btn-success:hover { background: #15803d; }
          .btn-danger { background: #dc2626; color: #fff; }
          .btn-danger:hover { background: #b91c1c; }
          ul { list-style: none; padding: 0; margin: 0; }
          li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            background: #f9fafb;
          }
          li.done span {
            text-decoration: line-through;
            opacity: 0.6;
          }
          li span { flex: 1; margin-right: 0.75rem; word-break: break-word; }
          .empty { color: #6b7280; text-align: center; padding: 1rem 0; }
          .meta { color: #6b7280; font-size: 0.8rem; margin-top: 0.25rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>Apex Tester Advanced</h1>
          <div id="clock">--:--:-- UTC</div>
        </header>
        <main>
          <div class="card">
            <div class="input-row">
              <input id="titleInput" type="text" placeholder="Add a new task..." autocomplete="off" />
              <button id="addBtn" class="btn-primary">Add Task</button>
            </div>
            <ul id="taskList"></ul>
            <div id="emptyState" class="empty" style="display:none;">No tasks yet. Add one above.</div>
          </div>
        </main>
        <script>
          const clockEl = document.getElementById('clock');
          function updateClock() {
            clockEl.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
          }
          updateClock();
          setInterval(updateClock, 1000);

          const titleInput = document.getElementById('titleInput');
          const addBtn = document.getElementById('addBtn');
          const taskList = document.getElementById('taskList');
          const emptyState = document.getElementById('emptyState');

          async function loadTasks() {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            renderTasks(data.tasks);
          }

          function renderTasks(tasks) {
            taskList.innerHTML = '';
            emptyState.style.display = tasks.length ? 'none' : 'block';
            tasks.forEach(task => {
              const li = document.createElement('li');
              li.className = task.status === 'done' ? 'done' : '';
              li.dataset.id = task.id;

              const left = document.createElement('div');
              left.style.flex = '1';
              const title = document.createElement('span');
              title.textContent = task.title;
              const meta = document.createElement('div');
              meta.className = 'meta';
              meta.textContent = 'Created: ' + new Date(task.createdAt).toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
              left.appendChild(title);
              left.appendChild(meta);

              const actions = document.createElement('div');
              actions.style.display = 'flex';
              actions.style.gap = '0.5rem';

              if (task.status === 'open') {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'btn-success';
                completeBtn.textContent = 'Complete';
                completeBtn.onclick = () => completeTask(task.id);
                actions.appendChild(completeBtn);
              }

              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'btn-danger';
              deleteBtn.textContent = 'Delete';
              deleteBtn.onclick = () => deleteTask(task.id);
              actions.appendChild(deleteBtn);

              li.appendChild(left);
              li.appendChild(actions);
              taskList.appendChild(li);
            });
          }

          async function addTask() {
            const title = titleInput.value.trim();
            if (!title) return;
            await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title }),
            });
            titleInput.value = '';
            await loadTasks();
          }

          async function completeTask(id) {
            await fetch('/api/tasks/' + id, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'done' }),
            });
            await loadTasks();
          }

          async function deleteTask(id) {
            await fetch('/api/tasks/' + id, { method: 'DELETE' });
            await loadTasks();
          }

          addBtn.addEventListener('click', addTask);
          titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addTask();
          });

          loadTasks();
        </script>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }
  const task = createTask(title);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }
  if (status && status !== 'open' && status !== 'done') {
    return res.status(400).json({ error: 'status must be open or done' });
  }
  if (status) {
    task.status = status;
  }
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'task not found' });
  }
  tasks.splice(idx, 1);
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Apex-Tester-Advanced listening on port ${PORT}`);
  });
}

module.exports = app;
