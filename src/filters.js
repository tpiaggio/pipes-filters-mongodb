function joinWordsFilter(object) {
  return Object.values(object).join(' ');
}
function toUpperCaseFilter(message) {
  return message[0].toUpperCase() + message.slice(1);
}
function addFullStopFilter(message) {
  return `${message}.`;
}
function trimFilter(message) {
  return message.trim();
}

module.exports = { joinWordsFilter, toUpperCaseFilter, addFullStopFilter, trimFilter };