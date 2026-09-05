const SHEET_ID = "12VgJ731e_wstBradDAAeRjvH4fUf9dYEPx0cYdy97BA";
const SHEET_NAME = "Confirmações — Bodas Lucas & Selfina";

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    sheet.appendRow([
      "ID",
      "Nome",
      "Mesa",
      "Resposta",
      "Data da Confirmação"
    ]);
  }

  return sheet;
}


// RECEBER CONFIRMAÇÕES DO CONVITE
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = getSheet();

    sheet.appendRow([
      data.id,
      data.nome,
      data.mesa,
      data.resposta,
      data.data
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Confirmação guardada com sucesso"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ENVIAR CONFIRMAÇÕES PARA O DASHBOARD
function doGet(e) {
  try {
    const sheet = getSheet();

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet
      .getRange(2, 1, lastRow - 1, 5)
      .getValues();

    const data = rows.map(row => ({
      id: String(row[0]),
      nome: row[1],
      mesa: row[2],
      resposta: row[3],
      data: row[4]
    }));

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}