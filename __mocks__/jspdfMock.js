const jsPDF = jest.fn().mockImplementation(() => ({
  save: jest.fn(),
  text: jest.fn(),
  addPage: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  addImage: jest.fn(),
}));

module.exports = { default: jsPDF, jsPDF };
