import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
let Notes = [];

const ShowNotesToDOM = () => {
  console.log(Notes);
  const notes_container = document.getElementsByClassName(
    "highlights-container"
  )[0];
  if (Notes.length === 0) {
    notes_container.innerHTML = "<div><p>No notes to show.</p></div>";
    return;
  }
  notes_container.innerHTML = "";
  for (let i = 0; i < Notes.length; i++) {
    const note = Notes[i];
    console.log(note._id);
    let noteContainer = document.createElement("div");
    noteContainer.classList.add(`highlights`);
    noteContainer.setAttribute("id", `${note._id}`);
    const p = document.createElement("p");
    const innerText = TrimString(note.highlight + " " + "-" + " " + note.note);
    const _ind = innerText.indexOf("-");
    p.innerHTML =
      _ind === -1
        ? `<span style="font-weight: 600;">${innerText}</span>`
        : `<span style="font-weight: 600;">${
            innerText.split(" - ")[0]
          }</span><span> - ${innerText.split(" - ")[1]}</span>`;
    p.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "SHOW_NOTE",
            highlight: note.highlight,
            note: note.note,
            _id: note._id,
          },
          function (response) {
            if (!chrome.runtime.lastError) {
              console.log(response);
            } else {
              console.log(chrome.runtime.lastError, "error line 14");
            }
          }
        );
      });
    });
    const span = document.createElement("span");
    span.classList.add(`delete_note`);
    span.classList.add(`${note._id}`);
    span.innerText = "X";
    span.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "DELETE_NOTE", _id: note._id },
          function (response) {
            if (!chrome.runtime.lastError) {
              console.log(response);
            } else {
              console.log(chrome.runtime.lastError, "error line 14");
            }
          }
        );
      });
    });
    noteContainer.appendChild(p);
    noteContainer.appendChild(span);
    notes_container.appendChild(noteContainer);
  }
};

const fetchNotes = async () => {
  const data = await chrome.storage.sync.get("Notes");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const activeTab = tabs[0];
    if (data.Notes) {
      const filtered_data = data.Notes.Notes.filter(
        (n) => n.url === activeTab.url
      );
      Notes = [...Notes, ...filtered_data];
    }
    ShowNotesToDOM();
  });
};
function downloadPDF() {
  const data = [];
  if(Notes.length===0){
    alert("No notes to export");
    return;
  }
  
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const doc = new jsPDF();
    const activeTab = tabs[0];
    doc.text(`URL - ${activeTab.url}`,10,10);
    const filtered_data = Notes.filter((n) => n.url === activeTab.url);
    if (filtered_data.length === 0) {
      alert("No notes to export");
      return;
    }
    for (let i = 0; i < filtered_data.length; i++) {
      const note = filtered_data[i];
      data.push([note.highlight, note.note]);
    }
    autoTable(doc, { html: "#my-table" });
    autoTable(doc, {
      head: [["Highlight", "Note"]],
      body: [...data],
    });

    doc.save("Highlights.pdf");
  });

}

const TrimString = (s) => {
  if (s.length < 50) {
    return s;
  }
  return s.slice(0, 51) + "...";
};

document.addEventListener("DOMContentLoaded", () => {
  fetchNotes();
  const addBtn = document.getElementsByClassName("add_highlight_btn")[0];
  const removeBtn = document.getElementsByClassName("remove_highlight_btn")[0];
  const colorPicker = document.getElementById("colorPicker");
  const ExportBtn = document.getElementsByClassName("export_highlight_btn")[0];
  ExportBtn.addEventListener("click", () => {
    downloadPDF();
  });

  let highlightColor = "#ffff00";
  colorPicker.addEventListener("input", () => {
    highlightColor = colorPicker.value;
  });

  addBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "NEW", highlightColor },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "error line 14");
          }
        }
      );
    });
  });

  removeBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "DELETE" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "error line 14");
          }
        }
      );
    });
    window.location.reload();
  });
});
