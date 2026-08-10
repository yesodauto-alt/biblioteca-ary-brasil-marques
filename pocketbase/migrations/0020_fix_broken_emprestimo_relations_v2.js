migrate(
  (app) => {
    var emprestimos = app.findRecordsByFilter('emprestimos', '', '', 0, 0)
    var fixedCount = 0

    for (var i = 0; i < emprestimos.length; i++) {
      var emp = emprestimos[i]
      var empId = emp.id
      var respUserId = emp.getString('responsavel')
      var respVolId = emp.getString('responsavel_voluntario')

      if (respUserId) {
        var userExists = false
        try {
          app.findRecordById('_pb_users_auth_', respUserId)
          userExists = true
        } catch (_) {}

        if (!userExists) {
          app
            .db()
            .newQuery('UPDATE emprestimos SET responsavel = "" WHERE id = {:id}')
            .bind({ id: empId })
            .execute()
          console.log('FIX: Cleared broken responsavel for ' + empId + ' (was: ' + respUserId + ')')
          respUserId = ''
          fixedCount++
        }
      }

      if (respVolId) {
        var volExists = false
        try {
          app.findRecordById('voluntarios', respVolId)
          volExists = true
        } catch (_) {}

        if (!volExists) {
          var migrated = false
          if (respUserId) {
            try {
              var user = app.findRecordById('_pb_users_auth_', respUserId)
              var userMat = user.getString('matricula')
              if (userMat) {
                try {
                  var vol = app.findFirstRecordByData('voluntarios', 'matricula', userMat)
                  app
                    .db()
                    .newQuery(
                      'UPDATE emprestimos SET responsavel_voluntario = {:vid} WHERE id = {:id}',
                    )
                    .bind({ vid: vol.id, id: empId })
                    .execute()
                  console.log(
                    'FIX: Migrated responsavel_voluntario for ' +
                      empId +
                      ' to voluntario ' +
                      vol.id,
                  )
                  migrated = true
                  fixedCount++
                } catch (_) {}
              }
            } catch (_) {}
          }

          if (!migrated) {
            app
              .db()
              .newQuery('UPDATE emprestimos SET responsavel_voluntario = "" WHERE id = {:id}')
              .bind({ id: empId })
              .execute()
            console.log(
              'FIX: Cleared broken responsavel_voluntario for ' +
                empId +
                ' (was: ' +
                respVolId +
                ')',
            )
            fixedCount++
          }
        }
      }

      var leitorId = emp.getString('leitor')
      if (leitorId) {
        try {
          app.findRecordById('leitores', leitorId)
        } catch (_) {
          console.log('WARNING: emprestimo ' + empId + ' has broken leitor reference: ' + leitorId)
        }
      }

      var livroId = emp.getString('livro')
      if (livroId) {
        try {
          app.findRecordById('livros', livroId)
        } catch (_) {
          console.log('WARNING: emprestimo ' + empId + ' has broken livro reference: ' + livroId)
        }
      }
    }

    console.log('Migration 0020 complete: fixed ' + fixedCount + ' broken relation(s)')
  },
  (app) => {
    // Data cleanup is irreversible — no down migration
  },
)
