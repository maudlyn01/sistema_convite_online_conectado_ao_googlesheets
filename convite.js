const p = new URLSearchParams(location.search),
  name = p.get("nome") || "Convidado(a)",
  table = p.get("mesa") || "Mesa",
  id = p.get("id") || "";
  const API_URL = (`https://script.google.com/macros/s/AKfycbxNXvUqJWoZrDK1kuEdbNtHiZboeH5HoXLSamcvobRAS7QRlBRdBnhKWJBpZsVsnAzS/exec`)
  //api = p.get("api") || "";
for (const x of ["guestOverlay", "guestName"])
  document.getElementById(x).textContent = name;
for (const x of ["tableOverlay", "tableName"])
  document.getElementById(x).textContent = table;
document.getElementById("rsvpQuestion").textContent =
  `Olá, ${name}! Confirma a sua presença?`;
async function confirm(status) {
  const result = document.getElementById("rsvpResult");
  result.textContent = "A guardar a sua resposta...";
  result.className = "";
  const data = {
    id,
    nome: name,
    mesa: table,
    resposta: status,
    data: new Date().toLocaleString("pt-PT"),
  };
  if (!API_URL) {
    result.textContent = "Configuração pendente. Contacte os organizadores.";
    result.className = "error";
    return;
  }
  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    
    result.textContent =
      status === "Sim"
        ? "✓ Presença confirmada. Muito obrigado!"
        : "✓ A sua resposta foi registada. Obrigado por informar.";
    result.className = "success";
  } catch (e) {
    result.textContent = "Não foi possível guardar. Tente novamente.";
    result.className = "error";
  }
}
document.getElementById("yesBtn").onclick = () => confirm("Sim");
document.getElementById("noBtn").onclick = () => confirm("Não");
