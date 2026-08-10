migrate(
  (app) => {
    var configCol = app.findCollectionByNameOrId('configuracoes')

    if (!configCol.fields.getByName('fuso_horario')) {
      configCol.fields.add(new TextField({ name: 'fuso_horario' }))
    }
    app.save(configCol)

    var existing = app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
    if (existing.length > 0) {
      var rec = existing[0]
      if (!rec.getString('fuso_horario')) {
        rec.set('fuso_horario', 'America/Sao_Paulo')
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      var configCol = app.findCollectionByNameOrId('configuracoes')
      var f = configCol.fields.getByName('fuso_horario')
      if (f) configCol.fields.remove(f.id)
      app.save(configCol)
    } catch (_) {}
  },
)
