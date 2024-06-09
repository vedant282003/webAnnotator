(() => {
  let currentNotes = [];
  let selection = "";
  let _id = "";
  let highlightTitle = "";
  let highlightNote = "";
  let prop = [];
  let url = "";
  let shortcutString="";

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "NEW") {
      newHighlight(message.highlightColor);
    }
    if (message.action === "SHOW_NOTE") {
      highlightTitle = message.highlight;
      highlightNote = message.note;
      showHighlightNote();
    }
    if (message.action === "DELETE") deleteHighlight();
    if(message.action === 'GET_URL') sendResponse(window.location.href);
    if (message.action === "DELETE_NOTE") {
      _id = "" + message._id;
      deleteNote();
    }
    if (message.action === "URL"){
      if(!message.msg.tabId) alert("please refresh the page.")
      displayLoadedhighlights();
    }
    sendResponse("request processed");
  });

  const displayLoadedhighlights = async () => {
    url = window.location.href;
    if(url===""){
      alert("Please refresh the page");
      return;
    }
    // alert(url)
    const data = await chrome.storage.sync.get("Notes");
    if(data.Notes) currentNotes = [...data.Notes.Notes];
    // console.log(data);
    let filtered_data=[];
    if (currentNotes.length>0) {
      filtered_data = currentNotes.filter( n => n.url===url);
    }
    if (filtered_data.length !== 0) {
      for (let i = 0; i < filtered_data.length; i++) {
        const props = filtered_data[i].prop;
        let div = document.getElementById(`_id_${filtered_data[i]._id}`);
        if(div) continue;
        for (let j = 0; j < props.length; j++) {
          div = document.createElement("div");
          div.style.backgroundColor = `${props[j].color}`;
          div.style.opacity = "0.4";
          div.style.position = "absolute";
          div.style.cursor = "pointer";
          div.style.left = props[j].left + "px";
          div.style.top = props[j].top + "px";
          div.style.width = props[j].width + "px";
          div.style.height = props[j].height + "px";
          div.style.content = "";
          div.style.zIndex = "500";
          div.classList.add(`_id_${filtered_data[i]._id}`);
          div.setAttribute("id", `_id_${filtered_data[i]._id}`);
          div.addEventListener("click", () => {
            highlightNote = filtered_data[i].note;
            highlightTitle = filtered_data[i].highlight;
            showHighlightNote();
          });
          document.querySelector("body").appendChild(div);
        }
      }
    }
  };
  displayLoadedhighlights();

  const updateStorage = async() => {
    // const data = await chrome.storage.sync.get("Notes");
    let Notes = {Notes: currentNotes};
    chrome.storage.sync.set({ Notes });
  };

  const showNoteInput = () => {
    let NoteInput = document.getElementsByClassName(
      "highlighted-note-input"
    )[0];
    const note = document.getElementsByClassName(
      "highlighted-note-modal-container"
    )[0];
    if (!NoteInput) {
      NoteInput = document.createElement("div");
      NoteInput.classList.add("highlighted-note-input");
      NoteInput.style.width = "40%";
      NoteInput.style.height = "fit-content";
      NoteInput.style.padding = "20px 30px 30px 30px";
      NoteInput.style.display = "flex";
      NoteInput.style.flexDirection = "column";
      NoteInput.style.backgroundColor = "white";
      NoteInput.style.margin = "auto";
      NoteInput.style.position = "relative";

      const closeIcon = document.createElement("p");
      closeIcon.innerText = "X";
      closeIcon.style.position = "absolute";
      closeIcon.style.top = "20px";
      closeIcon.style.left = "20px";
      closeIcon.style.cursor = "pointer";
      closeIcon.addEventListener("click", () => {
        NoteInput.style.display = "none";
        note.style.display = "none";
      });

      const title = document.createElement("p");
      title.classList.add("add-a-note-title");
      title.innerText = "Add a note";
      title.style.textAlign = "center";
      title.style.fontSize = "20px";
      title.style.fontWeight = "600";
      title.style.marginTop = "20px";
      title.style.marginBottom = "10px";

      const input = document.createElement("input");
      input.id = "highlighted-input-form";
      input.name = "highlighted-input-form";
      input.placeholder = "Type in your note";
      input.style.outline = "none";
      input.style.padding = "10px 8px";
      input.style.borderTop = "none";
      input.style.borderRight = "none";
      input.style.borderLeft = "none";
      input.style.borderBottom = "1ps solid lightgrey";
      input.style.backgroundColor = "white";

      const inputBtn = document.createElement("button");
      inputBtn.value = "Add a note";
      inputBtn.innerText = "Add a note";
      inputBtn.style.marginTop = "10px";
      inputBtn.style.backgroundColor = "#6fd673";
      inputBtn.style.color = "white";
      inputBtn.style.cursor = "pointer";
      inputBtn.style.padding = "10px 5px";
      inputBtn.style.border = "none";
      inputBtn.addEventListener("click", () => {
        currentNotes.push({
          note: `${input.value}`,
          _id,
          highlight: selection,
          prop,
          url
        });
        console.log(currentNotes);
        let doc = document.getElementsByClassName(`_id_${_id}`);
        for (let i = 0; i < doc.length; i++) {
          doc[i].setAttribute(`selection`, `${selection}`);
          doc[i].setAttribute(`note`, `${input.value}`);
        }
        updateStorage();
        input.value = "";
        selection = "";
        _id = "";
        prop = [];
        NoteInput.style.display = "none";
        note.style.display = "none";
        window.location.reload();
      });

      NoteInput.appendChild(closeIcon);
      NoteInput.appendChild(title);
      NoteInput.appendChild(input);
      NoteInput.appendChild(inputBtn);
      note.appendChild(NoteInput);
    } else NoteInput.style.display = "flex";
  };

  const showNoteModal = (s) => {
    let note = document.getElementsByClassName(
      "highlighted-note-modal-container"
    )[0];
    if (note) {
      note.style.display = "flex";
    } else if (!note) {
      note = document.createElement("div");
      note.style.display = "flex";
      note.style.width = "100%";
      note.style.height = "100%";
      note.style.backgroundColor = "rgba(0,0,0,0.4)";
      note.style.position = "fixed";
      note.style.zIndex = "1000";
      note.style.top = "0";
      note.style.left = "0";
      note.style.right = "0";
      note.style.bottom = "0";
      note.style.justifyContent = "center";
      note.style.alignItem = "center";
      note.classList.add("highlighted-note-modal-container");
      document.body.appendChild(note);
    }
    if (s == "new_note") showNoteInput();
    if (s == "ask_to_delete") AskToDelete();
  };

  const newHighlight = async (color) => {
    selection = window.getSelection().toString();
    if (selection) {
      _id = crypto.randomUUID();
      showNoteModal("new_note");
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollLeft =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      const range = window.getSelection().getRangeAt(0);
      const arr = range.getClientRects();
      for (let i = 0; i < arr.length; i++) {
        const div = document.createElement("div");
        div.style.backgroundColor = `${color}`;
        div.style.opacity = "0.4";
        div.style.position = "absolute";
        div.style.cursor = "pointer";
        prop.push({
          left: arr[i].x + scrollLeft,
          top: arr[i].y + scrollTop,
          width: arr[i].width,
          height: arr[i].height,
          color,
        });
        div.style.left = arr[i].x + scrollLeft + "px";
        div.style.top = arr[i].y + scrollTop + "px";
        div.style.width = arr[i].width + "px";
        div.style.height = arr[i].height + "px";
        div.style.content = "";
        div.style.zIndex = "500";
        div.classList.add(`_id_${_id}`);
        div.setAttribute("id", `_id_${_id}`);
        div.addEventListener("click", () => {
          highlightNote = div.getAttribute("note");
          highlightTitle = div.getAttribute("selection");
          showHighlightNote();
        });
        document.querySelector("body").appendChild(div);
      }
    } else {
      alert("Please select text to highlight.");
    }
  };

  const deleteHighlight = async () => {
    currentNotes = [];
    updateStorage();
    window.location.reload();
  };

  const AskToDelete = () => {
    let ask = document.getElementsByClassName(
      "highlighted-delete-permission"
    )[0];
    let note = document.getElementsByClassName(
      "highlighted-note-modal-container"
    )[0];
    if (!ask) {
      ask = document.createElement("div");
      ask.classList.add("highlighted-delete-permission");
      ask.style.width = "40%";
      ask.style.height = "fit-content";
      ask.style.padding = "35px 30px 30px 30px";
      ask.style.display = "flex";
      ask.style.flexDirection = "column";
      ask.style.backgroundColor = "white";
      ask.style.margin = "auto";

      const title = document.createElement("p");
      title.classList.add("are-you-sure-to-delete-highlight");
      title.innerText =
        "Are you sure you want to delete this highlight permanently ?";
      title.style.textAlign = "center";
      title.style.fontSize = "20px";
      title.style.fontWeight = "500";
      title.style.marginBottom = "10px";

      const BtnElem = document.createElement("div");
      BtnElem.classList.add("delete-highlight-btns");
      BtnElem.style.width = "100%";
      BtnElem.style.display = "flex";
      BtnElem.style.alignContent = "center";
      BtnElem.style.paddingTop = "10px";
      BtnElem.style.borderTop = "1px solid lightgray";
      BtnElem.style.justifyContent = "space-between";

      const Confirm = document.createElement("button");
      Confirm.innerText = "Confirm";
      Confirm.style.backgroundColor = "#6fd673";
      Confirm.style.color = "white";
      Confirm.style.cursor = "pointer";
      Confirm.style.padding = "10px 5px";
      Confirm.style.border = "none";
      Confirm.addEventListener("click", () => {
        note.style.display = "none";
        ask.style.display = "none";
        currentNotes = currentNotes.filter((n) => n._id != _id);
        updateStorage();
        _id = "";
        window.location.reload();
      });
      Confirm.style.flex = "0.45";

      const Cancel = document.createElement("button");
      Cancel.innerText = "Cancel";
      Cancel.style.backgroundColor = "red";
      Cancel.style.color = "white";
      Cancel.style.cursor = "pointer";
      Cancel.style.padding = "10px 5px";
      Cancel.style.border = "none";
      Cancel.addEventListener("click", () => {
        note.style.display = "none";
        ask.style.display = "none";
      });
      Cancel.style.flex = "0.45";

      BtnElem.appendChild(Confirm);
      BtnElem.appendChild(Cancel);
      ask.appendChild(title);
      ask.appendChild(BtnElem);
      note.appendChild(ask);
    } else ask.style.display = "flex";
  };

  const deleteNote = () => {
    showNoteModal("ask_to_delete");
  };

  const showHighlightNote = () => {
    showNoteModal();
    let note = document.getElementsByClassName(
      "highlighted-note-modal-container"
    )[0];
    let Note = document.getElementsByClassName("highlighted-note-details")[0];
    if (Note) Note.style.display = "flex";
    else {
      Note = document.createElement("div");
      Note.classList.add("highlighted-note-details");
      Note.style.width = "40%";
      Note.style.height = "fit-content";
      Note.style.padding = "20px 30px 30px 30px";
      Note.style.display = "flex";
      Note.style.flexDirection = "column";
      Note.style.backgroundColor = "white";
      Note.style.margin = "auto";
      Note.style.position = "relative";

      const closeIcon = document.createElement("p");
      closeIcon.innerText = "X";
      closeIcon.style.position = "absolute";
      closeIcon.style.top = "20px";
      closeIcon.style.left = "20px";
      closeIcon.style.cursor = "pointer";
      closeIcon.addEventListener("click", () => {
        Note.style.display = "none";
        note.style.display = "none";
      });

      const title = document.createElement("p");
      title.classList.add("your-note-details-title");
      title.innerText = "Note";
      title.style.textAlign = "center";
      title.style.fontSize = "20px";
      title.style.fontWeight = "600";
      title.style.marginBottom = "10px";
      title.style.paddingBottom = "5px";
      title.style.borderBottom = "1px solid grey";

      const NoteName = document.createElement("p");
      NoteName.innerText = "Title";
      NoteName.classList.add("your-note-name");
      NoteName.style.marginBottom = "5px";
      NoteName.style.fontSize = "16px";
      const NoteNameValue = document.createElement("p");
      NoteNameValue.classList.add("your-note-name-value");
      NoteNameValue.style.marginTop = "0px";
      NoteNameValue.style.fontSize = "16px";
      NoteNameValue.style.color = "grey";

      const NoteDesc = document.createElement("p");
      NoteDesc.innerText = "Note";
      NoteDesc.classList.add("your-note-desc");
      NoteDesc.style.marginBottom = "5px";
      NoteDesc.style.marginTop = "10px";
      NoteDesc.style.fontSize = "16px";
      const NoteDescValue = document.createElement("p");
      NoteDescValue.classList.add("your-note-desc-value");
      NoteDescValue.style.marginTop = "0px";
      NoteDescValue.style.color = "grey";
      NoteDescValue.style.fontSize = "16px";

      Note.appendChild(closeIcon);
      Note.appendChild(title);
      Note.appendChild(NoteName);
      Note.appendChild(NoteNameValue);
      Note.appendChild(NoteDesc);
      Note.appendChild(NoteDescValue);
      note.appendChild(Note);
    }
    const nn = document.getElementsByClassName("your-note-name-value")[0];
    nn.innerText = `${highlightTitle}`;
    const nd = document.getElementsByClassName("your-note-desc-value")[0];
    nd.innerText = `${highlightNote}`;
  };

  const ShowNoteSearchBar=(filtered_data)=>{
    let searchBar = document.getElementsByClassName('highlighted-notes-filter-bar-annotator')[0];
    if(searchBar) return;
    else{
      searchBar = document.createElement('div');
      searchBar.style.display = "flex";
      searchBar.style.position = "fixed";
      searchBar.style.top = '30px';
      searchBar.style.right = "50px";
      searchBar.style.minHeight = "50px";
      searchBar.style.minWidth = "250px";
      searchBar.style.boxShadow = "0 0 30px 10px rgba(0, 0, 0, 0.2)";
      searchBar.style.zIndex = "5000";
      searchBar.style.borderRadius = "10px";
      searchBar.style.backgroundColor = "white";
      searchBar.style.padding = "4px";
      searchBar.style.alignItem = "center";
      searchBar.style.justifyContent = "center";
      searchBar.classList.add("highlighted-notes-filter-bar-annotator");

      const inputElem = document.createElement('input');
      inputElem.style.border = "0";
      inputElem.style.color = "grey";
      inputElem.placeholder = "Search highlights..."
      inputElem.style.borderRight = "1px solid black";
      inputElem.style.flex = "0.9";
      inputElem.style.paddingRight = "3px";
      inputElem.style.margin = "auto";
      inputElem.style.outline = "none";
      if(filtered_data.length===0){
        inputElem.style.pointerEvents = "none";
        inputElem.placeholder = "No notes to filter";
      }
      inputElem.addEventListener("change",(e)=>{
        e.preventDefault();
        // alert(e.target.value)
        let _id;
        const data = filtered_data.filter(n => (n.highlight).toLowerCase() === (e.target.value).toLowerCase());
        if(data) _id = data[0]._id; 
        // alert(_id)
        if(!_id){
          return;
        }
        const elem = document.getElementById(`_id_${_id}`);
        elem.scrollIntoView();
      })

      const closeElem = document.createElement("div");
      closeElem.innerText = "X";
      closeElem.style.flex = "0.1";
      closeElem.style.display = "flex";
      closeElem.style.padding="0";
      closeElem.style.margin="auto";
      closeElem.style.height = "fit-content";
      closeElem.style.justifyContent = "center";
      closeElem.style.alignItem = "center";
      closeElem.style.cursor = "pointer";
      closeElem.addEventListener("click",()=>{
        document.body.removeChild(searchBar);
        window.location.reload();
      })

      searchBar.appendChild(inputElem);
      searchBar.appendChild(closeElem);

      document.body.appendChild(searchBar);
    }
  }

    document.addEventListener('keydown',(event)=>{
      shortcutString+=event.key;
      if(shortcutString==="ControlShiftH"){
        event.preventDefault();
        newHighlight("yellow");
        shortcutString="";
      }
      else if(shortcutString==="ControlShiftF"){
        event.preventDefault();
        let filtered_data = [];
        if(currentNotes.length>0) filtered_data = currentNotes.filter( n => n.url===window.location.href);
        ShowNoteSearchBar(filtered_data);
        shortcutString="";
      }
    })
})();
