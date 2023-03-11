function getTemplateElement(id) {
  // створюємо функцію
  const template = document.getElementById(id); // присвоюємо в змінну пошук за допомогою id
  if (!template) return; // якщо template не пустий то повертаємо його
  const elementContent = template.content; /* ? */
  if (!elementContent) return; // якщо elementContent не пустий то повертаємо його

  return document.importNode(elementContent, true).firstElementChild; /* ? */
}

function LocalStorageManager() {
  this.appKey = "~~todo_app-";

  this.reset = function () {
    localStorage.setItem(this.appKey, "[]");
  };

  if (!localStorage.getItem(this.appKey)) {
    this.reset();
  }

  this.getAllItems = function () {
    return JSON.parse(localStorage.getItem(this.appKey));
  };

  this.removeItem = function (id) {
    const items = this.getAllItems();

    if (items.length === 0) return;

    const index = items.findIndex((todo) => todo.id === id);

    if (index !== -1) {
      items.splice(index, 1);
    }

    localStorage.setItem(this.appKey, JSON.stringify(items));
  };

  this.addItem = function (todo) {
    const items = this.getAllItems();

    items.push(todo);

    localStorage.setItem(this.appKey, JSON.stringify(items));
  };

  this.completeItem = function (id) {
    const items = this.getAllItems();
    const todoItem = items.find((todo) => todo.id === id);

    if (!todoItem) return;

    todoItem.isDone = true;

    localStorage.setItem(this.appKey, JSON.stringify(items));

    return todoItem;
  };
}

function ToDo(title, description) {
  // створюємо ФК
  this.id = crypto.randomUUID(); // генеруєм id
  this.title = title; // присвоюємо title
  this.description = description; // присвоюємо description
  this.isDone = false;
}

function UncompletedToDoList(completedTodoList, storage) {
  // створюємо ФК

  this.root = document.getElementById("uncompleted-todos"); //
  this.completedTodoList = completedTodoList;
  this.storage = storage;

  this.addItem = function (title, description) {
    const todo = new ToDo(title, description);
    this.storage.addItem(todo);

    this.render(todo);
  };

  this.completeItem = function (id) {
    let completedToDo = this.storage.completeItem(id);
    if (!completedToDo) return;

    this.completedTodoList.addItem(completedToDo);

    let toDoElement = document.getElementById(id);
    if (toDoElement) toDoElement.remove();
  };

  this.completeItem = this.completeItem.bind(this);

  this.getTemplate = function () {
    return getTemplateElement("uncompleted_todo_template");
  };

  this.congifurateTemplate = function (template, todo) {
    template.id = todo.id;
    template.querySelector(".title").textContent = todo.title;
    template.querySelector(".description").textContent = todo.description;
    template
      .querySelector(".complete")
      .addEventListener("click", () => this.completeItem(todo.id));
  };

  this.render = function (todo) {
    const template = this.getTemplate();
    this.congifurateTemplate(template, todo);

    this.root.insertAdjacentElement("beforeend", template);
  };

  this.initialize = function () {
    let allItems = this.storage.getAllItems();

    let uncompletedItems = allItems.filter((todo) => !todo.isDone);

    for (const todo of uncompletedItems) {
      this.render(todo);
    }
  };
}

function CompletedToDoList(storage) {
  this.root = document.getElementById("completed-todos");
  this.storage = storage;

  this.addItem = function (todo) {
    this.render(todo);
  };

  this.removeItem = function (id) {
    this.storage.removeItem(id);

    let toDoElement = document.getElementById(id);

    if (toDoElement) toDoElement.remove();
  };
  this.removeItem = this.removeItem.bind(this);

  this.getTemplate = function () {
    return getTemplateElement("completed_todo_template");
  };

  this.congifurateTemplate = function (template, todo) {
    template.id = todo.id;
    template.querySelector(".title").textContent = todo.title;
    template.querySelector(".description").textContent = todo.description;
    template
      .querySelector(".remove")
      .addEventListener("click", () => this.removeItem(todo.id));
  };

  this.render = function (todo) {
    const template = this.getTemplate();
    this.congifurateTemplate(template, todo);

    this.root.insertAdjacentElement("beforeend", template);
  };

  this.initialize = function () {
    let allItems = this.storage.getAllItems();

    let uncompletedItems = allItems.filter((todo) => todo.isDone);

    for (const todo of uncompletedItems) {
      this.render(todo);
    }
  };
}

function CreateToDoForm() {
  this.submitHandler = null;

  this.submitForm = function (event) {
    event.preventDefault();
    if (!this.submitHandler) return;

    let title = document.getElementById("form_title").value;
    let description = document.getElementById("form_description").value;

    if (title && title.length >= 3) {
      this.submitHandler(title, description);
      this.clearForm();
    }
  };

  this.addSubmitHandler = function (submitHandler) {
    this.submitHandler = submitHandler;
  };

  this.initialize = function () {
    let form = document.getElementById("add_todo_form");

    if (form) {
      form.addEventListener("submit", this.submitForm.bind(this));
    }
  };

  this.clearForm = function () {
    document.getElementById("form_title").value = "";
    document.getElementById("form_description").value = "";
  };
}

function app() {
  const storage = new LocalStorageManager();
  const completedTodoList = new CompletedToDoList(storage);
  const uncompletedTodoList = new UncompletedToDoList(
    completedTodoList,
    storage
  );

  uncompletedTodoList.initialize();

  completedTodoList.initialize();

  const createTodoForm = new CreateToDoForm();

  createTodoForm.initialize();
  createTodoForm.addSubmitHandler(
    uncompletedTodoList.addItem.bind(uncompletedTodoList)
  );
}

document.addEventListener("DOMContentLoaded", app);
