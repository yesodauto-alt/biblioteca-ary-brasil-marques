onRecordCreateRequest((e) => {
  var qtd = e.record.get('quantidade_renovacoes')
  if (qtd === null || qtd === undefined || qtd === '') {
    e.record.set('quantidade_renovacoes', 0)
  }
  e.next()
}, 'emprestimos')
