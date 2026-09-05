// GOOGLE APPS SCRIPT — guardar confirmações no Google Sheets
// 1. Crie uma Google Sheet.
// 2. Extensions > Apps Script.
// 3. Cole este código.
// 4. Substitua SHEET_ID pelo ID da sua planilha.
// 5. Deploy > New deployment > Web app.
// 6. Execute as: Me | Who has access: Anyone.
// 7. Copie a URL /exec para o painel do convite.

const SHEET_ID = `https://docs.google.com/spreadsheets/d/12VgJ731e_wstBradDAAeRjvH4fUf9dYEPx0cYdy97BA/edit?gid=0#gid=0`;
const SHEET_NAME = 'Confirmações';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
    || SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Nome', 'Mesa', 'Resposta', 'Data da Confirmação']);
  }

  sheet.appendRow([
    data.id,
    data.nome,
    data.mesa,
    data.resposta,
    data.data
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({success:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
