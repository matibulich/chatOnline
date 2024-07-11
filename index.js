import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const form = document.querySelector("form");
const input = document.querySelector("input");
const template = document.querySelector("#mensaje_template");
const mensajes = document.querySelector("#mensaje_lista");
const container = document.querySelector("main");
const button = document.querySelector("button");
const textoCarga = document.querySelector("small");

const MODEL_SELECTED = "Llama-3-8B-Instruct-q4f32_1-MLC-1k";

let messages = [];

const engine = await CreateMLCEngine(MODEL_SELECTED, {
  initProgressCallback: (info) => {
    console.log("Cargando modelo", info);
    textoCarga.textContent = info.text;
    if (info.progress === 1) {
      button.removeAttribute("disabled");
    }
  },
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensaje = input.value.trim();

  if (mensaje !== "") {
    input.value = "";
    agregarMensaje(mensaje, "usuario");

    const userMessage = {
      role: "user",
      content: mensaje
    }

    messages.push(userMessage)

    try {
      const chunks = await engine.chat.completions.create({
         messages,
         stream: true
      });

      let respuesta = ""

      const botMessage = agregarMensaje("", "bot")

      for await (const chunk of chunks){
        const choice = chunk.choices[0]
        const content = choice?.delta?.content ?? ""
        respuesta += content
        botMessage.textContent = respuesta
      }

      console.log("Respuesta obtenida:", respuesta);

      
       messages.push({
        role:"assistant",
        content: respuesta
       })
      
             
    } catch (error) {
      console.error("Error al obtener la respuesta:", error);
      agregarMensaje("Error: No se pudo obtener una respuesta del modelo.", "bot");


    }



   
  }

});

// --------definicion de funciones-----
function agregarMensaje(texto, sender) {
  const templateClone = template.content.cloneNode(true);
  const nuevoMensaje = templateClone.querySelector(".mensaje");

  const who = nuevoMensaje.querySelector(".who");
  const text = nuevoMensaje.querySelector(".text");

  who.textContent = sender === "bot" ? "Bot" : "Tú";
  text.textContent = texto;

  nuevoMensaje.classList.add(sender);

  mensajes.appendChild(nuevoMensaje);
  container.scrollTop = container.scrollHeight;
  return text
}
