const listsContainer = document.getElementById('tasksLists')
const newListForm = document.getElementById('newListForm')
const listDisplayContainer = document.getElementById('listDisplayContainer')
const listTitleElement = document.getElementById('listTitle')
const listCountElement = document.getElementById('listCount')
const deleteListButton = document.getElementById('deleteListButton')

const tasksContainer = document.getElementById('tasksContainer')
const newTaskForm = document.getElementById('newTaskForm')
const taskTemplate = document.getElementById('task-template')
const ClearCompleteTasksButton = document.getElementById('clearCompleteTasksButton')

/* 
  CURRENT SELECTED LIST ID
*/
let selectedListId

const BASE_URL = 'https://afedo-tasks.herokuapp.com/api'

/* 
  ARRAYS
*/
let lists
let tasksByList

/* 
  CALLING TO API ENDPOINTS
*/
async function getLists() {
  const res = await fetch(`${BASE_URL}/lists/`)
  const data = await res.json()
  lists = data.data
}

async function createList(list) {
  const res = await fetch(`${BASE_URL}/lists/create.php`, {
    method: 'POST',
    body: JSON.stringify(list)
  })
  
  const data = await res.json()
  return data.message
}

async function deleteList(list) {
  if (!selectedListId) {
    return
  }

  const res = await fetch(`${BASE_URL}/lists/destroy.php?idList=${selectedListId}`, {
    method: 'POST',
  })

  const data = await res.json()
  return data.message
}

async function getTasks() {
  if (!selectedListId) {
    return
  }
  const res = await fetch(`${BASE_URL}/lists/tasks.php?idList=${selectedListId}`)
  const data = await res.json()
  tasksByList = data.data
}

async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks/create.php`, {
    method: 'POST',
    body: JSON.stringify(task)
  })

  const data = await res.json()
  return data.message
}

async function changeStatus(idTask) {
  const res = await fetch(`http://afedo-tasks.herokuapp.com/api/tasks/changeStatus.php?idTask=${idTask}`, {
    method: 'POST',
  })

  const data = await res.json()
  return data.message
}

async function deleteCompletedTasks() {
  if (!selectedListId) {
    return
  }
  const res = await fetch(`${BASE_URL}/lists/deleteCompletedTasks.php?idList=${selectedListId}`, {
    method: 'POST',
  })

  const data = await res.json()
  return data.message
}

/* 
  EVENTS
*/
newListForm.addEventListener('submit', async e => {
  e.preventDefault()
  const listName = e.target.listName.value

  if (listName == null || listName == '') return

  const message = await createList({ listName })
  console.log(message)
  e.target.reset()
  getAndRenderLists()
})

newTaskForm.addEventListener('submit', async e => {
  e.preventDefault()
  const title = e.target.title.value

  if (title == null || title == '') return
  if (!selectedListId) return

  const newTask = {
    idList: selectedListId,
    title
  }

  const message = await createTask(newTask)
  console.log(message)
  e.target.reset()
  getAndRenderTasks()
})

listsContainer.addEventListener('click', async e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = parseInt(e.target.dataset.listId)
    renderLists()
    renderListContainer()
    getAndRenderTasks()
  }
})

tasksContainer.addEventListener('click', async e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const taskId = parseInt(e.target.id)
    console.log(taskId)
    const message = await changeStatus(taskId)
    console.log(message)
    getAndRenderTasks()
  }
})

ClearCompleteTasksButton.addEventListener('click', async () => {
  const message = await deleteCompletedTasks()
  console.log(message)
  getAndRenderTasks()
})

deleteListButton.addEventListener('click', async () => {
  const message = await deleteList()
  console.log(message)
  getAndRenderLists()
  selectedListId = null
})

/* 
  RENDER VIEWS
*/
function renderLists() {

  clearElement(listsContainer)

  if (!lists) {
    return
  }

  const docFrag = document.createDocumentFragment()

  lists.forEach(list => {
    const li = document.createElement('li')
    li.dataset.listId = list.id
    li.classList.add('list-name')
    li.textContent = list.list_name
    if (list.id === selectedListId) {
      li.classList.add('active-list')
    }

    docFrag.appendChild(li)
  })

  listsContainer.appendChild(docFrag)
}

function renderTasks() {

  clearElement(tasksContainer)

  if (!tasksByList) {
    return
  }

  const docFrag = document.createDocumentFragment()

  tasksByList.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.is_completed
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    label.append(task.title)
    docFrag.appendChild(taskElement)
  })

  tasksContainer.appendChild(docFrag)
}

function renderTaskCount() {
  if (!tasksByList) tasksByList = []

  const incompleteTasks = tasksByList.filter(task => !task.is_completed).length

  const taskString = incompleteTasks === 1 ? 'task' : 'tasks'
  listCountElement.innerText = `${incompleteTasks} ${taskString} remaining`
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function renderListContainer() {
  const selectedList = lists.find(list => list.id === selectedListId)

  if (selectedListId == null) {
    listDisplayContainer.style.display = 'none'
  } else {
    listDisplayContainer.style.display = ''
    listTitleElement.innerText = selectedList.list_name
    renderTaskCount()
  }
}

async function getAndRenderTasks() {
  await getTasks()
  renderTasks()
  renderTaskCount()
}

async function getAndRenderLists() {
  await getLists()
  renderLists()
  renderListContainer()
}

getAndRenderLists()