migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'UPDATE livros SET cdd = cod WHERE (cdd IS NULL OR cdd = "") AND cod IS NOT NULL AND cod != ""',
      )
      .execute()

    var col = app.findCollectionByNameOrId('livros')
    var codField = col.fields.getByName('cod')
    if (codField) {
      col.fields.removeById(codField.id)
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('livros')
    if (!col.fields.getByName('cod')) {
      col.fields.add(new TextField({ name: 'cod' }))
    }
    app.save(col)

    app
      .db()
      .newQuery(
        'UPDATE livros SET cod = cdd WHERE (cod IS NULL OR cod = "") AND cdd IS NOT NULL AND cdd != ""',
      )
      .execute()
  },
)
