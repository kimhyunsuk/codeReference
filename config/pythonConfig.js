var typoOptions = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: './referenceSource/ml/typosentence',
    args: []
};
var formLabelMappingOptions = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: './ml/FormLabelMapping',
    args: []
};
var formMappingOptions = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: './ml/FormMapping',
    args: []
};
var columnMappingOptions = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: './referenceSource/ml/ColumnMapping',
    args: []
};
module.exports = {
    typoOptions: typoOptions,
    formLabelMappingOptions: formLabelMappingOptions,
    formMappingOptions: formMappingOptions,
    columnMappingOptions: columnMappingOptions

};
