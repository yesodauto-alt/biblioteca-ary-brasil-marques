onRecordListRequest((e) => {
  e.next()

  try {
    var records = null
    if (e.records) {
      records = e.records
    } else if (e.result && e.result.items) {
      records = e.result.items
    }

    if (!records || !records.length) return

    var now = new Date()
    var todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0')

    for (var i = 0; i < records.length; i++) {
      var record = records[i]
      var status = record.getString('status')
      if (status !== 'ativo') continue

      var dataPrevista = record.getString('data_prevista_devolucao')
      if (!dataPrevista) continue

      if (dataPrevista < todayStr) {
        record.set('status', 'atrasado')
        $app.saveNoValidate(record)
      }
    }
  } catch (err) {
    $app.logger().error('status sync list failed', 'error', String(err))
  }
}, 'emprestimos')
