onRecordViewRequest((e) => {
  e.next()

  try {
    var record = e.record
    if (!record) return

    var status = record.getString('status')
    if (status !== 'ativo') return

    var dataPrevista = record.getString('data_prevista_devolucao')
    if (!dataPrevista) return

    var now = new Date()
    var todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0')

    if (dataPrevista < todayStr) {
      record.set('status', 'atrasado')
      $app.saveNoValidate(record)
    }
  } catch (err) {
    $app.logger().error('status sync view failed', 'error', String(err))
  }
}, 'emprestimos')
