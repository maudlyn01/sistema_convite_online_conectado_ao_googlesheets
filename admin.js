const $ = (x) => document.getElementById(x);
let guests = JSON.parse(localStorage.getItem("rsvpGuests") || "[]");
let cfg = JSON.parse(localStorage.getItem("rsvpCfg") || "{}");
$("siteUrl").value = cfg.siteUrl || "";
$("sheetUrl").value = cfg.sheetUrl || "";
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
function link(g) {
  let base = (cfg.siteUrl || location.href.replace(/\/[^/]*$/, "")).replace(
    /\/$/,
    "",
  );
  return (
    base +
    "/convite.html?" +
    new URLSearchParams({
      id: g.id,
      nome: g.name,
      mesa: g.table,
      api: cfg.sheetUrl || "",
    })
  );
}
function render() {
  let q = $("search").value.toLowerCase();
  let data = guests.filter((g) => (g.name + g.table).toLowerCase().includes(q));
  $("list").innerHTML =
    data
      .map((g) => {
        let st =
          g.status === "Sim"
            ? '<span class="status ok">✓ Confirmado</span>'
            : g.status === "Não"
              ? '<span class="status not">✕ Não vai</span>'
              : '<span class="status wait">⏳ Pendente</span>';
        return `<tr><td>${esc(g.name)}</td><td>${esc(g.table)}</td><td>${st}</td><td>${g.date || "-"}</td><td><button class="small copy" onclick="copyLink(${g.id})">Copiar</button></td><td><button class="small del" onclick="del(${g.id})">Apagar</button></td></tr>`;
      })
      .join("") || '<tr><td colspan="6">Nenhum convidado.</td></tr>';
  let yes = guests.filter((g) => g.status === "Sim").length,
    no = guests.filter((g) => g.status === "Não").length;
  $("total").textContent = guests.length;
  $("yes").textContent = yes;
  $("no").textContent = no;
  $("pending").textContent = guests.length - yes - no;
}
$("guestForm").onsubmit = (e) => {
  e.preventDefault();
  guests.push({
    id: Date.now(),
    name: $("guestName").value.trim(),
    table: $("guestTable").value.trim(),
    status: "Pendente",
    date: "",
  });
  save();
  render();
  e.target.reset();
};
$("bulkAdd").onclick = () => {
  let n = 0,
    b = Date.now();
  $("bulkNames")
    .value.split("\n")
    .filter(Boolean)
    .forEach((x, i) => {
      let [name, ...r] = x.split("|"),
        table = r.join("|").trim();
      if (name?.trim() && table) {
        guests.push({
          id: b + i,
          name: name.trim(),
          table,
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
$("saveConfig").onclick = () => {
  cfg = {
    siteUrl: $("siteUrl").value.trim(),
    sheetUrl: $("sheetUrl").value.trim(),
  };
  localStorage.setItem("rsvpCfg", JSON.stringify(cfg));
  render();
  toast("Configuração guardada");
};
function copyLink(id) {
  let g = guests.find((x) => x.id === id);
  navigator.clipboard.writeText(link(g));
  toast("Link copiado!");
}
function del(id) {
  if (confirm("Apagar convidado?")) {
    guests = guests.filter((x) => x.id !== id);
    save();
    render();
  }
}
window.copyLink = copyLink;
window.del = del;
$("search").oninput = render;
$("clearAll").onclick = () => {
  if (confirm("Apagar todos?")) {
    guests = [];
    save();
    render();
  }
};
render();
