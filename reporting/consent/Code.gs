// Private Data Studio connector. No visitor-level data is available here.
var ENDPOINT = 'https://www.thewhitleycaptures.com/api/consent-summary';
function getAuthType() { return { type: 'KEY' }; }
function resetAuth() { PropertiesService.getUserProperties().deleteProperty('consentKey'); }
function fetchTotals(key, start, end) {
  return UrlFetchApp.fetch(ENDPOINT + '?start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end), {
    headers: { Authorization: 'Bearer ' + key }, muteHttpExceptions: true,
  });
}
function validKey(key) {
  if (!key) return false;
  var today = Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd');
  return fetchTotals(key, today, today).getResponseCode() === 200;
}
function isAuthValid() { return validKey(PropertiesService.getUserProperties().getProperty('consentKey')); }
function setCredentials(request) {
  if (!validKey(request.key)) return { errorCode: 'INVALID_CREDENTIALS' };
  PropertiesService.getUserProperties().setProperty('consentKey', request.key);
  return { errorCode: 'NONE' };
}
function getConfig() {
  return { configParams: [{ type: 'INFO', name: 'information', text: 'Daily button-choice totals only. Collection began 27 October 2026. Counts are not unique visitors. No Google Analytics consent is bypassed.' }], dateRangeRequired: true };
}
function fields() {
  var metrics = [['accepted', 'Accepted'], ['declined', 'Declined'], ['choices', 'Total choices']].map(function(pair) {
    return { name: pair[0], label: pair[1], dataType: 'NUMBER', defaultAggregationType: 'SUM', semantics: { conceptType: 'METRIC', semanticType: 'NUMBER', isReaggregatable: true } };
  });
  return [{ name: 'day', label: 'Date', dataType: 'STRING', semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY' } }].concat(metrics).concat([
    { name: 'acceptance_rate', label: 'Acceptance percentage', dataType: 'NUMBER', formula: 'SUM($accepted) / SUM($choices)', semantics: { conceptType: 'METRIC', semanticType: 'PERCENT' } },
  ]);
}
function getSchema() { return { schema: fields() }; }
function getData(request) {
  var response = fetchTotals(PropertiesService.getUserProperties().getProperty('consentKey'), request.dateRange.startDate, request.dateRange.endDate);
  if (response.getResponseCode() !== 200) {
    DataStudioApp.createCommunityConnector().newUserError().setText('Consent totals could not be refreshed. Check the connector key and choose a date range of at most one year.').throwException();
  }
  var requested = request.fields.map(function(field) { return field.name; });
  var schema = requested.map(function(name) { return fields().filter(function(field) { return field.name === name; })[0]; });
  var rows = JSON.parse(response.getContentText()).rows.map(function(row) {
    var values = { day: row.day.replace(/-/g, ''), accepted: row.accepted, declined: row.declined, choices: row.accepted + row.declined };
    return { values: requested.map(function(name) { return values[name]; }) };
  });
  return { schema: schema, rows: rows, filtersApplied: false };
}
function isAdminUser() { return false; }
