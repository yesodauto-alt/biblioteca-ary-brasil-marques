onRecordCreateRequest((e) => {
  if (e.record.getString('numero_cadastro')) {
    e.next()
    return
  }

  try {
    var records = $app.findRecordsByFilter('leitores', "numero_cadastro != ''", '', 0, 0)
    var maxNum = 0
    for (var i = 0; i < records.length; i++) {
      var n = parseInt(records[i].getString('numero_cadastro'), 10)
      if (!isNaN(n) && n > maxNum) {
        maxNum = n
      }
    }
    e.record.set('numero_cadastro', String(maxNum + 1))
  } catch (err) {
    $app.logger().error('Failed to auto-assign numero_cadastro', 'error', String(err))
  }

  e.next()
}, 'leitores')
