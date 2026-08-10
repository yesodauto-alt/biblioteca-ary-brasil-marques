migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('emprestimos')
    var field = col.fields.getByName('responsavel')
    if (field) {
      field.required = false
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('emprestimos')
    var field = col.fields.getByName('responsavel')
    if (field) {
      field.required = true
    }
    app.save(col)
  },
)
