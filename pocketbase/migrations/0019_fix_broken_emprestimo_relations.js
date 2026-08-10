migrate(
  (app) => {
    var emprestimos = app.findRecordsByFilter('emprestimos', '', '', 0, 0)

    for (var i = 0; i < emprestimos.length; i++) {
      var emp = emprestimos[i]
      var empId = emp.id

      var leitorId = emp.getString('leitor')
      var livroId = emp.getString('livro')
      var respUserId = emp.getString('responsavel')
      var respVolId = emp.getString('responsavel_voluntario')

      if (empId === 'jg2d8sbr82zkvso') {
        console.log(
          'INSPECTION jg2d8sbr82zkvso: leitor=' +
            leitorId +
            ', livro=' +
            livroId +
            ', responsavel=' +
            respUserId +
            ', responsavel_voluntario=' +
            respVolId,
        )
      }

      if (respVolId) {
        var volExists = false
        try {
          app.findRecordById('voluntarios', respVolId)
          volExists = true
        } catch (_) {}

        if (!volExists) {
          app
            .db()
            .newQuery('UPDATE emprestimos SET responsavel_voluntario = "" WHERE id = {:id}')
            .bind({ id: empId })
            .execute()
          console.log(
            'FIX: Cleared broken responsavel_voluntario for emprestimo ' +
              empId +
              ' (was: ' +
              respVolId +
              ')',
          )
          respVolId = ''
        }
      }

      if (!respVolId && respUserId) {
        var userExists = false
        try {
          var user = app.findRecordById('_pb_users_auth_', respUserId)
          userExists = true
          var userMat = user.getString('matricula')
          if (userMat) {
            try {
              var vol = app.findFirstRecordByData('voluntarios', 'matricula', userMat)
              app
                .db()
                .newQuery('UPDATE emprestimos SET responsavel_voluntario = {:vid} WHERE id = {:id}')
                .bind({ vid: vol.id, id: empId })
                .execute()
              console.log(
                'FIX: Migrated responsavel_voluntario for emprestimo ' +
                  empId +
                  ' to voluntario ' +
                  vol.id,
              )
              respVolId = vol.id
            } catch (_) {
              console.log(
                'INFO: No matching voluntario for user matricula ' +
                  userMat +
                  ' on emprestimo ' +
                  empId,
              )
            }
          }
        } catch (_) {}

        if (!userExists) {
          app
            .db()
            .newQuery('UPDATE emprestimos SET responsavel = "" WHERE id = {:id}')
            .bind({ id: empId })
            .execute()
          console.log(
            'FIX: Cleared broken responsavel for emprestimo ' +
              empId +
              ' (was: ' +
              respUserId +
              ')',
          )
        }
      }

      if (leitorId) {
        try {
          app.findRecordById('leitores', leitorId)
        } catch (_) {
          console.log('WARNING: emprestimo ' + empId + ' has broken leitor reference: ' + leitorId)
        }
      }

      if (livroId) {
        try {
          app.findRecordById('livros', livroId)
        } catch (_) {
          console.log('WARNING: emprestimo ' + empId + ' has broken livro reference: ' + livroId)
        }
      }
    }
  },
  (app) => {
    // Data cleanup is irreversible — no down migration
  },
)
