migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('emprestimos')
    const field = col.fields.getByName('quantidade_renovacoes')
    if (field) {
      col.fields.removeById(field.id)
    }
    col.fields.add(
      new NumberField({
        name: 'quantidade_renovacoes',
        required: false,
        onlyInt: true,
        min: 0,
      }),
    )
    app.save(col)

    app
      .db()
      .newQuery(
        'UPDATE emprestimos SET quantidade_renovacoes = 0 WHERE quantidade_renovacoes IS NULL',
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('emprestimos')
    const field = col.fields.getByName('quantidade_renovacoes')
    if (field) {
      col.fields.removeById(field.id)
    }
    col.fields.add(
      new NumberField({
        name: 'quantidade_renovacoes',
        required: true,
        onlyInt: true,
        min: 0,
      }),
    )
    app.save(col)
  },
)
