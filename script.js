const chatBtn = document.querySelector(".message-button"), 
      chatMessage = document.querySelector(".message-body");
let wrapper = document.querySelector(".wrapper");
let eventSource;
let messageWhatsapp = {}
let messageFileUrl = null;
let messageFile = null; 

function sendServerEvent() {
    let hash = this.location.hash;
     
      eventSource = new EventSource("https://wary-gossamer-ink.glitch.me/sse");

      eventSource.onopen = function () {
        console.log("event: open")
      }

      eventSource.onmessage = function (event) {
        const eventData = JSON.parse(event.data);
        console.log('Received SSE event:', eventData);
      }

      eventSource.addEventListener("exampleEvent", function (e) {
        let data = JSON.parse(e.data);
        messageWhatsapp = data.messageWhatsapp;
        let {msg_body, msg_id, phone_number_id, token} = messageWhatsapp;
        sendChatMessageUser1({message: msg_body, phone_number_id: phone_number_id, token: token});
        // console.log("exampleEvent", event.data);
      })

      eventSource.onerror = function (event) {
        console.error("SSE Connection Error", event);
      }
    
  }
  sendServerEvent();
  window.addEventListener("hashchange", function () {
    sendServerEvent();
});



chatMessage.addEventListener("keydown", function(event) {
  if(event.keyCode === 13) {
    chatBtn.click();
  }
})

chatBtn.addEventListener("click", function(){
  if(chatMessage.value === "") {
    alert("Please write your message.")
  } else {
    sendChatMessageUser2(messageWhatsapp);
  }
})

function sendChatMessageUser1({message, phone_number_id, token}){
   const chatInterface = document.querySelector(".chat-interface");
  
  // Create chat item & set styles
  const chatItem = document.createElement("figure");
  chatItem.classList.add("chat-item");
  chatItem.style.flexDirection = "row";
  
  // Create chat message image
  // const chatImg = document.createElement("img");
  // chatImg.setAttribute("src", "https://randomuser.me/api/portraits/women/34.jpg")
  
  
  // Create & style chat message body
  const chatBody = document.createElement("figcaption");
  chatBody.classList.add("chat-item_body");
  
  chatItem.style.alignSelf = "flex-end";
  chatBody.textContent = message;
  
  
  // Append chat parts to chat item
  chatItem.append(chatBody);
  
  // Append chat item to chat interface
  chatInterface.appendChild(chatItem);
  
  // Clear inputs
  chatMessage.value = "";
}

async function sendChatMessageUser2(messageWhatsapp, fileUrl, file) {
  const chatInterface = document.querySelector(".chat-interface");
  const message = chatMessage.value;
  const {phone_number_id, token, from} = messageWhatsapp;
  
//   let response = await fetch("https://wary-gossamer-ink.glitch.me/whatsapp", {method: "POST", body: JSON.stringify( {message, phone_number_id, token, from}), headers: {
//     "Content-Type": "application/json"
//   }})
  
//   console.log(response)
  
  
  // Create chat item & set styles
  const chatItem = document.createElement("figure");
  chatItem.classList.add("chat-item");
  chatItem.style.flexDirection = "row-reverse";
  
  
  // Create chat message image
  const chatImg = document.createElement("img");
 
  // chatImg.setAttribute("src", "https://randomuser.me/api/portraits/men/32.jpg")

  
  
  // Create & style chat message body
  const chatBody = document.createElement("figcaption");
 
  chatBody.classList.add("chat-item_body", "alt");
  
  chatItem.style.alignSelf = "flex-end";
  
  if(fileUrl){
    let img = document.createElement("img");
    let btn = document.createElement("button");
    btn.classList.add("btn_download");
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      downloadFile(fileUrl, file);
    })
    img.src = fileUrl;
    img.classList.add("message_file_img");
    chatBody.append(img);
    chatBody.append(btn);
  } else {
    chatBody.textContent = chatMessage.value;
  }
  
 
  
  chatItem.append(chatBody);
  // Append chat parts to chat item
  
  // Append chat item to chat interface
  chatInterface.appendChild(chatItem);
  
  // Clear inputs
  chatMessage.value = "";
}

let addFile = document.querySelector(".inputFile");
let selectedFile = document.querySelector(".selected-file");

addFile.addEventListener("change", function (e){
  // if(addFile.files.length > 0){
  //   const file = addFile.files[0];
  //   console.log(file);
  // }
  let file = e.target.files[0];
  console.log(e.target.files)
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (){
    messageFileUrl = reader.result;
    messageFile = file;
    showFile(messageFileUrl)
    console.log(reader.result);
  }
});

function downloadFile(fileUrl, file){
  // Создаем ссылку для скачивания файла
  var downloadLink = document.createElement("a");
  
  // Устанавливаем атрибуты для ссылки: href и download
  downloadLink.href = fileUrl; // Укажите URL файла для скачивания
  downloadLink.download = file.name; // Укажите имя, под которым файл будет скачан
  
  // Добавляем ссылку на страницу и эмулируем клик
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Удаляем ссылку из DOM
  document.body.removeChild(downloadLink);
}

function sendFile(e){
  e.preventDefault();
  sendChatMessageUser2(messageWhatsapp, messageFileUrl, messageFile);
  messageFileUrl = null;
  let div = document.querySelector(".selected_file");
  wrapper.removeChild(div);
}

function showFile(fileLink){
  let div = document.createElement("div");
  div.classList.add("selected_file");
  let img = document.createElement("img");
  let fileBtn = document.createElement("button");
  fileBtn.type = "button";
  fileBtn.value = "Отправить";
  fileBtn.innerText = "Отправить";
  fileBtn.classList.add("file-button");
  fileBtn.addEventListener("click", sendFile);
  img.src = fileLink;
  img.classList.add("message_file_img");
  div.appendChild(fileBtn);
  div.appendChild(img);
  wrapper.appendChild(div);
}