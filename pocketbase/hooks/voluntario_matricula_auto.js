onRecordCreateRequest((e) => {
  if (e.record.getString('matricula')) {
    e.next()
    return
  }

  try {
    var records = $app.findRecordsByFilter('voluntarios', "matricula != ''", '', 0, 0)
    var maxMatricula = 110
    for (var i = 0; i < records.length; i++) {
      var m = parseInt(records[i].getString('matricula'), 10)
      if (!isNaN(m) && m > maxMatricula) {
        maxMatricula = m
      }
    }
    e.record.set('matricula', String(maxMatricula + 1))
  } catch (err) {
    $app.logger().error('Failed to auto-assign voluntario matricula', 'error', String(err))
  }

  e.next()
}, 'voluntarios')
