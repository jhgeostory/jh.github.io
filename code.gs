function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var today = new Date();
  var dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  
  var row = getRowForDate(sheet, dateString);
  
  // B열: 통풍약, C열: 칼슘약
  var gout = sheet.getRange(row, 2).getValue();
  var calcium = sheet.getRange(row, 3).getValue();
  
  return ContentService.createTextOutput(JSON.stringify({
    date: dateString,
    gout: gout == "Taken" ? "Taken" : "Not Taken",
    calcium: calcium == "Taken" ? "Taken" : "Not Taken"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var today = new Date();
  var dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var row = getRowForDate(sheet, dateString);
  
  var params = {};
  try { params = JSON.parse(e.postData.contents); } catch(err) {}
  
  var type = params.type; // 'gout' or 'calcium'
  var col = (type == "calcium") ? 3 : 2;
  
  sheet.getRange(row, col).setValue("Taken");
  
  return ContentService.createTextOutput(JSON.stringify({result: "Success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRowForDate(sheet, dateString) {
  var lastRow = sheet.getLastRow();
  
  if (lastRow == 0) {
    sheet.appendRow(["Date", "Gout", "Calcium"]);
    sheet.appendRow([dateString, "Not Taken", "Not Taken"]);
    return 2;
  }
  
  if (lastRow == 1) { // Header only
    sheet.appendRow([dateString, "Not Taken", "Not Taken"]);
    return 2;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    var rowDate = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (rowDate == dateString) return i + 2;
  }
  
  sheet.appendRow([dateString, "Not Taken", "Not Taken"]);
  return sheet.getLastRow();
}

function checkReminders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var today = new Date();
  var hour = today.getHours();
  
  if (hour < 9 || hour > 22) return;
  
  var dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var row = getRowForDate(sheet, dateString);
  
  var gout = sheet.getRange(row, 2).getValue();
  var calcium = sheet.getRange(row, 3).getValue();
  var missing = [];
  
  if (gout != "Taken") missing.push("통풍약");
  if (calcium != "Taken") missing.push("칼슘약");
  
  if (missing.length > 0) sendEmail(missing);
}

function sendEmail(missing) {
  var email = Session.getActiveUser().getEmail();
  
  // 수정: 여기에 본인의 깃허브 페이지 주소를 입력하세요!
  // 예: "https://username.github.io/repository-name/"
  var frontendUrl = "YOUR_GITHUB_PAGE_URL_HERE"; 
  
  var body = "<h2>약 복용 알림</h2>" +
             "<p>아직 드시지 않은 약: <strong>" + missing.join(", ") + "</strong></p>" +
             "<p>지금 드셨다면 아래 링크를 눌러 체크해주세요.</p>" +
             "<a href='" + frontendUrl + "' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>체크하러 가기</a>";
             
  MailApp.sendEmail({
    to: email, 
    subject: "💊 약 복용 알림 (" + missing.join(", ") + ")", 
    htmlBody: body
  });
}
