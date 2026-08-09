migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('status')) {
      usersCol.fields.add(
        new SelectField({
          name: 'status',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        }),
      )
    }

    usersCol.listRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    usersCol.viewRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    usersCol.createRule = "@request.auth.role = 'administrador'"
    usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    usersCol.deleteRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    app.save(usersCol)

    try {
      var adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'camilimag@gmail.com')
      if (!adminUser.getString('status')) {
        adminUser.set('status', 'ativo')
        app.save(adminUser)
      }
    } catch (_) {}

    var configCol = app.findCollectionByNameOrId('configuracoes')

    configCol.listRule = "@request.auth.role = 'administrador'"
    configCol.viewRule = "@request.auth.role = 'administrador'"
    configCol.createRule = "@request.auth.role = 'administrador'"
    configCol.updateRule = "@request.auth.role = 'administrador'"
    configCol.deleteRule = "@request.auth.role = 'administrador'"

    if (!configCol.fields.getByName('limite_livros_por_usuario')) {
      configCol.fields.add(
        new NumberField({ name: 'limite_livros_por_usuario', required: true, onlyInt: true }),
      )
    }
    if (!configCol.fields.getByName('nome_biblioteca')) {
      configCol.fields.add(new TextField({ name: 'nome_biblioteca', required: true }))
    }
    if (!configCol.fields.getByName('telefone')) {
      configCol.fields.add(new TextField({ name: 'telefone' }))
    }
    if (!configCol.fields.getByName('email')) {
      configCol.fields.add(new TextField({ name: 'email' }))
    }
    if (!configCol.fields.getByName('informacoes_institucionais')) {
      configCol.fields.add(new TextField({ name: 'informacoes_institucionais' }))
    }
    app.save(configCol)

    var count = app.countRecords('configuracoes')
    if (count === 0) {
      var record = new Record(configCol)
      record.set('prazo_devolucao_dias', 15)
      record.set('limite_renovacoes', 2)
      record.set('limite_livros_por_usuario', 3)
      record.set('nome_biblioteca', 'Biblioteca do Centro Espírita')
      record.set('telefone', '')
      record.set('email', '')
      record.set('informacoes_institucionais', '')
      app.save(record)
    } else {
      var existing = app.findRecordsByFilter('configuracoes', "id != ''", '', 1, 0)
      if (existing.length > 0) {
        var rec = existing[0]
        if (!rec.get('limite_livros_por_usuario')) rec.set('limite_livros_por_usuario', 3)
        if (!rec.get('nome_biblioteca')) rec.set('nome_biblioteca', 'Biblioteca do Centro Espírita')
        if (!rec.get('telefone')) rec.set('telefone', '')
        if (!rec.get('email')) rec.set('email', '')
        if (!rec.get('informacoes_institucionais')) rec.set('informacoes_institucionais', '')
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      var configCol = app.findCollectionByNameOrId('configuracoes')
      configCol.listRule = "@request.auth.id != ''"
      configCol.viewRule = "@request.auth.id != ''"
      configCol.createRule = "@request.auth.id != ''"
      configCol.updateRule = "@request.auth.id != ''"
      configCol.deleteRule = "@request.auth.id != ''"
      var fieldsToRemove = [
        'limite_livros_por_usuario',
        'nome_biblioteca',
        'telefone',
        'email',
        'informacoes_institucionais',
      ]
      for (var i = 0; i < fieldsToRemove.length; i++) {
        var f = configCol.fields.getByName(fieldsToRemove[i])
        if (f) configCol.fields.remove(f.id)
      }
      app.save(configCol)
    } catch (_) {}

    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      usersCol.listRule = 'id = @request.auth.id'
      usersCol.viewRule = 'id = @request.auth.id'
      usersCol.createRule = ''
      usersCol.updateRule = 'id = @request.auth.id'
      usersCol.deleteRule = 'id = @request.auth.id'
      var statusField = usersCol.fields.getByName('status')
      if (statusField) usersCol.fields.remove(statusField.id)
      app.save(usersCol)
    } catch (_) {}
  },
)
