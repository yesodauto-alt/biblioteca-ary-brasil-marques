migrate(
  (app) => {
    var voluntariosCol = new Collection({
      name: 'voluntarios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'matricula', type: 'text', required: true },
        { name: 'nome', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_voluntarios_matricula ON voluntarios (matricula)',
        'CREATE INDEX idx_voluntarios_status ON voluntarios (status)',
        'CREATE INDEX idx_voluntarios_nome ON voluntarios (nome)',
      ],
    })
    app.save(voluntariosCol)

    var users = app.findRecordsByFilter('users', '', 'created', 0, 0)
    var userIdToVolId = {}
    var volCol = app.findCollectionByNameOrId('voluntarios')
    var nextMat = 111
    for (var u = 0; u < users.length; u++) {
      var m = parseInt(users[u].getString('matricula'), 10)
      if (!isNaN(m) && m >= nextMat) nextMat = m + 1
    }
    for (var i = 0; i < users.length; i++) {
      var user = users[i]
      var matricula = user.getString('matricula')
      if (!matricula) {
        matricula = String(nextMat)
        nextMat++
      }
      var volRec = new Record(volCol)
      volRec.set('matricula', matricula)
      volRec.set('nome', user.getString('name') || 'Sem nome')
      volRec.set('status', user.getString('status') === 'inativo' ? 'inativo' : 'ativo')
      app.save(volRec)
      userIdToVolId[user.id] = volRec.id
    }

    var auditCol = app.findCollectionByNameOrId('auditoria')
    if (!auditCol.fields.getByName('voluntario')) {
      auditCol.fields.add(
        new RelationField({
          name: 'voluntario',
          collectionId: app.findCollectionByNameOrId('voluntarios').id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(auditCol)

    var audits = app.findRecordsByFilter('auditoria', '', '', 0, 0)
    for (var a = 0; a < audits.length; a++) {
      var auditUserId = audits[a].getString('usuario')
      if (auditUserId && userIdToVolId[auditUserId]) {
        app
          .db()
          .newQuery('UPDATE auditoria SET voluntario = {:vid} WHERE id = {:aid}')
          .bind({ vid: userIdToVolId[auditUserId], aid: audits[a].id })
          .execute()
      }
    }

    var emprestimos = app.findRecordsByFilter('emprestimos', '', '', 0, 0)
    var empRespMap = {}
    for (var e1 = 0; e1 < emprestimos.length; e1++) {
      empRespMap[emprestimos[e1].id] = emprestimos[e1].getString('responsavel')
    }

    var empCol = app.findCollectionByNameOrId('emprestimos')
    if (!empCol.fields.getByName('responsavel_voluntario')) {
      empCol.fields.add(
        new RelationField({
          name: 'responsavel_voluntario',
          collectionId: app.findCollectionByNameOrId('voluntarios').id,
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(empCol)

    for (var e2 = 0; e2 < emprestimos.length; e2++) {
      var empId = emprestimos[e2].id
      var oldUserId = empRespMap[empId]
      if (oldUserId && userIdToVolId[oldUserId]) {
        app
          .db()
          .newQuery('UPDATE emprestimos SET responsavel_voluntario = {:vid} WHERE id = {:eid}')
          .bind({ vid: userIdToVolId[oldUserId], eid: empId })
          .execute()
      }
    }
  },
  (app) => {
    try {
      var empCol = app.findCollectionByNameOrId('emprestimos')
      var rvf = empCol.fields.getByName('responsavel_voluntario')
      if (rvf) empCol.fields.removeById(rvf.id)
      app.save(empCol)
    } catch (_) {}
    try {
      var ac = app.findCollectionByNameOrId('auditoria')
      var vf = ac.fields.getByName('voluntario')
      if (vf) ac.fields.removeById(vf.id)
      app.save(ac)
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('voluntarios'))
    } catch (_) {}
  },
)
