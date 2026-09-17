const $ = (x) => document.getElementById(x);

// URLs fixas do sistema
const SITE_URL =
  "https://maudlyn01.github.io/sistema_convite_online_conectado_ao_googlesheets";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxp6TJ_BrBYSHHPflmeNguChPNna7OAPdkXhwGJslLqQsdrlGtPdcTfxtZhZnDxGf7A/exec";

let guests = JSON.parse(localStorage.getItem("rsvpGuests") || "[]");

let cfg = {
  siteUrl: SITE_URL,
  sheetUrl: SCRIPT_URL,
};

// Preenche automaticamente os campos
$("siteUrl").value = SITE_URL;

// Caso o campo sheetUrl exista no HTML
if ($("sheetUrl")) {
  $("sheetUrl").value = SCRIPT_URL;
}

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );

function save() {
  localStorage.setItem("rsvpGuests", JSON.stringify(guests));
}

function toast(s) {
  let t = $("toast");
  t.textContent = s;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// Gera link curto do convidado
function link(g) {
  return (
    SITE_URL +
    "/convite.html?" +
    new URLSearchParams({
      id: g.id,
      nome: g.name,
      mesa: g.table,
      pessoas: g.people || 1,
    })
  );
}
function editGuest(id) {
  const g = guests.find((x) => x.id === id);

  if (!g) return;

  $("guestName").value = g.name;
  $("guestTable").value = g.table;
  $("guestPeople").value = g.people || 1;

  $("guestForm").dataset.editingId = id;

  $("guestForm").querySelector("button").textContent = "Guardar alterações";
}

function render() {
  let q = $("search").value.toLowerCase();

  let data = guests.filter((g) =>
    (g.name + g.table).toLowerCase().includes(q),
  );

  $("list").innerHTML =
    data
      .map((g) => {
        let st =
          g.status === "Sim"
            ? '<span class="status ok">✓ Confirmado</span>'
            : g.status === "Não"
              ? '<span class="status not">✕ Não vai</span>'
              : '<span class="status wait">⏳ Pendente</span>';

        let people = g.people === 2
          ? "👥 2 pessoas"
          : "👤 1 pessoa";

        return `
          <tr>
            <td>${esc(g.name)}</td>
            <td>${esc(g.table)}</td>
            <td>${people}</td>
            <td>${st}</td>
            <td>${g.date || "-"}</td>
            <td>
              <button class="small copy" onclick="copyLink(${g.id})">
                Copiar
              </button>
            </td>
             <td>
              <button class="small edit" onclick="editGuest(${g.id})">
                Editar
              </button>
            </td>
            <td>
              <button class="small del" onclick="del(${g.id})">
                Apagar
              </button>
            </td>
            
          </tr>
        `;
      })
      .join("") ||
    '<tr><td colspan="8">Nenhum convidado.</td></tr>';

  let yes = guests.filter((g) => g.status === "Sim").length;
  let no = guests.filter((g) => g.status === "Não").length;

  $("total").textContent = guests.length;
  $("yes").textContent = yes;
  $("no").textContent = no;
  $("pending").textContent = guests.length - yes - no;
}

// Adicionar convidado
$("guestForm").onsubmit = (e) => {
  e.preventDefault();

  const form = e.target;

  const editingId = form.dataset.editingId;

  const name = $("guestName").value.trim();
  const table = $("guestTable").value.trim();
  const people = Number($("guestPeople").value) || 1;

  // =========================
  // EDITAR CONVIDADO
  // =========================
  if (editingId) {
    const guest = guests.find(
      (g) => String(g.id) === String(editingId)
    );

    if (!guest) {
      toast("Convidado não encontrado");
      return;
    }

    guest.name = name;
    guest.table = table;
    guest.people = people;

    save();
    render();

    delete form.dataset.editingId;

    form.querySelector("button").textContent = "Adicionar convidado";

    form.reset();

    $("guestPeople").value = 1;

    toast("Convidado atualizado!");

    return;
  }

  // =========================
  // ADICIONAR NOVO CONVIDADO
  // =========================
  guests.push({
    id: Date.now(),
    name: name,
    table: table,
    people: people,
    status: "Pendente",
    date: "",
  });

  save();
  render();

  form.reset();

  $("guestPeople").value = 1;

  toast(
    people === 2
      ? "Convidado para 2 pessoas adicionado"
      : "Convidado para 1 pessoa adicionado"
  );
};




// Adicionar vários convidados
$("bulkAdd").onclick = () => {
  let n = 0;
  let b = Date.now();

  $("bulkNames")
    .value.split("\n")
    .map(x => x.trim())
    .filter(Boolean)
    .forEach((x, i) => {
      let [name, table, people] = x.split("|").map(v => v.trim());

      // Se não informar pessoas, assume 1
      people = people === "2" ? 2 : 1;

      if (name && table) {
        guests.push({
          id: b + i,
          name,
          table,
          people,
          status: "Pendente",
          date: "",
        });

        n++;
      }
    });

  save();
  render();
  toast(n + " convidados adicionados");
};

// Guardar configuração
$("saveConfig").onclick = () => {
  // Mantém as URLs fixas
  cfg = {
    siteUrl: SITE_URL,
    sheetUrl: SCRIPT_URL,
  };

  localStorage.setItem("rsvpCfg", JSON.stringify(cfg));

  toast("Configuração guardada");
};

// Copiar link
function copyLink(id) {
  let g = guests.find((x) => x.id === id);

  navigator.clipboard.writeText(link(g));

  toast("Link copiado!");
}

// Apagar convidado
function del(id) {
  if (confirm("Apagar convidado?")) {
    guests = guests.filter((x) => x.id !== id);
    save();
    render();
  }
}


window.copyLink = copyLink;
window.del = del;
window.editGuest = editGuest;

$("search").oninput = render;

$("clearAll").onclick = () => {
  if (confirm("Apagar todos?")) {
    guests = [];
    save();
    render();
  }
};

render();