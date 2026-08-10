migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('matricula')) {
      usersCol.fields.add(new TextField({ name: 'matricula' }))
    }
    app.save(usersCol)

    try {
      usersCol.addIndex('idx_users_matricula', true, 'matricula', 'matricula != ""')
    } catch (_) {}
    app.save(usersCol)

    var users = app.findRecordsByFilter('users', '', 'created', 0, 0)
    var nextMatricula = 111
    for (var i = 0; i < users.length; i++) {
      if (!users[i].getString('matricula')) {
        users[i].set('matricula', String(nextMatricula))
        app.save(users[i])
        nextMatricula++
      }
    }
  },
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var field = usersCol.fields.getByName('matricula')
      if (field) {
        usersCol.fields.removeById(field.id)
      }
      usersCol.removeIndex('idx_users_matricula')
      app.save(usersCol)
    } catch (_) {}
  },
)
