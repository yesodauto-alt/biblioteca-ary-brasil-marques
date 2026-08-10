migrate(
  (app) => {
    app
      .db()
      .newQuery(
        'UPDATE livros SET cod = localizacao_fisica WHERE (cod IS NULL OR cod = "") AND localizacao_fisica IS NOT NULL AND localizacao_fisica != ""',
      )
      .execute()

    const col = app.findCollectionByNameOrId('livros')
    const field = col.fields.getByName('localizacao_fisica')
    if (field) {
      col.fields.removeById(field.id)
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('livros')
    if (!col.fields.getByName('localizacao_fisica')) {
      col.fields.add(new TextField({ name: 'localizacao_fisica' }))
    }
    app.save(col)
  },
)
