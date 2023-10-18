const chatBtn = document.querySelector(".message-button"),
  chatMessage = document.querySelector(".message-body");
const microphonButton = document.getElementsByClassName("start-recording-button")[0]

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
    let { msg_body, msg_id, phone_number_id, token } = messageWhatsapp;
    sendChatMessageUser1({ message: msg_body, phone_number_id: phone_number_id, token: token });
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



chatBtn.style.display = "none"
chatMessage.addEventListener("input", function (event) {
  console.log(event.target.value);
  if (event.target.value) {
    chatBtn.style.display = "block"
    microphonButton.style.display = "none"
  } else {
    chatBtn.style.display = "none"
    microphonButton.style.display = "block"
  }
})

chatMessage.addEventListener("keydown", function (event) {

  if (event.keyCode === 13) {
    chatBtn.click();
  }
})



chatBtn.addEventListener("click", function () {
  if (chatMessage.value === "") {
    alert("Please write your message.")
  } else {
    sendChatMessageUser2(messageWhatsapp);
    chatBtn.style.display = "none"
    microphonButton.style.display = "block"
  }
})

function sendChatMessageUser1({ message, phone_number_id, token }) {
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
  const { phone_number_id, token, from } = messageWhatsapp;

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
  console.log(fileUrl);

  const file_name = document.createElement('p')

  const file_size = document.createElement('p')

  if (fileUrl) {
    let img = document.createElement("img");
    let btn = document.createElement("button");
    btn.classList.add("btn_download");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      downloadFile(fileUrl, file);
    })

    let namefile
    if (file?.name.length > 15) {
      namefile = file?.name.slice(0, 15).concat("...")
    } else {
      namefile = file?.name
    }
    if (file.type.match('image.*')) {
      img.src = fileUrl;

      file_name.innerHTML = namefile
      file_size.innerHTML = file?.size + " KБ"
    } else {
      file_name.innerHTML = namefile
      file_size.innerHTML = file?.size + " KБ"

      img.src = './icons/file-icon.svg'
    }
    img.classList.add("message_file_img");
    chatBody.append(img);
    chatBody.append(btn);
  } else {
    chatBody.textContent = chatMessage.value;
  }
  // file info
  const filename_abbr = document.createElement('abbr')
  filename_abbr.title = file.name
  filename_abbr.style.textDecoration = "none"

  filename_abbr.append(file_name)
  chatBody.append(filename_abbr)
  chatBody.append(file_size)

  chatItem.append(chatBody);
  // Append chat parts to chat item

  // Append chat item to chat interface
  chatInterface.appendChild(chatItem);

  // Clear inputs
  chatMessage.value = "";
}

let addFile = document.querySelector(".inputFile");
let selectedFile = document.querySelector(".selected-file");

addFile.addEventListener("change", function (e) {
  // if(addFile.files.length > 0){
  //   const file = addFile.files[0];
  //   console.log(file);
  // }
  let file = e.target.files[0];
  console.log(e.target.files)
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    messageFileUrl = reader.result;
    messageFile = file;
    showFile(file)
    // console.log(reader.result);
  }
});

function downloadFile(fileUrl, file) {
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

function sendFile(e) {
  e.preventDefault();
  sendChatMessageUser2(messageWhatsapp, messageFileUrl, messageFile);
  messageFileUrl = null;
  let div = document.querySelector(".selected_file");
  wrapper.removeChild(div);
}

const close_icon = document.createElement("span")

const wrap_span = document.createElement("div")

wrap_span.addEventListener("click", function () {
  let selected_file = document.querySelector(".selected_file");
  wrapper.removeChild(selected_file)
})
function showFile(fileLink) {
  let img = document.createElement("img");
  let fileBtn = document.createElement("button");
  console.log(fileLink);
  if (fileLink.type.match('image.*')) {
    let reader = new FileReader();
    reader.readAsDataURL(fileLink);
    reader.onload = function () {
      messageFileUrl = reader.result;
      messageFile = fileLink;
      img.src = messageFileUrl
    }
  } else {
    img.src = '/icons/file-icon.svg';
    img.onerror = function () {
      console.error("Failed to load the fallback image.");
    };
  }

  
  let div = document.createElement("div");
  const wrap_info = document.createElement('div')
  const info_file = document.createElement('div')
  info_file.className = "info_file"
  const name_file = document.createElement('p')

  const filename_abbr = document.createElement('abbr')
  filename_abbr.title = fileLink.name
  filename_abbr.style.textDecoration = "none"

  let namefile
    if (fileLink?.name.length > 15) {
      console.log(">");
      namefile = fileLink?.name.slice(0, 15).concat("...")
    } else {
      console.log("<");
      namefile = fileLink?.name
    }
    console.log(namefile);
  name_file.innerHTML = namefile
  const size_file = document.createElement('p')
  size_file.innerHTML = fileLink.size + " KБ"

  filename_abbr.append(name_file)
  info_file.append(filename_abbr)
  info_file.append(size_file)


  wrap_span.className = "wrap-span"
  close_icon.innerHTML = "✖"
  close_icon.classList = "close-selected-file"
  div.classList.add("selected_file");

  fileBtn.type = "button";
  fileBtn.value = "Отправить";
  fileBtn.innerText = "Отправить";
  fileBtn.classList.add("file-button");
  fileBtn.addEventListener("click", sendFile);
  // img.src = fileLink;
  img.classList.add("message_file_img");
  wrap_span.appendChild(close_icon);
  div.appendChild(wrap_span);
  div.appendChild(img);
  // div.appendChild(fileBtn);
  wrap_info.append(info_file)
  wrap_info.append(fileBtn)
  div.append(wrap_info)
  wrapper.appendChild(div);
}


let mediaRecorder;
let chunks = [];

const popover_audio = document.createElement("div")
popover_audio.className = "popover_audio"

const send_btn = document.createElement('button')
const send_icon = document.createElement('img')
send_icon.src = './icons/send-record.svg'

microphonButton.addEventListener("click", function () {
  console.log(mediaRecorder, "mediaRecorder");
  console.log(chunks, "chunks");
  wrapper.appendChild(popover_audio)
  if (mediaRecorder) return
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.start()
      console.log(stream, "stream");
      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data)
        console.log(e.data, 'e.data');
      };

      const recording = document.createElement("div")
      recording.className = "recording-wrap"
      const recording_icon = document.createElement('img')

      send_btn.append(send_icon)
      recording_icon.src = './icons/recording.svg'
      recording.appendChild(recording_icon)
      recording.appendChild(send_btn)
      popover_audio.appendChild(recording)


      mediaRecorder.onstop = function () {
        const chatBody = document.createElement("figcaption");
        // Create chat item & set styles
        const chatItem = document.createElement("figure");
        const chatInterface = document.querySelector(".chat-interface");
        const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' })
        const audioURL = window.URL.createObjectURL(blob)
        const audio = new Audio(audioURL)
        audio.controls = true
        wrapper.removeChild(popover_audio)
        chatBody.appendChild(audio)
        console.log(chatBody);
        chatItem.append(chatBody);
        recording.removeChild(recording_icon)
        // Append chat parts to chat item

        // Append chat item to chat interface
        chatInterface.appendChild(chatItem);
        mediaRecorder = null
        chunks = []
      }


    })

})

send_icon.addEventListener('click', function () {
  if (mediaRecorder) {
    mediaRecorder.stop();

  }
})






console.log(chunks, "chunks");