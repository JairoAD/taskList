"use strict";

const IDBRequest = indexedDB.open("taskDB", 1);

IDBRequest.addEventListener("upgradeneeded", () => {
    const db = IDBRequest.result;
    db.createObjectStore("tasks", {
        autoIncrement: true
    })
})

IDBRequest.addEventListener("success", () => {
    readObject();
})

IDBRequest.addEventListener("error", () => {
    console.log("something went wrong!")
})

const addBtn = document.getElementById("add");
addBtn.addEventListener("click", (e) => {
    let task = document.getElementById("task").value;
    if (task.length > 0) {
        if (document.querySelector(".posible") != undefined) {
            if (confirm("Unsaved elements. Do you want to continue?")) {
                addObject({ nombre: task });
                readObject();
            }
        } else {
            addObject({ nombre: task });
            readObject();
        }
    }

})

const addObject = objects => {
    const IDBData = getIDBData("readwrite", "object added!");
    IDBData.add(objects);
}

const readObject = () => {
    const IDBData = getIDBData("readonly");
    const cursor = IDBData.openCursor();
    const fragment = document.createDocumentFragment();
    document.querySelector(".myTasks").innerHTML = "";
    cursor.addEventListener("success", () => {
        if (cursor.result) {
            let element = taskHTML(cursor.result.key, cursor.result.value);
            fragment.appendChild(element);
            cursor.result.continue();
        } else document.querySelector(".myTasks").appendChild(fragment);
    })
}

const modifyObject = (key, object) => {
    const IDBData = getIDBData("readwrite", "object modified!");
    IDBData.put(object, key);
}

const deleteObject = (key) => {
    const IDBData = getIDBData("readwrite", "object deleted!");
    IDBData.delete(key);
}

const getIDBData = (mode, msg) => {
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("tasks", mode);
    const objectStore = IDBtransaction.objectStore("tasks");
    IDBtransaction.addEventListener("complete", () => {
        console.log(msg);
    })
    return objectStore;
}


const taskHTML = (id, name) => {
    const container = document.createElement("DIV");
    const spanContainer = document.createElement("DIV");
    const span = document.createElement("span");
    const options = document.createElement("DIV");
    const saveBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    container.classList.add("taskList");
    spanContainer.classList.add("taskList__name");
    span.classList.add("name");
    options.classList.add("taskList__options");
    saveBtn.classList.add("imposible");
    deleteBtn.classList.add("button");

    saveBtn.textContent = "Save";
    deleteBtn.textContent = "Delete";
    span.textContent = name.nombre;

    container.appendChild(spanContainer);
    container.appendChild(options);
    spanContainer.appendChild(span);
    options.appendChild(saveBtn);
    options.appendChild(deleteBtn);

    span.setAttribute("contenteditable", "true");
    span.setAttribute("spellcheck", "false");

    span.addEventListener("keyup", () => {
        saveBtn.classList.replace("imposible", "posible");
    })

    saveBtn.addEventListener("click", () => {
        if (saveBtn.className === "posible") {
            modifyObject(id, { nombre: span.textContent });
            saveBtn.classList.replace("posible", "imposible");
        }
    })

    deleteBtn.addEventListener("click", () => {
        deleteObject(id);
        document.querySelector(".myTasks").removeChild(container);
    })

    return container;
}

//4:56