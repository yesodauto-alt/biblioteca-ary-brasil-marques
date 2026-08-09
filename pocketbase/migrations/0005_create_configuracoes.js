migrate(
  (app) => {
    var configCol = new Collection({
      name: 'configuracoes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'prazo_devolucao_dias', type: 'number', required: true, onlyInt: true },
        { name: 'limite_renovacoes', type: 'number', required: true, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(configCol)

    var count = app.countRecords('configuracoes')
    if (count === 0) {
      var col = app.findCollectionByNameOrId('configuracoes')
      var record = new Record(col)
      record.set('prazo_devolucao_dias', 15)
      record.set('limite_renovacoes', 2)
      app.save(record)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('configuracoes'))
    } catch (_) {}
  },
)
