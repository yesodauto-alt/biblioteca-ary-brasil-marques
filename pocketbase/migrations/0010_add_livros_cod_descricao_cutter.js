migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('livros')

    if (!col.fields.getByName('cod')) {
      col.fields.add(new TextField({ name: 'cod' }))
    }
    if (!col.fields.getByName('descricao')) {
      col.fields.add(new TextField({ name: 'descricao' }))
    }
    if (!col.fields.getByName('cutter')) {
      col.fields.add(new TextField({ name: 'cutter' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('livros')

    const codField = col.fields.getByName('cod')
    if (codField) col.fields.remove(codField.id)

    const descField = col.fields.getByName('descricao')
    if (descField) col.fields.remove(descField.id)

    const cutterField = col.fields.getByName('cutter')
    if (cutterField) col.fields.remove(cutterField.id)

    app.save(col)
  },
)
